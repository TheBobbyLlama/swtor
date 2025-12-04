import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MarkdownTextArea from "../../Markdown/MarkdownTextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { modalActions, modalKey, modalSelectors } from "../../../store/slice/modal";
import { localize } from "../../../localization";

function SectionFrame({ section, postChange }) {
	const [ workingData, setWorkingData ] = useState(section);
	const [ pendingCommand, setPendingCommand ] = useState();
	const modalConfirmed = useSelector(modalSelectors.confirm);
	const dispatch = useDispatch();

	useEffect(() => {
		if ((pendingCommand) && (modalConfirmed)) {
			dispatch(modalActions.consumeConfirmation());
			deleteSectionConfirmed();
		}
	}, [ modalConfirmed ]);

	const updateSection = (e, dataPath) => {
		const target = e.target.name;
		const newValue = e.target.value;

		const newData = { ...workingData, [target]: newValue };
		setWorkingData(newData);
		postChange("updateSection", newData);
	}

	const validUrl = () => {
		return !!workingData.url.match(/^(?:(?:https?):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i);
	}

	const deleteSection = () => {
		setPendingCommand("deleteSection");

		dispatch(modalActions.showModal({
			key: modalKey.generic,
			data: {
				title: localize("LABEL_CONFIRM"),
				text: localize("LABEL_DELETE_SECTION_CONFIRM"),
				action: true,
			}
		}));
	}

	const deleteSectionConfirmed = () => {
		postChange(pendingCommand);
		setPendingCommand(null);
	}

	return <section>
		<h3><input type="text" name="heading" maxLength={255} placeholder={localize("LABEL_HEADING_HELPER")} value={workingData.heading} onChange={updateSection}></input><button className="button-minimal" aria-label={localize("LABEL_DELETE_SECTION")} title={localize("LABEL_DELETE_SECTION")} onClick={deleteSection}><FontAwesomeIcon icon={faTrash} /></button></h3>
		<input name="url" type="url" className={validUrl()? "valid" : "invalid"} placeholder={localize("LABEL_ENTER_URL")} value={workingData.url} onChange={updateSection} />
	</section>
}

export default SectionFrame;