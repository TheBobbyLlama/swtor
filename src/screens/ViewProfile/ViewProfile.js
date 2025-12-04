import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Null from "../Null/Null";
import Profile from "../../components/Profile/Profile";

import characterFuncs from "../../db/character";
import { localize } from "../../localization";
import { dbTransform } from "../../util";

import spinner from "../../assets/images/spinner.gif";

// const characterDB = require("../../data/characters.json");

function ViewProfile() {
	const { characterName, server } = useParams();
	const [ characterDB, setCharacterDB ] = useState(null);
	const abbrName = dbTransform(characterName);

	useEffect(() => {
		if (!characterDB) {
			characterFuncs.getFullCharacterData(dbTransform(server) || localStorage.getItem("SWTOR_Server") || "starforge", abbrName).then((result) => {
				setCharacterDB(result);
			});
		} else if (!characterDB.metadata?.[abbrName]) {
			document.title = `${localize("APP_NAME")} - ${characterDB.metadata[abbrName]}`;
		}
	}, [characterDB]);

	if (!characterDB) {
		return <img src={spinner} alt="One moment..." />;
	}

	if (!characterDB.metadata?.[abbrName]) {
		return <Null />;
	}
	
	return <Profile metadata={characterDB.metadata[abbrName]} profileData={characterDB.profiles[abbrName]} />
}

export default ViewProfile;