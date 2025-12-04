import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import MarkdownTextArea from "../../Markdown/MarkdownTextArea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { modalActions, modalKey, modalSelectors } from "../../../store/slice/modal";
import { localize } from "../../../localization";

function trimArray(arr) {
	while ((arr.length) && (!arr[arr.length - 1])) {
		arr.splice(arr.length - 1, 1);
	}
}

function SectionTable({ section, postChange }) {
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

	const updateSection = (e) => {
		const target = e.target.name;
		const newValue = e.target.value;
		const newData = { ...workingData, [target]: newValue };

		setWorkingData(newData);
		postChange("updateSection", newData);
	}

	const updateHeaders = (e) => {
		const index = e.target.dataset["index"];
		const newData = { ...workingData, headers: [ ...workingData.headers ] };

		newData.headers[index] = e.target.value;
		trimArray(newData.headers);

		setWorkingData(newData);
		postChange("updateSection", newData);
	}

	const updateData = (e, [ row, index ]) => {
		const newData = { ...workingData, data: [ ...workingData.data ] };

		while (row >= newData.data.length) {
			newData.data.push([]);
		}

		newData.data[row] = [ ...newData.data[row] ];
		newData.data[row][index] = e;
		trimArray(newData.data[row]);

		while((newData.data.length > 0) && (!newData.data[newData.data.length - 1].find(value => value))) {
			newData.data.splice(newData.data.length - 1, 1);
		}

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

	const width = Math.max(workingData.headers.length, workingData.data.reduce((result, current) => { return Math.max(result, current.length)}, workingData.data[0]?.length || 0));

	const generateHeaderElements = () => {
		const result = [];

		for (let i = 0; i <= width; i++) {
			result.push(<th key={`header${i}`}><input type="text" placeholder={localize("LABEL_TABLE_HEADER")} value={workingData.headers[i] || ""} onChange={updateHeaders} data-index={i}></input></th>);
		}

		return result;
	}

	const generateDataRow = (row) => {
		const result = [];

		for (let i = 0; i <= width; i++) {
			result.push(<td>
				<MarkdownTextArea key={`d${row}${i}`} contentEditableClassName={"text-input"} value={workingData.data[row][i] || ""} onChange={(e) => updateData(e, [ row, i ])} />
			</td>);
		}

		return result;
	}

	const generateDataTable = () => {
		const result = [];

		for (let row = 0; row < workingData.data.length; row++) {
			result.push(<tr>
				{generateDataRow(row)}
			</tr>);
		}

		return result;
	}

	const generateAdditiveRow = () => {
		const result = [];

		for (let i = 0; i <= width; i++) {
			result.push(<td>
				<MarkdownTextArea key={`d${workingData.data.length}${i}`} contentEditableClassName={"text-input"} value="" onBlur={(e) => e && updateData(e, [ workingData.data.length, i ])} />
			</td>);
		}

		return <tr>{result}</tr>;
	}

	return <section>
		<h3><input data-index={1} type="text" name="heading" maxLength={255} placeholder={localize("LABEL_HEADING_HELPER")} value={workingData.heading} onChange={updateSection}></input><button className="button-minimal" aria-label={localize("LABEL_DELETE_SECTION")} title={localize("LABEL_DELETE_SECTION")} onClick={deleteSection}><FontAwesomeIcon icon={faTrash} /></button></h3>
		<div className="table-holder">
			<table><tbody>
				<tr>
					{generateHeaderElements()}
				</tr>
				{generateDataTable()}
				{generateAdditiveRow()}
			</tbody></table>
		</div>
		{/* <div className="itemized-container">
			{workingData.items.map((item, index) => 
				<input key={`itemized${workingData.key}${index}`} type="text" name="items" maxLength={255} value={item} onChange={updateItems} data-index={index}></input>
			)}
			<input key={`itemized${workingData.key}${workingData.items.length}`} type="text" name="items" maxLength={255} onBlur={updateItems} data-index={workingData.items.length}></input>
		</div> */}
	</section>
}

export default SectionTable;