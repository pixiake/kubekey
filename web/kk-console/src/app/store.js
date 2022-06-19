import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import configurationsReducer from '../features/configurations/configurationsSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    configurations: configurationsReducer,
  },
});
