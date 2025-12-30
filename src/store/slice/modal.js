import { createSlice } from "@reduxjs/toolkit";

export const modalKey = {
	clear: null,
	generic: 1,
	spinner: 2,
	login: 3,
	characterFilter: 4,
	preview: 5,
	sectionHelp: 6,
	discordPost: 7,
	helperHelper: 8,
}

export const modalSlice = createSlice({
	name: "modal",
	initialState: {
		key: null,
	},
	reducers: {
		clearModal(state) {
			state.key = null;
			state.data = null;
		},
		showModal(state, action) {
			state.key = action.payload.key;
			state.data = action.payload.data;
			state.confirm = false;
		},
		applyConfirmation(state) {
			state.confirm = true;
		},
		consumeConfirmation(state) {
			state.confirm = false;
		},
	}
});

export const modalActions = modalSlice.actions;

export const modalSelectors = {
	key: (state) => {
		return state.modal.key;
	},
	data: (state) => {
		return state.modal.data;
	},
	confirm: (state) => {
		return state.modal.confirm;
	}
}

export default modalSlice.reducer;