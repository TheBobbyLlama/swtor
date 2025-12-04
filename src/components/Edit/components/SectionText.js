import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MarkdownTextArea from "../../Markdown/MarkdownTextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { modalActions, modalKey, modalSelectors } from "../../../store/slice/modal";
import { localize } from "../../../localization";

function SectionText({ section, postChange }) {
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
		let target;
		let newValue;

		if (dataPath) {
			target = dataPath;
			newValue = e;
		} else {
			target = e.target.name;
			newValue = e.target.value;
		}

		const newData = { ...workingData, [target]: newValue };
		setWorkingData(newData);
		postChange("updateSection", newData);
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
		<MarkdownTextArea name="content" maxLength={10000} value={(workingData.content || "").replace(/\\n/g, "\n")} onChange={(e) => updateSection(e, "content")} />
	</section>
}

export default SectionText;