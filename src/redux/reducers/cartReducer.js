import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_QUANTITY_LIMIT = 1000; // Maximum quantity per item

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    deliveryInstructions: '', // <-- New
  },
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item =>
        item.id === newItem.id && item.category === newItem.category
      );
      
     
      if (existingItemIndex > -1) {
        // If item exists, update its quantity with limit
        const currentQuantity = state.items[existingItemIndex].quantity;
        const newQuantity = Math.min(currentQuantity + (newItem.quantity || 1), MAX_QUANTITY_LIMIT);
        state.items[existingItemIndex].quantity = newQuantity;
      } else {
        // If item doesn't exist, add it to cart
        state.items.push({
          ...newItem,
          quantity: newItem.quantity || 1
        });
      }

      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

      // Save to AsyncStorage
      AsyncStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      const { id, quantityType } = action.payload;
     
      state.items = state.items.filter(
        item => !(item.id === id && item.variant?.quantity_type === quantityType)
      );
    
      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
      AsyncStorage.setItem('cartItems', JSON.stringify(state.items));
    },    
    updateQuantity: (state, action) => {
      const { id, quantity, quantityType } = action.payload;
      const itemIndex = state.items.findIndex(
        item => item.id === id && item.variant?.quantity_type === quantityType
      );
      if (itemIndex > -1) {
        // Ensure quantity is within limits
        state.items[itemIndex].quantity = Math.min(Math.max(quantity, 1), MAX_QUANTITY_LIMIT);

        // Recalculate totals
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
        state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Save to AsyncStorage
        AsyncStorage.setItem('cartItems', JSON.stringify(state.items));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;

      // Remove from AsyncStorage
      AsyncStorage.removeItem('cartItems');
    },
    loadCartFromStorage: (state, action) => {
      state.items = action.payload || [];

      // Recalculate totals
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    setDeliveryInstructions: (state, action) => {
      state.deliveryInstructions = action.payload;
      // Optional: persist to AsyncStorage if needed
      // AsyncStorage.setItem('deliveryInstructions', action.payload);
    },
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCartFromStorage,
  setDeliveryInstructions,
} = cartSlice.actions;

export default cartSlice.reducer; 