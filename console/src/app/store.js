import { configureStore } from '@reduxjs/toolkit';
import configurationsReducer from '../features/configurations/configurationsSlice'

export const store = configureStore({
  reducer: {
    configurations: configurationsReducer,
  },
});
