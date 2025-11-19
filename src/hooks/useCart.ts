import { useState, useEffect } from 'react';
import { MarketplaceItem } from '@/types/gh2';

interface CartItem extends MarketplaceItem {
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('gh2-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem('gh2-cart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (item: MarketplaceItem, quantity: number = 1) => {
    const existingItem = cart.find((i) => i.id === item.id);
    
    if (existingItem) {
      const updatedCart = cart.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
      );
      saveCart(updatedCart);
    } else {
      saveCart([...cart, { ...item, quantity }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    saveCart(cart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    saveCart(updatedCart);
  };

  const clearCart = () => {
    localStorage.removeItem('gh2-cart');
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
}
