/**
 * Utilitaires de pré-traitement d'image pour améliorer la qualité OCR
 */

export interface ProcessingOptions {
  enhanceContrast?: boolean;
  autoRotate?: boolean;
  autoCrop?: boolean;
  sharpen?: boolean;
  maxDimension?: number;
}

/**
 * Pré-traite une image pour améliorer la précision OCR
 */
export async function preprocessImage(
  file: File,
  options: ProcessingOptions = {}
): Promise<string> {
  const {
    enhanceContrast = true,
    autoRotate = true,
    autoCrop = true,
    sharpen = true,
    maxDimension = 2048,
  } = options;

  // Charger l'image
  const img = await loadImage(file);
  
  // Créer un canvas de travail
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) throw new Error('Cannot get canvas context');

  // Redimensionner si nécessaire
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Appliquer les traitements
  if (enhanceContrast) {
    canvas = applyContrastEnhancement(canvas);
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  }

  if (sharpen) {
    canvas = applySharpen(canvas);
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  }

  if (autoRotate) {
    canvas = await detectAndCorrectRotation(canvas);
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  }

  if (autoCrop) {
    canvas = detectAndCropDocument(canvas);
  }

  // Convertir en base64
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Charge une image depuis un File
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Améliore le contraste de l'image
 */
function applyContrastEnhancement(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Calculer l'histogramme
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    histogram[Math.floor(avg)]++;
  }

  // Trouver les valeurs min et max (ignorer les 2% extrêmes)
  const totalPixels = canvas.width * canvas.height;
  const threshold = totalPixels * 0.02;
  
  let min = 0, max = 255;
  let count = 0;
  
  for (let i = 0; i < 256; i++) {
    count += histogram[i];
    if (count > threshold && min === 0) min = i;
  }
  
  count = 0;
  for (let i = 255; i >= 0; i--) {
    count += histogram[i];
    if (count > threshold && max === 255) max = i;
  }

  // Appliquer l'étalement d'histogramme
  const range = max - min;
  if (range > 0) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, ((data[i] - min) * 255) / range));
      data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - min) * 255) / range));
      data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - min) * 255) / range));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Applique un filtre de netteté
 */
function applySharpen(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // Noyau de netteté
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  const output = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += data[pixelIndex] * kernel[kernelIndex];
          }
        }
        const outputIndex = (y * width + x) * 4 + c;
        output[outputIndex] = Math.min(255, Math.max(0, sum));
      }
    }
  }

  const newImageData = new ImageData(output, width, height);
  ctx.putImageData(newImageData, 0, 0);
  return canvas;
}

/**
 * Détecte et corrige la rotation de l'image
 */
async function detectAndCorrectRotation(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  // Convertir en niveaux de gris
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const grayData = new Uint8Array(canvas.width * canvas.height);

  for (let i = 0; i < data.length; i += 4) {
    grayData[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  // Détecter les bords avec Sobel
  const edges = detectEdges(grayData, canvas.width, canvas.height);
  
  // Trouver l'angle dominant avec transformée de Hough
  const angle = detectDominantAngle(edges, canvas.width, canvas.height);

  // Si l'angle est significatif (> 1°), corriger
  if (Math.abs(angle) > 1) {
    return rotateCanvas(canvas, angle);
  }

  return canvas;
}

/**
 * Détecte les bords dans l'image
 */
function detectEdges(grayData: Uint8Array, width: number, height: number): Uint8Array {
  const edges = new Uint8Array(width * height);
  
  // Opérateur de Sobel
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += grayData[idx] * sobelX[kernelIdx];
          gy += grayData[idx] * sobelY[kernelIdx];
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }

  return edges;
}

/**
 * Détecte l'angle dominant dans l'image
 */
function detectDominantAngle(edges: Uint8Array, width: number, height: number): number {
  const threshold = 100;
  const angleSteps = 180;
  const votes = new Array(angleSteps).fill(0);

  // Échantillonner les pixels de bord
  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      if (edges[y * width + x] > threshold) {
        // Pour chaque pixel de bord, voter pour tous les angles possibles
        for (let theta = 0; theta < angleSteps; theta++) {
          votes[theta]++;
        }
      }
    }
  }

  // Trouver les pics dans l'histogramme des angles
  let maxVotes = 0;
  let dominantAngle = 0;

  for (let i = 5; i < angleSteps - 5; i++) {
    const localMax = votes[i] > votes[i - 1] && votes[i] > votes[i + 1];
    if (localMax && votes[i] > maxVotes) {
      maxVotes = votes[i];
      dominantAngle = i;
    }
  }

  // Convertir en angle réel (centré sur 0)
  let angle = dominantAngle - 90;
  
  // Limiter à ±15 degrés
  if (angle > 15) angle = 15;
  if (angle < -15) angle = -15;

  return angle;
}

/**
 * Fait pivoter un canvas
 */
function rotateCanvas(canvas: HTMLCanvasElement, angle: number): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Calculer les nouvelles dimensions
  const newWidth = Math.abs(canvas.width * cos) + Math.abs(canvas.height * sin);
  const newHeight = Math.abs(canvas.width * sin) + Math.abs(canvas.height * cos);

  const newCanvas = document.createElement('canvas');
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  const newCtx = newCanvas.getContext('2d');
  
  if (!newCtx) return canvas;

  // Centrer et pivoter
  newCtx.translate(newWidth / 2, newHeight / 2);
  newCtx.rotate(rad);
  newCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  return newCanvas;
}

/**
 * Détecte et recadre le document dans l'image
 */
function detectAndCropDocument(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convertir en niveaux de gris et binariser
  const threshold = 128;
  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  let foundContent = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      // Si le pixel est sombre (probablement du texte ou des bords)
      if (gray < threshold) {
        foundContent = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!foundContent) return canvas;

  // Ajouter une marge de 5%
  const marginX = (maxX - minX) * 0.05;
  const marginY = (maxY - minY) * 0.05;

  minX = Math.max(0, minX - marginX);
  maxX = Math.min(canvas.width, maxX + marginX);
  minY = Math.max(0, minY - marginY);
  maxY = Math.min(canvas.height, maxY + marginY);

  const width = maxX - minX;
  const height = maxY - minY;

  // Vérifier que le recadrage est significatif
  const cropRatio = (width * height) / (canvas.width * canvas.height);
  if (cropRatio < 0.3 || cropRatio > 0.95) {
    // Recadrage trop agressif ou pas assez, garder l'original
    return canvas;
  }

  // Créer un nouveau canvas avec la zone recadrée
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = width;
  croppedCanvas.height = height;
  const croppedCtx = croppedCanvas.getContext('2d');
  
  if (!croppedCtx) return canvas;

  croppedCtx.drawImage(
    canvas,
    minX, minY, width, height,
    0, 0, width, height
  );

  return croppedCanvas;
}
