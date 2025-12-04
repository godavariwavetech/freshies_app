import axios from 'axios';
import { panGestureHandlerCustomNativeProps } from 'react-native-gesture-handler/lib/typescript/handlers/PanGestureHandler';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseURL } from '../config/config';

// Create Axios instance
const api = axios.create({
  baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to log full URL
api.interceptors.request.use(
  (config) => {
    try {
      const baseURL = config.baseURL || 'No baseURL set';
   
    } catch (error) {
      console.error("Error retrieving baseURL:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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


export const saveFcmToken = async (userId, fcmToken) => {
  try {
    const response = await api.post("/public_app/postplayerid", {
      user_id: userId,
      player_id:fcmToken,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

export const getSubCategoriesById = async (payload) => {
  try {
    const response = await api.post('/public_app/getsubtotalcategoriesbyid', payload);
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
export const getItems = async (subcategory_id, customerId, filter_one, item_id) => {
  try {

    let payload = {
      customer_id: customerId,
      item_id: item_id
    };

    if (!filter_one) {
      // No brand filter, include subcategory
      payload.subtotal_category_id = subcategory_id;
    } else {
      // Brand filter present, use only brand
      payload.filter_one = filter_one;
    }

    const response = await api.post('/public_app/getitems', payload);
    if (response.data.status === 200) {
      return response.data; // Return the full response
    } else {
      throw new Error(`Unexpected response status: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error fetching items:', {
      message: error.message,
      subcategory_id,
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
export const customerLogin = async (payload) => {
  try {
    const response = await api.post('/public_app/customerlogin', payload);
    return response.data;
  } catch (error) {
    console.error('Error in customer login:', error);
    throw error;
  }
};

// Get Item Details by unique_id
export const getItemDetails = async (customerId, uniqueId) => {

  try {
    const response = await api.post('/public_app/getitemdetails', {
      customer_id: customerId,
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
      "subcategory_id": subcategory_id,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching recommend items:', error);
    throw error;
  }
};



export const checkAddressExistence = createAsyncThunk(
  "checkAddressExistence",
  async (
    { latitude, longitude },
    { getState, rejectWithValue, fulfillWithValue }
  ) => {
    const data = {
      "latitude": latitude,
      "longitude": longitude
    }

    const response = await api.post('/public_app/getserviceavailability', data);
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
  async (
    { orderDetails },
    { getState, rejectWithValue, fulfillWithValue }
  ) => {
    try {


      const response = await api.post("/public_app/orderplaced", orderDetails);


      if (response?.data) {
        return fulfillWithValue(response.data);
      } else {
        console.error("❌ API responded but no data");
        return rejectWithValue("Something went wrong!");
      }
    } catch (error) {
      console.error("❌ API error:", error);
      return rejectWithValue(
        error?.response?.data?.message || "Unexpected error occurred"
      );
    }
  }
);


export const applicationCharges = async () => {
  try {
    const response = await api.get('/public_app/getapplicationdata');
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
  async (
    { paymentId, rzpId, orderId, orderStatus, customerId },
    { getState, rejectWithValue, fulfillWithValue }
  ) => {

    const response = await api.post("/public_app/updatepaymentdetails", {
      "payment_id": paymentId,
      "razorpay_order_id": rzpId,
      "id": orderId,
      "order_status": orderStatus,
      "customer_id": customerId,
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
  async (
    _,
    { getState, rejectWithValue, fulfillWithValue }
  ) => {
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

    const response = await api.post('/public_app/getorderlist', payload);
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



export const NestedItems = async (payload) => {
  try {

    const response = await api.post('/public_app/getitems', payload);

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


export const getOrderItemsByOrderId = async (order_id) => {
  const payload = {
    order_id: order_id
  };

  const response = await api.post('/public_app/getorderdetails', payload);
  return response.data?.data || [];
};

export const addToWishlist = async (payload) => {

  return await api.post('/public_app/addwishlist', payload);
};

export const removeFromWishlist = async (payload) => {

  return await api.post('/public_app/deletewishlist', payload);
};

export const getWishlist = async (customerId) => {
  try {
    const response = await api.post(`/public_app/getuserwishlist`, {
      customer_id: customerId
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};



export const WalletAPI = {
  getDefaultWalletAmounts: async () => {
    try {
      const response = await api.get('/public_app/getdefaultwalletamount');
      return response.data.data; // return only the data array
    } catch (error) {
      console.error('Error fetching wallet amounts:', error);
      return [];
    }
  },
  insertUserWalletAmount: async ({ user_id, payment_amount }) => {
    try {
      const response = await api.post('/public_app/insertuserwalletamountinsub', {
        user_id,
        payment_amount,
      });
      return response.data;
    } catch (error) {
      console.error('Insert Wallet Amount Error:', error);
      throw error;
    }
  },
  updateUserWalletAmount: async ({ id, user_id, payment_id, payment_amount }) => {
    const response = await api.post('/public_app/updateuserwalletamount', {
      id,
      user_id,
      payment_id,
      payment_amount,
    });
    return response.data;
  },
  getWalletAmounts: async (user_id) => {

    try {
      const response = await api.post('/public_app/getwalletamounts', { user_id });

      return response?.data?.data?.[0]; // return the first object directly
    } catch (error) {

      console.error('Failed to fetch wallet amounts:', error);
      return null;
    }
  },
  getRechargeHistory: async (user_id) => {
    try {
      const response = await api.post('/public_app/getrechargehistorydetails', { user_id });
      return response?.data?.data || [];
    } catch (error) {
      console.error('Error fetching recharge history:', error);
      return [];
    }
  },
  getBillingHistory: async (user_id) => {
    try {
      const res = await api.post('/public_app/getbillinghistorydetails', { user_id });
      return res?.data?.data || [];
    } catch (error) {
      console.error('Billing history fetch error:', error);
      return [];
    }
  },
  getAbhi24WalletDetails: async (user_id) => {
    try {
      const response = await api.post('/public_app/getabhi24walletdetails', { user_id });
      return response?.data?.data || [];
    } catch (error) {
      console.error('Error fetching Abhi24 wallet details:', error);
      return [];
    }
  }
};

export const fetchOrderStatus = async (orderId) => {
  try {
    const response = await api.post('/public_app/getsingleorderdetails', {
      order_id: orderId
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching item details:', error);
    throw error;
  }
};

export const placeSubscriptionOrder = async (payload) => {
  try {
    const response = await api.post('/public_app/subscriptionorderplaced', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Subscription order error:', error);
    throw error;
  }
};


export const getSubscriptionOrders = async (payload) => {
  try {
    const response = await api.post('/public_app/getsubscriptionorders', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Subscription order error:', error);
    throw error;
  }

};

export const deleteSubscriptionOrder = async (id) => {
  try {
    const response = await api.post('/public_app/deletesubscriptionorder', { id });
    return response.data;
  } catch (error) {
    console.error('❌ Subscription order deletion:', error);
    throw error;
  }
};

export const toggleSubscriptionStatus = async (id, isResume) => {
  const payload = {
    id,
    subscription_status: isResume ? 0 : 1, // 0: resume, 1: pause
  };
  try {
    const response = await api.post('/public_app/resumesubscriptionorder', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Subscription order resume:', error);
    throw error;
  }
};

export const getSubscriptionDetails = async (payload) => {
  try {
    const response = await api.post('/public_app/getsubscriptiondetails', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Subscription details error:', error);
    throw error;
  }
};

export const getUserData = async (payload) => {
  try {
    const response = await api.post('/public_app/getuserdata', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Get user data error:', error);
    throw error;
  }
};

export const updateUserProfile = async (payload) => {
  try {
    const response = await api.post('/public_app/updateprofiledata', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error;
  }
};

export const fetchSearchResults = async (searchTerm) => {
  if (!searchTerm?.trim()) return [];

  try {
    const response = await api.post('/public_app/searchallitems', {
      searchterm: searchTerm,
    });

    if (response?.data?.status === 200) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};


export const deleteAccount = async (payload) => {
  try {
    const response = await api.post('/public_app/deleteaccount', payload);
    return response.data;
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error.response?.data || error;
  }
};

export const getFAQs = async () => {
  try {
    const response = await api.get('/public_app/get_faq');
    if (response.data.status === 200) {
      return response.data.data; // Return the array of coupons
    } else {
      throw new Error('Unexpected response status: ' + response.data.status);
    }
  } catch (error) {
    console.error('Error fetching faqs:', error);
    throw error;
  }
};






