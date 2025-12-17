import { useEffect, useRef, useState } from "react";

import MarkdownTextArea from "../../components/Markdown/MarkdownTextArea";
import MarkdownView from "react-showdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";


import useFade from "../../hooks/useFade";
import { localize } from "../../localization";

function NotesPanel({ character, notes, updateFunc }) {
	const ref = useRef(null);
	const [ editMode, setEditMode ] = useState(!notes);
	const [ charNotes, setCharNotes ] = useState(notes);
	const fadeTransition = useFade(ref);

	useEffect(() => {
		setEditMode(!notes);
		fadeTransition(() => {});
	}, [ character ]);

	const toggleEditMode = () => {
		setEditMode(!editMode);
	}

	const clickOff = (e) => {
		if ((e.target.id === "modalBG") && ((!editMode) || (!notes && !charNotes))) {
			updateFunc(null);
		}
	}

	return <div id="modalBG" onClick={clickOff}>
		<div id="character-notes" className="panel fade-out" ref={ref}>
			<h2>{localize("LABEL_NOTES")}<button className="button-minimal" aria-label={localize("LABEL_NOTES_EDIT", character)} title={localize("LABEL_NOTES_EDIT", character)} onClick={toggleEditMode}><FontAwesomeIcon icon={faPen} /></button></h2>
			{!editMode && <div className="scrollable">
				<MarkdownView markdown={charNotes || `*${localize("LABEL_NOTES_NONE")}*`} />
			</div>}
			{editMode && <>
				<MarkdownTextArea maxLength={10000} placeholder={localize("LABEL_NOTES_CHARACTER_HELPER", character)} value={charNotes} onChange={setCharNotes} />
				<div className="button-row">
					<button disabled={charNotes === notes} onClick={() => updateFunc(charNotes)}>{localize("LABEL_SAVE")}</button>
					<button onClick={() => updateFunc(null)}>{localize("LABEL_CANCEL")}</button>
				</div>
			</>}
		</div>
	</div>;
}

export default NotesPanel;