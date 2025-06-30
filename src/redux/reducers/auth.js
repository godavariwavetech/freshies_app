import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { endpoints } from '../../config/config';

const initialState = {
  message: null,
  loading: false,
  token: null,
  userRole: 1,
  optCode: '',
  mobileNumber: '',
  isLogged: false,
  customerId: null,
  location: null,
  locationName: null,
  locationId: null,
  shouldNavigate: false,
  reaturantDetails: null,
  orderOfferAmount: 0,
  address: "",
  shopAddress: {},
  username: "",
  referralCode: "",
  userDetails: {}
};

export const verifyMobile = createAsyncThunk(
  'verifyMobile',
  async ({ mobileNumber }, { getState, rejectWithValue, fulfillWithValue }) => {
    const data = {
      mobile: mobileNumber,
    };
    // const response = await api.post(endpoints.VERIFY_MOBILE, data);
    const response = {
      data: {
        data: [{}],
        status: true

      }
    }
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  },
);


export const addCustomer = createAsyncThunk(
  "addCustomer",
  async (
    { mobileNumber, otp },
    { getState, rejectWithValue, fulfillWithValue }
  ) => {
    const data = {
      "customer_mobile_number": mobileNumber,
      "customer_otp": otp
    }
    const response = await api.post(endpoints.VERIFY_CUSTOMER_OTP, data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  }
)


export const loginAction = createAsyncThunk(
  'loginAction',
  async (
    { enteredOtp },
    { getState, rejectWithValue, fulfillWithValue },
  ) => {
    const { mobileNumber } = getState().Auth
    const data = {
      mobile: mobileNumber,
      otp: enteredOtp,
    };
    const response = await api.post(endpoints.LOGIN, data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  },
);

export const verifyCustomerMobile = createAsyncThunk(
  'verifyCustomerMobile',
  async ({ customer_mobile_number }, { getState, rejectWithValue, fulfillWithValue }) => {
    const data = {
      customer_mobile_number,
    };
    try {
      const response = await api.post(endpoints.REQUEST_OTP, data);
      if (response?.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong!');
    }
  },
);

export const verifyCustomerOTP = createAsyncThunk(
  'verifyCustomerOTP',
  async ({ customer_mobile_number, customer_otp }, { getState, rejectWithValue, fulfillWithValue }) => {
    const data = {
      customer_mobile_number,
      customer_otp,
    };
    try {
      const response = await api.post(endpoints.VERIFY_CUSTOMER_OTP, data);
      if (response?.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong!');
    }
  },
);

export const AuthSlice = createSlice({
  name: 'authlice',
  initialState,
  reducers: {
    actionLogout: state => {
      state.token = null;
      state.customerId = null;
    },
    actionLogin: state => {
      state.token = 'sample token';
    },
    setMobile: (state, action) => {
      state.mobileNumber = action.payload
    },
    setInitial: state => {
      state.loading = false,
        state.message = null
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setLocationName: (state, action) => {
      
      state.locationName = action.payload;
    },
    setLocationId: (state, action) => {
      
      state.locationId = action.payload;
    },
    clearNavigationFlag: (state) => {
      state.shouldNavigate = false;
    },
    setRestaurnatDetails: (state, action) => {
      state.reaturantDetails = action.payload;
    },
    setOrderOfferAmount: (state, action) => {
      state.orderOfferAmount = action.payload;
    },
    setAddress: (state, action) => {
      state.address = action.payload
    },
    setShopAddress: (state,action) => {
      state.shopAddress = action.payload
    },
    setUserName: (state,action) => {
      state.username = action.payload
    },
    setCustormarId: (state,action) => {
      state.customerId = action.payload
    },
    setReferalCode: (state,action) => {
      state.referralCode = action.payload
    },
    setUseDetails: (state,action) => {
      state.userDetails = action.payload
    }

    
  },
  extraReducers: builder => {
    builder.addCase(loginAction.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(loginAction.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
      if (action.payload.token) {
        state.token = action.payload.token;
        state.isLogged = true;
        state.shouldNavigate = true;
      }
    });
    builder.addCase(loginAction.rejected, (state, action) => {
      state.loading = false;
      state.message = 'Please try again!';
    });

    builder.addCase(verifyMobile.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(verifyMobile.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
      
      if (action.payload?.data[0]?.mobile) {
        state.mobileNumber = action.payload?.data[0]?.mobile;
      }
    });
    builder.addCase(verifyMobile.rejected, (state, action) => {
      state.loading = false;
      state.message = 'Please try again!';
    });

    // Customer Mobile Verification
    builder.addCase(verifyCustomerMobile.pending, (state, action) => {
      state.loading = true;
      state.message = null;
    });
    builder.addCase(verifyCustomerMobile.fulfilled, (state, action) => {
      state.loading = false;
      state.message = null;
      // if (action.payload?.data?.[0]?.customer_mobile_number) {
      //   state.mobileNumber = action.payload.data[0].customer_mobile_number;
      // }
    });
    builder.addCase(verifyCustomerMobile.rejected, (state, action) => {
      state.loading = false;
      state.message = action.payload || 'Please try again!';
    });

    // Customer OTP Verification
    builder.addCase(verifyCustomerOTP.pending, (state, action) => {
      state.loading.otpVerification = true;
      state.message = null;
    });
    builder.addCase(verifyCustomerOTP.fulfilled, (state, action) => {
      state.loading.otpVerification = false;
      state.message = null;
      if (action.payload?.token) {
        state.token = action.payload.token;
        state.isLogged = true;
      }
    });
    builder.addCase(verifyCustomerOTP.rejected, (state, action) => {
      state.loading.otpVerification = false;
      state.message = action.payload || 'Please try again!';
    });



    builder.addCase(addCustomer.pending, (state, action) => {
      state.loading.categories = true;
      state.message = null;
    });
    builder.addCase(addCustomer.fulfilled, (state, action) => {
      state.loading.categories = false;
      state.message = null;
      state.customerId = action.payload.data.customer_id;
    });
    builder.addCase(addCustomer.rejected, (state, action) => {
      state.loading.categories = false;
      state.message = 'Please try again!';
    });



  },
});

export const { actionLogout, actionLogin, setMobile, setInitial, setLocation, setLocationName, setLocationId, clearNavigationFlag,setUseDetails, setRestaurnatDetails, setOrderOfferAmount,setReferalCode, setAddress,setShopAddress,setUserName,setCustormarId } = AuthSlice.actions;

export default AuthSlice.reducer;
