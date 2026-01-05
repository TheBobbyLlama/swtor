import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Profile from "../../components/Profile/Profile";
import Edit from "../../components/Edit/Edit";
import NotesPanel from "./NotesPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressBook, faClipboard, faFilter, faKeyboard, faLock, faPenToSquare, faPlus, faReceipt, faUpRightFromSquare, faUser, faUserSlash, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

import spinner from "../../assets/images/spinner.gif";
import useFade from "../../hooks/useFade";
import { authActions, authSelectors } from "../../store/slice/auth";
import { charActions, charSelectors } from "../../store/slice/character";
import { modalKey, modalActions } from "../../store/slice/modal";
import characterFuncs from "../../db/character";
import { localize } from "../../localization";
import { getUrlBase, stripMarkdown } from "../../util";
import { dbTransform } from "../../util";

import "./Browse.css";

function Browse() {
	const ref = useRef(null);
	const user = useSelector(authSelectors.user);
	const [ server, setServer ] = useState(localStorage.getItem("SWTOR_Server") || "starforge");
	const [ characterDB, setCharacterDB] = useState(null);
	const [ factionFilter, setFactionFilter ] = useState([]);
	const [ curCharacter, setCurCharacter ] = useState("");
	const [ showNotes, setShowNotes ] = useState(false);
	const [ userNotes, setUserNotes ] = useState(null);
	const [ attractMode, setAttractMode ] = useState(!user);
	const [ editMode, setEditMode ] = useState(false);
	const fadeTransition = useFade(ref);
	const charFilter = useSelector(charSelectors.filter);
	const dispatch = useDispatch();

	const workingList = characterDB ? Object.values(characterDB.metadata).filter(data => {
		if ((data.private) && (data.uid !== user?.uid)) return false;
		if (factionFilter.indexOf(data.faction) > -1) return false;
		if ((charFilter.users) && (charFilter.users.indexOf(data.creator) === -1)) return false;
		if ((charFilter.species) && (charFilter.species.indexOf(data.species) > -1)) return false;
		if ((charFilter.gender) && (charFilter.gender.indexOf(data.gender) > -1)) return false;
		if ((charFilter.homeworld) && (charFilter.homeworld.find(world => world === stripMarkdown(data.homeworld)))) return false;

		return true;
	 }) : [];

	const charKey = dbTransform(curCharacter);

	const changeCharacter = (name) => {
		const newKey = dbTransform(name);

		setShowNotes(false);
		setEditMode(false);

		if (newKey) {
			if (characterDB.profiles[newKey]) {
				setCurCharacter(name);
				setEditMode(false);
			} else {
				characterFuncs.getCharacterProfileData(server, newKey).then((result) => {
					const newDB = {
						metadata: characterDB.metadata,
						profiles: {...characterDB.profiles, [newKey]: result }
					};

					setCharacterDB(newDB);
					setCurCharacter(name);
				});
			}
		}
	}

	// Restore user on startup
	useEffect(() => {
		dispatch(authActions.startupTasks());
	}, []);

	useEffect(() => {
		if (user) {
			dispatch(charActions.setListFilter({ users: [ user.displayName ] }));
		} else {
			dispatch(charActions.setListFilter({ }));
		}
	}, [ user ]);

	// Load character data
	useEffect(() => {
		if (!characterDB) {
			characterFuncs.getCharacterMetadata(server).then((result) => {
				const newDB = { 
					metadata: result,
					profiles: {}
				};

				setCharacterDB(newDB);
			});
		}
	}, [characterDB]);

	useEffect(() => {
		if ((workingList.length) && (!workingList.find(data => data.name === curCharacter)))
			changeCharacter(workingList[0]?.name || "");
	}, [workingList]);

	useEffect(() => {
		setUserNotes(null);
		setShowNotes(false);

		if (!user) {
			setEditMode(false);
		} else {
			characterFuncs.loadUserNotes(server, user.uid).then(setUserNotes);
			setAttractMode(false);
		}
	}, [user]);

	if (!characterDB) {
		return <img src={spinner} alt="One moment..." />;
	}

	const doLogin = () => {
		dispatch(modalActions.showModal({ key: modalKey.login }));
	}

	const doLogout = () => {
		dispatch(modalActions.showModal({
			key: modalKey.generic,
			data: {
				title: localize("LABEL_LOGOUT"),
				text: localize("LABEL_LOGOUT_CONFIRM", user.displayName),
				action: authActions.logout(),
			}
		}));
	}

	const startDiscordPost = () => {
		dispatch(modalActions.showModal({ key: modalKey.discordPost }));
	}

	const goHelperPage = (e) => {
		if ((!e) || (e.button === 1))
			window.open(`${getUrlBase()}/helper`);
	}

	const copyProfileLink = () => {
		if (curCharacter) {
			navigator.clipboard.writeText(`${window.location.origin}${getUrlBase()}/view/${encodeURI(curCharacter)}`);
		}
	}

	const setFilterByUser = (user) => {
		dispatch(charActions.setListFilter({ users: [ user ] }));
	}

	const goCharacterProfile = () => {
		if (curCharacter) {
			window.open(`${getUrlBase()}/view/${curCharacter}`);
		}
	}

	const toggleFactionFilter = (faction) => {
		if (factionFilter.indexOf(faction) > -1) {
			setFactionFilter(factionFilter.filter(current => current !== faction));
		} else {
			setFactionFilter([...factionFilter, faction]);
		}
	}

	const showCharacterFilter = () => {
		const newMetadata = { ...characterDB.metadata };

		Object.keys(newMetadata).forEach((key) => {
			if ((newMetadata[key].private) && (newMetadata[key].uid !== user?.uid)) {
				delete newMetadata[key];
			}
		})

		dispatch(modalActions.showModal({
			key: modalKey.characterFilter,
			data: {
				metadata: newMetadata
			}
		}));
	}

	const toggleEditMode = (forceValue) => {
		if (forceValue !== undefined) {
			fadeTransition(setEditMode, forceValue);
		} else {
			fadeTransition(setEditMode, !editMode);
		}
	}

	const saveCharacter = async (metadata, profile) => {
		const nameKey = dbTransform(metadata.name);

		if (editMode === "create") {
			if (characterDB.profiles[nameKey]) throw new Error(localize("ERROR_CHARACTER_EXISTS", metadata.name));
			
			const profileTest = await characterFuncs.getCharacterProfileData(server, nameKey);
			
			if (profileTest) throw new Error(localize("ERROR_CHARACTER_EXISTS", metadata.name));
		}

		await characterFuncs.saveCharacter(server, metadata, profile);

		const newDB = { ...characterDB, metadata: { ...characterDB.metadata }, profiles: { ...characterDB.profiles } };
		newDB.metadata[nameKey] = metadata;
		newDB.profiles[nameKey] = profile;
		setCharacterDB(newDB);
		setCurCharacter(metadata.name);
		setEditMode(true); // Clear character creation state
	}

	const updateCharacterNotes = (value) => {
		if ((user) && (value !== null)) {
			const newNotes = { ...userNotes };
			newNotes[charKey] = value;
			setUserNotes(newNotes);
			characterFuncs.saveCharacterNotes(server, user.uid, charKey, value);
		}
	
		setShowNotes(false);
	}

	const deleteCharacter = async (name) => {
		await characterFuncs.deleteCharacter(server, name);

		const nameKey = dbTransform(name);
		const newDB = { ...characterDB, metadata: { ...characterDB.metadata }, profiles: { ...characterDB.profiles } };
		delete newDB.metadata[nameKey];
		delete newDB.profiles[nameKey];
		fadeTransition(() => {
			setCharacterDB(newDB);
			setCurCharacter(null);
		});
	}

	return <div id="browse">
		<div className="character-list">
			<div className="quick-links">
				{!user && <button className={`button-minimal${attractMode ? " notice-me" : ""}`} aria-label={localize("LABEL_LOGIN_SIGNUP")} title={localize("LABEL_LOGIN_SIGNUP")} onClick={doLogin}><FontAwesomeIcon icon={faUserSlash} className="hover-hide" /><FontAwesomeIcon icon={faUser} className="hover-only" /></button>}
				{user && <button className="button-minimal" aria-label={localize("LABEL_LOGOUT_USER", user.displayName)} title={localize("LABEL_LOGOUT_USER", user.displayName)} onClick={doLogout}><FontAwesomeIcon icon={faUser} className="hover-hide" /><FontAwesomeIcon icon={faUserXmark} className="hover-only" /></button>}
				<button className="button-minimal" aria-label={localize("LABEL_DISCORD_POST")} title={localize("LABEL_DISCORD_POST")} onClick={startDiscordPost}><FontAwesomeIcon icon={faDiscord} /></button>
				<button className="button-minimal no-mobile" aria-label={localize("LABEL_RP_HELPER")} title={localize("LABEL_RP_HELPER")} onClick={() => goHelperPage()} onMouseDown={goHelperPage}><FontAwesomeIcon icon={faKeyboard} /></button>
			</div>
			<div className={`header${editMode ? " disabled" : ""}`}>
				<div>
					<button className={`filter republic${factionFilter.indexOf("FACTION_REPUBLIC") > -1 ? "" : " enabled"}`} aria-label={localize("LABEL_FILTER_REPUBLIC")} title={localize("LABEL_FILTER_REPUBLIC")} onClick={() => toggleFactionFilter("FACTION_REPUBLIC")}></button>
					<button className={`filter empire${factionFilter.indexOf("FACTION_EMPIRE") > -1 ? "" : " enabled"}`} aria-label={localize("LABEL_FILTER_EMPIRE")} title={localize("LABEL_FILTER_EMPIRE")} onClick={() => toggleFactionFilter("FACTION_EMPIRE")}></button>
				</div>
				<h3>{localize("LABEL_CHARACTERS")}</h3>
				<button className={`button-minimal${Object.keys(charFilter).length ? " active" : ""}`} aria-label={localize("LABEL_FILTERS")} title={localize("LABEL_FILTERS")} onClick={showCharacterFilter}><FontAwesomeIcon icon={faFilter} /></button>
			</div>
			<div className={`characters no-mobile${editMode ? " disabled" : ""}`}>
				{user && <button className="button-small" aria-label={localize("LABEL_CREATE_CHARACTER")} title={localize("LABEL_CREATE_CHARACTER")} onClick={() => toggleEditMode("create")}>{localize("LABEL_CREATE_CHARACTER")}</button>}
				{workingList.map(data => <button key={data.name} className={data.faction === "FACTION_EMPIRE" ? "empire" : "republic"} onClick={() => changeCharacter(data.name)} disabled={data.name === curCharacter}>{user && data.private && <FontAwesomeIcon icon={faLock} />}{data.name}</button>)}
			</div>
			<div className={`characters mobile-only${editMode ? " disabled" : ""}`}>
				<select value={curCharacter} onChange={(e) => changeCharacter(e.target.value)}>
					{workingList.map(data => <option key={data.name} value={data.name}>{user && data.private && "[["}{data.name}{user && data.private && "]]"}</option>)}
				</select>
				{user && <button className="button-small" aria-label={localize("LABEL_CREATE_CHARACTER")} title={localize("LABEL_CREATE_CHARACTER")} onClick={() => toggleEditMode("create")}><FontAwesomeIcon icon={faPlus} /></button>}
			</div>
		</div>
		<div ref={ref} className="character-profile">
			{(!!workingList.length && curCharacter) && <>
				{!editMode && <>
					<div className="profile-tools">
						{((charFilter.users?.length !== 1) || (charFilter.users[0] !== characterDB.metadata[charKey].creator)) && (workingList.filter(meta => meta.uid === characterDB.metadata[charKey].uid).length > 1) && <button className="button-minimal" aria-label={localize("LABEL_USER_CHARACTERS", characterDB.metadata[charKey].creator)} title={localize("LABEL_USERS_CHARACTERS", characterDB.metadata[charKey].creator)} onClick={() => setFilterByUser(characterDB.metadata[charKey].creator)}><FontAwesomeIcon icon={faAddressBook} /></button>}
						{!characterDB.metadata[charKey].private && <><button className="button-minimal" aria-label={localize("LABEL_CHARACTER_LINK", curCharacter)} title={localize("LABEL_CHARACTER_LINK", curCharacter)} onClick={copyProfileLink}><FontAwesomeIcon icon={faClipboard} /></button>
						<button className="button-minimal" aria-label={localize("LABEL_VIEW_CHARACTER")} title={localize("LABEL_VIEW_CHARACTER")} onClick={goCharacterProfile}><FontAwesomeIcon icon={faUpRightFromSquare} /></button></>}
					</div>
					<div className="profile-holder">
						<div>
							{user && <div className="edit">
								{(userNotes !== null) && <button className="button-minimal" aria-label={localize(userNotes[charKey] ? "LABEL_NOTES_VIEW" : "LABEL_NOTES_ADD", curCharacter)} title={localize(userNotes[charKey] ? "LABEL_NOTES_VIEW" : "LABEL_NOTES_ADD", curCharacter)} onClick={() => setShowNotes(true)}><FontAwesomeIcon icon={userNotes[charKey] ? faReceipt : faPlus} /></button>}
								{user.uid === characterDB.metadata[charKey].uid && <button className="button-minimal" aria-label={localize("LABEL_EDIT_CHARACTER", curCharacter)} title={localize("LABEL_EDIT_CHARACTER", curCharacter)} onClick={() => toggleEditMode()}><FontAwesomeIcon icon={faPenToSquare} /></button>}
							</div>}
							<Profile metadata={characterDB.metadata[charKey]} profileData={characterDB.profiles[charKey]} notes={"Hello world!"} />
							{user && showNotes && <NotesPanel character={curCharacter} notes={userNotes[charKey] || ""} updateFunc={updateCharacterNotes} />}
						</div>
					</div>
				</>}
				{editMode && <div className="edit-holder">
					<Edit create={editMode === "create"} user={user} metadata={characterDB.metadata[charKey]} profileData={characterDB.profiles[charKey]} leaveFunc={() => toggleEditMode(false)} saveFunc={saveCharacter} deleteFunc={deleteCharacter} />
				</div>}
			</>}
		</div>
	</div>;
}

export default Browse;