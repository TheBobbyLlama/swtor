import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const scramble = "A8Qr-jsya8aca0-gNI5WmiIoAxUHjS9fXyz1c-V";

function reconstruct() {
	let result = "";

	for (let i = 0; i < scramble.length; i++) {
		result += scramble[(17 * i) % scramble.length];
	}

	return result;
}

const firebaseConfig = {
	apiKey: reconstruct(),
	authDomain: "swtor-profiles.firebaseapp.com",
	databaseURL: "https://swtor-profiles-default-rtdb.firebaseio.com",
	projectId: "swtor-profiles",
	storageBucket: "swtor-profiles.firebasestorage.app",
	messagingSenderId: "906076017510",
	appId: "1:906076017510:web:7a075b9b6cac3ca05b2ea7"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export const auth = getAuth(app);

export default database;