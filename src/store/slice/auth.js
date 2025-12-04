import { createSlice } from "@reduxjs/toolkit";
import { listener } from "../listener";
import authFuncs from "../../db/auth";

export const authSlice = createSlice({
	name: "auth",
	initialState: {
		busy: false
	},
	reducers: {
		startupTasks(state) {
			state.busy = true;
		},
		login(state, action) {
			state.busy = true;
			state.error = undefined;
		},
		loginSuccess(state, action) {
			state.user = action.payload;
			state.busy = false;
			state.error = undefined;
		},
		loginFailed(state, action) {
			state.user = undefined;
			state.busy = false;
			state.error = action.payload?.toString() || "ERROR_LOGIN_FAILED";
		},
		logout(state) {
			state.busy = true;
		},
		logoutComplete(state) {
			state.user = undefined;
			state.busy = false;
		},
		signup(state, action) {
			state.busy = true;
			state.error = undefined;
		},
		signupSuccess(state, action) {
			state.busy = false;
			state.user = action.payload;
		},
		signupFailed(state, action) {
			state.busy = false;
			state.error = state.error = action.payload?.toString() || "ERROR_SIGNUP_FAILED";
		},
		error(state, action) {
			state.error = action.payload;
		},
		clearError(state) {
			state.error = undefined;
		},
		setBusy(state, action) {
			state.busy = action.payload;
		}
	}
});

export const authActions = authSlice.actions;

export const authSelectors = {
	error: (state) => {
		return state.auth.error;
	},
	busy: (state) => {
		return state.auth.busy;
	},
	user: (state) => {
		return state.auth.user;
	}
}

listener.startListening({
	actionCreator: authActions.startupTasks,
	effect: async (action, listenerApi) => {
		authFuncs.startupTasks().then((result) => {
			if (result) {
				listenerApi.dispatch(authActions.loginSuccess(result));
			} else {
				listenerApi.dispatch(authActions.setBusy(false));
			}
		}).catch((error) => {
			listenerApi.dispatch(authActions.loginFailed(error));
		})
	}
});

listener.startListening({
	actionCreator: authActions.login,
	effect: async (action, listenerApi) => {
		authFuncs.login(action.payload).then((result) => {
			listenerApi.dispatch(authActions.loginSuccess({ displayName: result.displayName, email: result.email, uid: result.uid }));
		}).catch((error) => {
			listenerApi.dispatch(authActions.loginFailed(error));
		});
	}
});

listener.startListening({
	actionCreator: authActions.logout,
	effect: async (action, listenerApi) => {
		authFuncs.logout().then(() => {
			listenerApi.dispatch(authActions.logoutComplete());
		});
	}
});

listener.startListening({
	actionCreator: authActions.signup,
	effect: async (action, listenerApi) => {
		authFuncs.signup(action.payload).then((result) => {
			listenerApi.dispatch(authActions.signupSuccess({ displayName: result.displayName, email: result.email, uid: result.uid }));
		}).catch((error) => {
			listenerApi.dispatch(authActions.signupFailed(error));
		});
	}
});

export default authSlice.reducer;