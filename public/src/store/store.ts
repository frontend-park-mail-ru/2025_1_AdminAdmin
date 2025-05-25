import { userReducer } from '@store/reducers/userReducer';
import { cartReducer } from '@store/reducers/cartReducer';
import { combineReducers, createStore } from 'doordashers-store';

const rootReducer = combineReducers({ userState: userReducer, cartState: cartReducer });
export const store = createStore(rootReducer);
