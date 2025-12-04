const defaultLocalization = require("./EN-US.json");

let localizationData = {};

export const languageOptions = [
	{
		label: "English",
		key: "EN-US"
	}
]

export const setLocalizationLanguage = async (language) => {
	if (languageOptions.find(data => data.key === language)) {
		const tmpData = await require(`./${language}.json`);
		localizationData = { ...defaultLocalization, ...tmpData };
	} else {
		localizationData = { ...defaultLocalization };
	}
}

export const localize = (key, ...args) => {
	let result = localizationData[key] || key;
	const nestedKeys = (result).match(/\[\[.+?\]\]/g);
	nestedKeys?.forEach(item => result = result.replaceAll(item, localize(item.substring(2, item.length - 2))));

	args.forEach((value, index) => {
		result = result.replace(`{${index}}`, value);
	});

	return result;
}

setLocalizationLanguage(navigator.language?.toUpperCase());