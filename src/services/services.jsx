import axios from 'axios';
import { panGestureHandlerCustomNativeProps } from 'react-native-gesture-handler/lib/typescript/handlers/PanGestureHandler';
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

// Base URL
const API_BASE_URL = 'https://testapi.abhi24.in';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// API call to fetch subcategories
export const getSubCategories = async () => {
  try {
    const response = await api.get('/public_app/getsubcategory');
    if (response.data.status === 200) {
      return response.data.data; // Return the array of subcategories
    } else {
      throw new Error('Unexpected response status: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error.message);
    throw error; // Let the caller handle the error
  }
};

// API call to fetch banners
export const getBanners = async () => {
  try {
    const response = await api.get('/public_app/getbanner');
    if (response.data.status === 200) {
      return response.data.data; // Return the array of banners
    } else {
      throw new Error('Unexpected response status: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error fetching banners:', error.message);
    throw error;
  }
};

// API call to fetch items by subcategory and category
export const getItems = async (subcategory_id, category_id) => {
  try {
    console.log('Fetching items with params:', { subcategory_id, category_id });
    
    if (!subcategory_id || !category_id) {
      console.warn('Invalid parameters for getItems:', { subcategory_id, category_id });
      throw new Error('Subcategory ID and Category ID are required');
    }

    const response = await api.post('/public_app/getitems', {
      subcategory_id: Number(subcategory_id),
      category_id: Number(category_id),
    });
    
    console.log('API Response:', response.data);

    if (response.data.status === 200) {
      return response.data; // Return the full response
    } else {
      throw new Error(`Unexpected response status: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error fetching items:', {
      message: error.message,
      subcategory_id,
      category_id,
      errorDetails: error
    });
    throw error;
  }
};

// Base URL for your API (adjust as needed)
// const BASE_URL = 'https://your-api-base-url.com'; // Replace with your actual base URL

// Function to get user login OTP
export const getUserLoginOTP = async (mobileNumber) => {
  try {
    const response = await api.post('/public_app/getuserloginotp', {
      customer_mobile_number: mobileNumber
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting login OTP:', error);
    throw error;
  } 
};

// Customer Login API call
export const customerLogin = async (mobileNumber) => {
  try {
    const response = await api.post('/public_app/customerlogin', {
      customer_mobile_number: mobileNumber
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in customer login:', error);
    throw error;
  }
};

// Get Item Details by unique_id
export const getItemDetails = async (uniqueId) => {
  try {
    const response = await api.post('/public_app/getitemdetails', {
      unique_id: uniqueId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching item details:', error);
    throw error;
  }
};

// Get Available Coupons
export const getCoupons = async () => {
  try {
    const response = await api.get('/public_app/getcoupon');
    
    if (response.data.status === 200) {
      return response.data.data; // Return the array of coupons
    } else {
      throw new Error('Unexpected response status: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

export const recommendItems = async (subcategory_id) => {
  try {
    const response = await api.post('/public_app/getrecommendeditems', {
      "subcategory_id":subcategory_id,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching recommend items:', error);
    throw error;
  }
};



export const checkAddressExistence = createAsyncThunk(
  "checkAddressExistence",
  async(
      {latitude,longitude},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
    const data={
      "latitude": latitude,
      "longitude": longitude
    }
    const response = await api.post('/public_app/getserviceavailability',data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  }
)



export const placeOrder = createAsyncThunk(
  "placeOrder",
  async(
      {orderDetails},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post("/public_app/orderplaced",orderDetails)
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)



export const applicationCharges = async () => {
  try {
    const response = await api.get('/public_app/getapplicationdata');
    console.log("0000", response)
    if (response.data.status === 200) {
      return response.data.data; // Return the array of coupons
    } else {
      throw new Error('Unexpected response status: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};



export const updateOrderStatus = createAsyncThunk(
  "updateOrderStatus",
  async(
      {paymentId,rzpId,orderId,orderStatus},
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.post("/public_app/updatepaymentdetails", {
        "payment_id":paymentId,
        "razorpay_order_id": rzpId,
        "id":orderId,
        "order_status" : orderStatus,
      })
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)


export const getServices = createAsyncThunk(
  "getServices",
  async(
      _,
      {getState, rejectWithValue, fulfillWithValue}
  ) =>{
      const response = await api.get("/public_app/getavailablelocations");
      if (response) {
          if (response.data) {
            return fulfillWithValue(response.data);
          } else {
            return rejectWithValue('Something went wrong!');
          }
        }
  }
)  



export const getPreviousOrders = async (payload) => {
  try {
    const response = await api.post('/public_app/getorderlist',payload);
    console.log("0000", response)
    if (response.data.status === 200) {
      return response.data.data; // Return the array of coupons
    } else {
      throw new Error('Unexpected response status: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};
