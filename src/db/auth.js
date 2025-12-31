import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from ".";

/// Load stored user info on startup.
function startupTasks() {
	return new Promise((res) => {
		auth.authStateReady().then(() => {
			if (auth.currentUser) {
				res({ displayName: auth.currentUser.displayName, email: auth.currentUser.email, uid: auth.currentUser.uid });
			} else {
				res(false);
			}
		});
	});
}

function login(userData) {
	return new Promise((res, rej) => {
		try {
			setPersistence(auth, browserLocalPersistence).then(() =>{
				signInWithEmailAndPassword(auth, userData.email, userData.password).then((result) => {
					res(result.user);
				}).catch((e) => {
					rej(e.toString());
				});
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