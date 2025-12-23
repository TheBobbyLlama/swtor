import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownAZ, faTrash } from "@fortawesome/free-solid-svg-icons";

import { modalActions, modalKey, modalSelectors } from "../../../store/slice/modal";
import { stripMarkdown } from "../../../util";
import { localize } from "../../../localization";

function SectionItemized({ section, postChange }) {
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

	const updateItems = (e) => {
		const index = e.target.dataset["index"];
		const newData = { ...workingData, items: [ ...workingData.items ] };

		newData.items[index] = e.target.value;
		newData.items = newData.items.filter(item => item);

		setWorkingData(newData);
		postChange("updateSection", newData);
	}

	const sortItems = () => {
		const newData = { ...workingData, items: [ ...workingData.items ] };
		newData.items.sort((a, b) => stripMarkdown(a).localeCompare(stripMarkdown(b)));
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
		<h3><input data-index={1} type="text" name="heading" maxLength={255} placeholder={localize("LABEL_HEADING_HELPER")} value={workingData.heading} onChange={updateSection}></input><button className="button-minimal" aria-label={localize("LABEL_DELETE_SECTION")} title={localize("LABEL_DELETE_SECTION")} onClick={deleteSection}><FontAwesomeIcon icon={faTrash} /></button></h3>
		<div className="itemized-container">
			{workingData.items.map((item, index) => 
				<input key={`itemized${workingData.key}${index}`} type="text" name="items" maxLength={255} value={item} onChange={updateItems} data-index={index}></input>
			)}
			<input key={`itemized${workingData.key}${workingData.items.length}`} type="text" name="items" maxLength={255} onBlur={updateItems} data-index={workingData.items.length}></input>
		</div>
		<div className="edit-button-row">
			<button className="button-minimal" aria-label={localize("LABEL_SORT")} title={localize("LABEL_SORT")} onClick={sortItems}><FontAwesomeIcon icon={faArrowDownAZ} /></button>	
		</div>
	</section>
}

export default SectionItemized;