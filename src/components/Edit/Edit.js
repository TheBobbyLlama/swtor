import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import SectionText from "./components/SectionText";
import SectionItemized from "./components/SectionItemized";
import SectionTable from "./components/SectionTable";
import SectionFrame from "./components/SectionFrame";

import MarkDownInput from "../Markdown/MarkdownInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignJustify, faArrowRightFromBracket, faCircleQuestion, faFloppyDisk, faGrip, faImagePortrait, faTable, faTrash, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";

import { modalActions, modalKey, modalSelectors } from "../../store/slice/modal";
import { localize } from "../../localization";

import "./Edit.css";

const speciesList = [
	"SPECIES_HUMAN",
	"SPECIES_ARKANIAN",
	"SPECIES_CATHAR",
	"SPECIES_CHISS",
	"SPECIES_ECHANI",
	"SPECIES_MIRIALAN",
	"SPECIES_MIRALUKA",
	"SPECIES_NAUTOLAN",
	"SPECIES_RATTATAKI",
	"SPECIES_SITH",
	"SPECIES_TOGRUTA",
	"SPECIES_TWILEK",
	"SPECIES_ZABRAK",
	"SPECIES_DROID",
];

const genderList = [
	"GENDER_FEMALE",
	"GENDER_MALE",
	"GENDER_NONBINARY",
];

const droidGenderList = [
	"GENDER_NONE",
	"GENDER_FEMALE",
	"GENDER_MALE",
	"GENDER_NONBINARY",
];

function createBaseMetadata(user) {
	return {
		creator: user.displayName,
		uid: user.uid,
		// Defaults - Need to specify these for correct interaction with select elements
		faction: (document.body.className === "empire") ? "FACTION_EMPIRE" : "FACTION_REPUBLIC",
		gender: "GENDER_FEMALE",
		species: "SPECIES_HUMAN",
	}
}

function createBaseProfile(user) {
	return {
		pages: [],
		uid: user.uid,
	}
}

