import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import CartReducer from './cartReducer';

const rootReducer = combineReducers({
  Auth: AuthReducer,
  Cart: CartReducer,
});

export default rootReducer; 