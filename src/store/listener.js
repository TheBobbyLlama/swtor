import { createListenerMiddleware } from "@reduxjs/toolkit";

export const listener = createListenerMiddleware();

export default listener.middleware;