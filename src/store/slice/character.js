import { createSlice } from "@reduxjs/toolkit";
// import { listener } from "../listener";

export const charSlice = createSlice({
	name: "characters",
	initialState: {
		filter: {}
	},
	reducers: {
		setListFilter(state, action) {
			state.filter = action.payload;
		}
	}
});

export const charActions = charSlice.actions;

export const charSelectors = {
	filter: (state) => {
		return state.characters.filter;
	}
}

export default charSlice.reducer;