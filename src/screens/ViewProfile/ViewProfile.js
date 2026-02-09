import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Null from "../Null/Null";
import Profile from "../../components/Profile/Profile";

import characterFuncs from "../../db/character";
import { localize } from "../../localization";
import { dbTransform, stringKey, stripMarkdown } from "../../util";

import spinner from "../../assets/images/spinner.gif";

function createEmbedSummary(metadata, profile) {
	let result = `**${localize("LABEL_SPECIES")}:** ${localize(metadata.species)}
**${localize("LABEL_GENDER")}:** ${localize(metadata.gender)}`;

	if (profile.age) {
		result += `
**${localize("LABEL_AGE")}:** ${stripMarkdown(profile.age)}`
	}

	if (metadata.homeworld) {
		result += `
**${localize("LABEL_HOMEWORLD")}:** ${stripMarkdown(metadata.homeworld)}`
	}

	profile.customFields?.forEach(field => {
		result += `
**${stripMarkdown(field[0])}:** ${stripMarkdown(field[1])}`
	});

	return result;
}

function setEmbedItem(content, property) {
	const metaElement = document.head.querySelector(`meta[property='${property}']`);

	if (metaElement) {
		if (content) {
			metaElement.setAttribute("content", content);
		} else {
			metaElement.remove();
		}
	} else if (content) {
		const newElement = document.createElement("meta");
		newElement.setAttribute("content", content);
		newElement.setAttribute("property", property);
		document.head.appendChild(newElement);
	}
}

function ViewProfile() {
	const { characterName, privateKey, server } = useParams();
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

	if (!characterDB.metadata?.[abbrName] || ((characterDB.metadata[abbrName].private) && (stringKey(characterDB.metadata[abbrName].creator + characterDB.metadata[abbrName].name) !== privateKey))) {
		return <Null />;
	}

	setEmbedItem(`${characterDB.metadata[abbrName].name}`, "og:title");
	setEmbedItem(createEmbedSummary(characterDB.metadata[abbrName], characterDB.profiles[abbrName]), "og:description");
	setEmbedItem(characterDB.profiles[abbrName].image, "og:image");
	
	return <Profile metadata={characterDB.metadata[abbrName]} profileData={characterDB.profiles[abbrName]} />
}

export default ViewProfile;