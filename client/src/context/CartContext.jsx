import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const getCart = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      if (data.success) {
        setCart(data.cart || { items: [] });
      }
    } catch (err) {
      console.error('Failed to get cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getCart();
    } else {
      setCart({ items: [] });
    }
  }, [isAuthenticated]);

  const addToCart = async (productId, qty, color, material, price) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to cart' };
    }
    try {
      const { data } = await api.post('/cart', { productId, qty, color, material, price });
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart',
      };
    }
  };

  const updateCartItem = async (itemId, qty) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { qty });
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update item quantity',
      };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item',
      };
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete('/cart');
      if (data.success) {
        setCart(data.cart);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart',
      };
    }
  };

  const cartCount = cart.items.reduce((total, item) => total + item.qty, 0);
  const cartSubtotal = cart.items.reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartSubtotal,
        getCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