function Edit({ create, demo, user, metadata, profileData, leaveFunc, saveFunc, deleteFunc }) {
	const [ changed, setChanged ] = useState(false);
	const [ workingMetadata, setWorkingMetadata ] = useState(create ? createBaseMetadata(user) : metadata);
	const [ workingProfile, setWorkingProfile ] = useState(create ? createBaseProfile(user) : profileData);
	const [ pendingCommand, setPendingCommand ] = useState(null);
	const modalConfirmed = useSelector(modalSelectors.confirm);
	const dispatch = useDispatch();

	// console.log(workingMetadata, workingProfile);

	useEffect(() => {
		if (create) {
			document.title = `${localize("APP_NAME")} - ${localize("LABEL_ADD_CHARACTER")}`;
		} else {
			document.title = `${localize("APP_NAME")} - ${localize("LABEL_EDIT_CHARACTER", metadata.name)}`;
		}
	}, []);

	useEffect(() => {
		document.body.className = (workingMetadata.faction === "FACTION_EMPIRE") ? "empire" : "republic";
	}, [workingMetadata.faction])

	useEffect(() => {
		if ((pendingCommand) && (modalConfirmed)) {
			if (pendingCommand === "leaveEditMode") {
				leaveFunc();
			} else if (pendingCommand === "deleteCharacter") {
				deleteCharacterConfirm();
			} else {
				const tmpCommand = pendingCommand.split("|");
				updatePage(tmpCommand[0], tmpCommand[1]);
			}

			dispatch(modalActions.consumeConfirmation());
			setPendingCommand(null);
		}
	}, [ modalConfirmed ]);

	const editCharacter = (e, dataPath) => {
		let target;
		let newValue;
		let newData;

		if (dataPath) {
			target = dataPath.split(".");
			newValue = e;
		} else {
			target = e.target.name.split(".");
			newValue = e.target.value;
		}

		if (target[0] === "metadata") {
			newData = { ...workingMetadata };
		} else {
			newData = { ...workingProfile }
		}

		if (!newValue) {
			delete newData[target[1]];
		} else {
			newData[target[1]] = newValue;
		}

		if (target[0] === "metadata") {
			setWorkingMetadata(newData);
		} else {
			setWorkingProfile(newData);
		}

		setChanged(true);
	}

	const updateCustomFields = (e) => {
		const newProfile = { ...workingProfile };
		const row = e.target.dataset["row"];
		const item = e.target.dataset["item"];

		if (newProfile.customFields) {
			newProfile.customFields = [ ...newProfile.customFields ];
		} else {
			newProfile.customFields = [];
		}

		if (!newProfile.customFields[row]) newProfile.customFields[row] = [ "", "" ];
		
		newProfile.customFields[row][item] = e.target.value;
		newProfile.customFields = newProfile.customFields.filter(pair => pair[0] || pair[1]);

		setWorkingProfile(newProfile);
		setChanged(true);
	}

	const validateCharacter = () => {
		let i;

		if (user.uid !== workingMetadata.uid) return false;

		if (!workingMetadata.name) return false;

		if (workingProfile.customFields) {
			for (i = 0; i < workingProfile.customFields.length; i++) {
				if ((!workingProfile.customFields[i][0]) || (!workingProfile.customFields[i][1])) return false;
			}
		}

		for (i = 0; i < workingProfile.pages.length; i++) {
			if (!workingProfile.pages[i].title) return false;
		}

		return true;
	}

	const tryLeaveEditMode = () => {
		if (changed) {
			setPendingCommand(`leaveEditMode`);

			dispatch(modalActions.showModal({
				key: modalKey.generic,
				data: {
					title: localize("LABEL_CONFIRM"),
					text: localize("LABEL_EDIT_LEAVE_CONFIRM"),
					action: true,
				}
			}));
		} else {
			leaveFunc();
		}
	}

	const saveCharacter = async () => {
		if ((changed) && (validateCharacter())) {
			try {
				dispatch(modalActions.showModal(modalKey.spinner));
				await saveFunc(workingMetadata, workingProfile);
				setChanged(false);
				dispatch(modalActions.clearModal());
			} catch (e) {
				dispatch(modalActions.showModal({
					key: modalKey.generic,
					data: {
						title: localize("LABEL_ERROR"),
						text: localize(e.message || e.toString()),
					}
				}));
			}
		}
	}

	const deleteCharacter = () => {
		setPendingCommand(`deleteCharacter`);

		dispatch(modalActions.showModal({
			key: modalKey.generic,
			data: {
				title: localize("LABEL_CONFIRM"),
				text: [ localize("LABEL_DELETE_CHARACTER_CONFIRM", workingMetadata.name || localize("LABEL_THIS_CHARACTER").toLowerCase()), `WARNING:${localize("LABEL_DELETE_CHARACTER_WARNING")}` ],
				action: true,
			}
		}));
	}

	const deleteCharacterConfirm = async () => {
		try {
			dispatch(modalActions.showModal(modalKey.spinner));
			await deleteFunc(workingMetadata.name);
			dispatch(modalActions.clearModal());
		} catch (e) {
			dispatch(modalActions.showModal({
				key: modalKey.generic,
				data: {
					title: localize("LABEL_ERROR"),
					text: localize(e.message || e.toString()),
				}
			}));
		}
	}

	const updatePage = (command, pageIdx, data) => {
		const newProfile = { ...workingProfile, pages: [ ...workingProfile.pages ] };

		switch (command) {
			case "title":
				newProfile.pages[pageIdx] = { ...newProfile.pages[pageIdx], title: data };
				break;
			case "addPage":
				newProfile.pages.splice(pageIdx, 0, { title: "", key: Date.now(), sections: [] });
				break;
			case "addSection":
				newProfile.pages[pageIdx] = { ...newProfile.pages[pageIdx], sections: [ ...newProfile.pages[pageIdx].sections ]};
				switch (data.type) {
					case "frame":
						newProfile.pages[pageIdx].sections.splice(data.secIdx, 0, { type: "frame", heading: "", url: "", key: Date.now() });
						break;
					case "itemized":
						newProfile.pages[pageIdx].sections.splice(data.secIdx, 0, { type: "itemized", heading: "", items: [], key: Date.now() });
						break;
					case "table":
						newProfile.pages[pageIdx].sections.splice(data.secIdx, 0, { type: "table", heading: "", headers: [], data: [], key: Date.now() });
						break;
					case "text":
						newProfile.pages[pageIdx].sections.splice(data.secIdx, 0, { type: "text", heading: "", content: "", key: Date.now() });
						break;
					default:
						console.error("Invalid section type!");
						break;
				}
				break;
			case "updateSection":
				newProfile.pages[pageIdx] = { ...newProfile.pages[pageIdx], sections: [ ...newProfile.pages[pageIdx].sections ]};
				newProfile.pages[pageIdx].sections[data.secIdx] = data.section;
				break;
			case "deletePage":
				newProfile.pages.splice(pageIdx, 1);
				break;
			case "deleteSection":
				newProfile.pages[pageIdx] = { ...newProfile.pages[pageIdx], sections: newProfile.pages[pageIdx].sections.filter((sec, index) => index !== data.secIdx)};
				break;
			default:
				return;  // Invalid command, don't post changes
		}

		setWorkingProfile(newProfile);
		setChanged(true);
	}

	const validateCharacterImage = (e) => {
		const newValue = e.target.value;

		if ((!newValue) || (newValue.match(/^(https?:\/\/)?[A-Za-z0-9-_]+\.[A-Za-z0-9-_.]+[A-Za-z0-9](\/[A-Za-z0-9-_]+)*\/[A-Za-z0-9-_.]+(\.[Bb][Mm][Pp]|\.[Gg][Ii][Ff]|\.[Jj][Pp][Gg]|\.[Pp][Nn][Gg])(\?[\w=&]+)*$/g))) {
			e.target.classList.remove("invalid")
		} else {
			e.target.classList.add("invalid");
		}

		editCharacter(e);
	}

	const showPreview = () => {
		dispatch(modalActions.showModal({
			key: modalKey.preview,
			data: {
				metadata: workingMetadata,
				profile: workingProfile
			}
		}));
	}

	const showSectionHelp = () => {
		dispatch(modalActions.showModal({ key: modalKey.sectionHelp }));
	}

	const Quickbar = () => {
		return <div className="quickbar">
			<div>
				<button className="button-minimal" aria-label={localize("LABEL_PREVIEW")} title={localize("LABEL_PREVIEW")} onClick={showPreview}><FontAwesomeIcon icon={faImagePortrait} /></button>
				<button className="button-minimal" aria-label={localize("LABEL_SAVE")} title={localize("LABEL_SAVE")} disabled={demo || !changed || !validateCharacter()} onClick={saveCharacter}><FontAwesomeIcon icon={faFloppyDisk} /></button>
			</div>
			<button className="button-minimal" aria-label={localize("LABEL_EDIT_LEAVE")} title={localize("LABEL_EDIT_LEAVE")} onClick={tryLeaveEditMode}><FontAwesomeIcon icon={faArrowRightFromBracket} /></button>
		</div>
	}

	const AddSection = ({ pageIdx, secIdx }) => {
		if (secIdx === true) secIdx = 0; // ???

		if (workingProfile.pages[pageIdx].sections[0]?.type === "frame") return null;

		return <div className="edit-button-row">
			<label>{localize("LABEL_ADD")}:</label>
			<button className="button-small" aria-label={localize("LABEL__SECTION", localize("LABEL_TEXT"))} title={localize("LABEL__SECTION", localize("LABEL_TEXT"))} onClick={() => updatePage("addSection", pageIdx, { secIdx, type: "text" })}><FontAwesomeIcon icon={faAlignJustify} /></button>
			<button className="button-small" aria-label={localize("LABEL__SECTION", localize("LABEL_ITEMIZE"))} title={localize("LABEL__SECTION", localize("LABEL_ITEMIZED"))} onClick={() => updatePage("addSection", pageIdx, { secIdx, type: "itemized" })}><FontAwesomeIcon icon={faGrip} /></button>
			<button className="button-small" aria-label={localize("LABEL__SECTION", localize("LABEL_TABLE"))} title={localize("LABEL__SECTION", localize("LABEL_TABLE"))} onClick={() => updatePage("addSection", pageIdx, { secIdx, type: "table" })}><FontAwesomeIcon icon={faTable} /></button>
			{workingProfile.pages[pageIdx].sections.length === 0 && <button className="button-small" aria-label={localize("LABEL__SECTION", localize("LABEL_FRAME"))} title={localize("LABEL__SECTION", localize("LABEL_FRAME"))} onClick={() => updatePage("addSection", pageIdx, { secIdx, type: "frame" })}><FontAwesomeIcon icon={faWindowMaximize} /></button>}
			<button className="button-minimal" aria-label={localize("LABEL_HELP")} title={localize("LABEL_HELP")} onClick={showSectionHelp}><FontAwesomeIcon icon={faCircleQuestion} /></button>
		</div>
	}

	return <><div id="edit" className="panel">
		<Quickbar />
		{create && <>
			<h1 className="create-header">
				<input name="metadata.name" type="text" className={!workingMetadata.name ? "error" : ""} maxLength={50} placeholder={localize("LABEL_CREATE_CHARACTER_NAME")} value={workingMetadata.name || ""} onChange={editCharacter}></input>
				<select name="metadata.faction" value={workingMetadata.faction} onChange={editCharacter}>
					<option value="FACTION_EMPIRE">{localize("FACTION_EMPIRE")}</option>
					<option value="FACTION_REPUBLIC">{localize("FACTION_REPUBLIC")}</option>
				</select>
			</h1>
		</>}
		{!create && <h1>
			<div><label>{localize("LABEL_EDITING")}</label>{metadata.name}</div>
			<button className="button-minimal" aria-label={localize("LABEL_DELETE_CHARACTER", workingMetadata.name || localize("LABEL_THIS_CHARACTER").toLowerCase())} title={localize("LABEL_DELETE_CHARACTER", workingMetadata.name || localize("LABEL_THIS_CHARACTER").toLowerCase())} onClick={deleteCharacter}><FontAwesomeIcon icon={faTrash} /></button>
		</h1>}
		<h3>{localize("LABEL_CHARACTER_IMAGE")}</h3>
		<section className="character-image">
			<div className="image-demo" style={workingProfile.image && { background: `url('${workingProfile.image}')`}} />
			<div>
				<textarea name="profile.image" placeholder={localize("LABEL_CHARACTER_IMAGE_HELPER")} maxLength={10000} value={workingProfile.image} onChange={validateCharacterImage} />
			</div>
		</section>
		<h3>{localize("LABEL_CHARACTER_INFO")}</h3>
		<section className="character-info">
			<div>
				<label>{localize("LABEL_SPECIES")}:</label>
				<select name="metadata.species" value={workingMetadata.species} onChange={editCharacter}>
					{speciesList.map(species => <option key={species} value={species}>{localize(species)}</option>)}
				</select>
			</div>
			<div>
				<label>{localize("LABEL_GENDER")}:</label>
				<select name="metadata.gender" value={workingMetadata.gender} onChange={editCharacter}>
					{(workingMetadata.species === "SPECIES_DROID" ? droidGenderList : genderList).map(gender => <option key={gender} value={gender}>{localize(gender)}</option>)}
				</select>
			</div>
			<div>
				<label>{localize("LABEL_AGE")}:</label>
				<input type="text" name="profile.age" maxLength={50} value={workingProfile.age} onChange={editCharacter}></input>
			</div>
			<div>
				<label>{localize("LABEL_HOMEWORLD")}:</label>
				<div>
					<MarkDownInput maxLength={100} placeholder=" " value={workingMetadata.homeworld || ""} onChange={(e) => editCharacter(e, "metadata.homeworld")} />
				</div>
			</div>
			<div>
				<label>{localize("LABEL_GUILD")}:</label>
				<input type="text" name="metadata.guild" maxLength={30} value={workingMetadata.guild} onChange={editCharacter}></input>
			</div>
		</section>
		<h4>{localize("LABEL_CUSTOM_FIELDS")}</h4>
		<section className="character-custom">
			{workingProfile.customFields?.map((field, index) => <div key={`field${index}`}>
				<input name={`customFields.${index}.0`} type="text" className={!field[0] ? "error" : ""} maxLength={50} placeholder={localize("LABEL__REQUIRED", localize("LABEL_CUSTOM_FIELDS_HELPER_LABEL"))} value={field[0]} onChange={updateCustomFields} data-row={index} data-item={0}></input>
				<input name={`customFields.${index}.1`} type="text" className={!field[1] ? "error" : ""} maxLength={50} placeholder={localize("LABEL__REQUIRED", localize("LABEL_CUSTOM_FIELDS_HELPER_VALUE"))} value={field[1]} onChange={updateCustomFields} data-row={index} data-item={1}></input>
			</div>)}
			<div key={`field${workingProfile.customFields?.length || 0}`}>
				<input name={`customFields.${workingProfile.customFields?.length || 0}.0`} type="text" maxLength={50} placeholder={localize("LABEL_NEW_", localize("LABEL_CUSTOM_FIELDS_HELPER_LABEL"))} onBlur={updateCustomFields} data-row={workingProfile.customFields?.length || 0} data-item={0}></input>
				<input name={`customFields.${workingProfile.customFields?.length || 0}.1`} type="text" maxLength={50} placeholder={localize("LABEL_NEW_", localize("LABEL_CUSTOM_FIELDS_HELPER_VALUE"))} onBlur={updateCustomFields} data-row={workingProfile.customFields?.length || 0} data-item={1}></input>
			</div>
		</section>
	</div>
	<h2>Pages</h2>
	{workingProfile.pages.map((page, index) => {
		const deletePage = () => {
			setPendingCommand(`deletePage|${index}`);

			dispatch(modalActions.showModal({
				key: modalKey.generic,
				data: {
					title: localize("LABEL_CONFIRM"),
					text: localize("LABEL_DELETE_PAGE_CONFIRM"),
					action: true,
				}
			}));
		}

		return <div className="page-holder" key={`p${page.key}${index}`}>
			<div className="edit-button-row"><button onClick={() => updatePage("addPage", index)}>Add Page</button></div>
			<div key={`page.${index}`} className="panel edit-page">
				<Quickbar />
				<h2><input type="text" className={!page.title ? "error" : ""} maxLength={24} placeholder={localize("LABEL_PAGE_TITLE")} value={page.title} onChange={(e) => updatePage("title", index, e.target.value)}></input><button className="button-minimal" aria-label={localize("LABEL_DELETE_PAGE")} title={localize("LABEL_DELETE_PAGE")} onClick={deletePage}><FontAwesomeIcon icon={faTrash} /></button></h2>
				{page.sections.map((section, secIdx) => {
					switch (section.type) {
						case "frame":
							return <>
								<AddSection pageIdx={index} secIdx />
								<SectionFrame key={`s${secIdx}:${section.key}`} section={section} postChange={(command, data) => updatePage(command, index, { secIdx, section: data })} />
							</>
						case "itemized":
							return <>
								<AddSection pageIdx={index} secIdx />
								<SectionItemized key={`s${secIdx}:${section.key}`} section={section} postChange={(command, data) => updatePage(command, index, { secIdx, section: data })} />
							</>
						case "table":
							return <>
								<AddSection pageIdx={index} secIdx />
								<SectionTable key={`s${secIdx}:${section.key}`} section={section} postChange={(command, data) => updatePage(command, index, { secIdx, section: data })} />
							</>
						case "text":
							return <>
								<AddSection pageIdx={index} secIdx />
								<SectionText key={`s${secIdx}:${section.key}`} section={section} postChange={(command, data) => updatePage(command, index, { secIdx, section: data })} />
							</>
						default:
							return null;
					}
				})}
				<AddSection pageIdx={index} secIdx={page.sections.length} />
			</div>
		</div>})}
	<div className="edit-button-row"><button onClick={() => updatePage("addPage", workingProfile.pages.length)}>Add Page</button></div>
	</>;
}

export default Edit;