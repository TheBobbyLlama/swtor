import { configureStore } from "@reduxjs/toolkit";
import listenerMiddleware from "./listener";
import reducerList from "./reducers";

export default configureStore({
  reducer: reducerList,
  middleware: (getDefaultMiddleware) => {
	return getDefaultMiddleware({thunk: false}).prepend(listenerMiddleware);
  }
});