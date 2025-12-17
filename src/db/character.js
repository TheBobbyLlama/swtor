import { get, ref, set, update } from "firebase/database";
import dbUtil from "./util";

import db from ".";

function getCharacterMetadata(server) {
	if (!server) throw new Error("No server specified!");

	return new Promise((res) => {
		const metadataRef = ref(db, `${server}/metadata`);

		get(metadataRef).then(async (result) => {
			if (result.exists()) {
				res(result.val());
			} else {
				res(null);
			}
		});
	})
}

function getFullCharacterData(server, key) {
	if (!key) throw new Error("getFullCharacterData: No character key!");
	if (!server) throw new Error("No server specified!");

	return new Promise((res) => {
		const metadataRef = ref(db, `${server}/metadata/${key}`);
		const profileRef = ref(db, `${server}/profiles/${key}`);

		Promise.all([get(metadataRef), get(profileRef)]).then((result) => {
			const tmpProfile = result[1].val();

			if ((tmpProfile) && (!tmpProfile.pages)) tmpProfile.pages = [];

			const charData = {
				metadata: { [key]: result[0].val() },
				profiles: { [key]: tmpProfile }
			};

			res(charData);
		}).catch(() => {
			res({});
		});
	});
}

function getCharacterProfileData(server, key) {
	if (!key) throw new Error("getCharacterProfileData: No character key!");
	if (!server) throw new Error("No server specified!");

	return new Promise((res) => {
		const profileRef = ref(db, `${server}/profiles/${key}`);

		get(profileRef).then((results) => {
			const tmpProfile = results.val();

			if ((tmpProfile) && (!tmpProfile.pages)) tmpProfile.pages = [];

			res(tmpProfile);
		});
	});
}

function saveCharacter(server, metadata, profile) {
	const key = dbUtil.transform(metadata.name);

	if (!key) throw new Error("saveCharacter: No character key!");
	if (!server) throw new Error("No server specified!");

	const updates = {};
	updates[`${server}/metadata/${key}`] = metadata;
	updates[`${server}/profiles/${key}`] = profile;

	return update(ref(db), updates);
}

function deleteCharacter(server, characterName) {
	const key = dbUtil.transform(characterName);

	if (!key) throw new Error("deleteCharacter: No character key!");
	if (!server) throw new Error("No server specified!");

	const updates = {};
	updates[`${server}/metadata/${key}`] = null;
	updates[`${server}/profiles/${key}`] = null;

	return update(ref(db), updates);
}

function loadUserNotes(server, uid) {
	if (!uid) throw new Error("loadCharacterNotes: No UID!");
	if (!server) throw new Error("No server specified!");

	return new Promise((res) => {
		const notesRef = ref(db, `${server}/notes/${uid}`);

		get(notesRef).then((results) => {
			res(results.val() || {});
		});
	});
}

function saveCharacterNotes(server, uid, key, notes) {
	if (!uid) throw new Error("saveCharacterNotes: No UID!");
	if (!key) throw new Error("saveCharacterNotes: No character key!");
	if (!server) throw new Error("No server specified!");

	const updates = {};
	updates[`${server}/notes/${uid}/${key}`] = notes;

	return update(ref(db), updates);
}

const characterFuncs = {
	getCharacterMetadata,
	getCharacterProfileData,
	getFullCharacterData,
	loadUserNotes,
	saveCharacter,
	saveCharacterNotes,
	deleteCharacter,
}

export default characterFuncs;