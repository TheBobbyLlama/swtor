import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { get, set, ref } from "firebase/database";

import db, { auth } from ".";
import dbUtil from "./util";

// Load metadata, then check if user is already logged in.
function startupTasks() {
	return new Promise((res) => {
		if (auth.currentUser) {
			res(auth.currentUser);
		} else {
			res(false);
		}
	});
}

function login(userData) {
	return new Promise((res, rej) => {
		try {
			signInWithEmailAndPassword(auth, userData.email, userData.password).then((result) => {
				res(result.user);
			}).catch((e) => {
				rej(e.toString());
			});
		} catch (e) {
			rej(e.toString());
		}
	});
}

function logout() {
	return new Promise((res) => {
		signOut(auth).then(res);
	});
}

function signup(userData) {
	return new Promise((res, rej) => {
		try {
			const displayName = userData.displayName.replace(/\W/g, "");

			createUserWithEmailAndPassword(auth, userData.email, userData.password).then((credentials) => {
				return updateProfile(credentials.user, { displayName });
			}).then(() => {
				res(auth.currentUser);
			}).catch((e) => {
				rej(e.toString());
			});
		} catch (e) {
			rej(e.toString());
		}
	});
}

const authFuncs = {
	startupTasks,
	login,
	logout,
	signup,
};

export default authFuncs;