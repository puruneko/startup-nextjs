import { configureStore } from '@reduxjs/toolkit';
import { useSelector as rawUseSelector, TypedUseSelectorHook } from 'react-redux';

import { counterReducer } from 'redux/states/counter';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type MyAction<T> = {
  payload: T,
  type: string,
}

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;


//https://zenn.dev/engstt/articles/293e7420c93a18