import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { charActions, charSelectors } from "../../../../store/slice/character";
import { modalActions, modalSelectors } from "../../../../store/slice/modal";
import { localize } from "../../../../localization";
import { stripMarkdown } from "../../../../util";

import "./ModalCharacterFilter.css";

function FilterList ({ items, filter, inverted, onItemClick }) {
	return <div className="filter-list">
		{items.map(item => <div key={item} className={((filter.indexOf(item) === -1) ^ inverted ? "selected" : "")} onClick={() => onItemClick(item)}>{localize(item)}</div>)}
	</div>
}

function ModalCharacterFilter() {
	const [ workingFilter, setWorkingFilter ] = useState(useSelector(charSelectors.filter));
	const { metadata } = useSelector(modalSelectors.data);
	const dispatch = useDispatch();

	const genderOptions = [ ...new Set(Object.values(metadata).map(data => data.gender)) ].toSorted();
	const speciesOptions = [ ...new Set(Object.values(metadata).map(data => data.species)) ].toSorted();
	const planetOptions = [ ...new Set(Object.values(metadata).map(data => stripMarkdown(data.homeworld))) ].toSorted();
	const userOptions = [ ...new Set(Object.values(metadata).map(data => data.creator)) ].toSorted();

	const updateFilter = (key, value) => {
		const newFilter = { ...workingFilter };

		if (!newFilter[key]) {
			switch (key) {
				case "users":
					newFilter[key] = [ ...userOptions ];
					break;
				default:
					newFilter[key] = [];
					break;
			}
		}

		if (newFilter[key].indexOf(value) === -1) {
			newFilter[key] = [ ...newFilter[key], value ];
		} else {
			newFilter[key] = newFilter[key].filter(item => item !== value);
		}

		console.log(newFilter[key]);

		setWorkingFilter(newFilter);
	}

	const doReset = () => {
		setWorkingFilter({});
	}

	const doApply = () => {
		dispatch(charActions.setListFilter(workingFilter));
		dispatch(modalActions.clearModal());
	}

	const doCancel = () => {
		dispatch(modalActions.clearModal());
	}

	return <div id="filter" className="panel">
		<h2>{localize("LABEL_CHARACTER_FILTER")}</h2>
		<div className="filter-body">
			<div>
				<div>
					<label>{localize("LABEL_SPECIES")}</label>
					<FilterList items={speciesOptions} filter={workingFilter.species || []} onItemClick={(value) => updateFilter("species", value)} />
				</div>
				<div>
					<label>{localize("LABEL_GENDER")}</label>
					<FilterList items={genderOptions} filter={workingFilter.gender || []} onItemClick={(value) => updateFilter("gender", value)} />
				</div>
			</div>
			<div>
				<div>
					<label>{localize("LABEL_HOMEWORLD")}</label>
					<FilterList items={planetOptions} filter={workingFilter.homeworld || []} onItemClick={(value) => updateFilter("homeworld", value)} />
				</div>
			</div>
			<div>
				<div>
					<label>{localize("LABEL_USER")}</label>
					<FilterList items={userOptions} filter={workingFilter.users || []} inverted={!!workingFilter.users} onItemClick={(value) => updateFilter("users", value)} />
				</div>
			</div>
		</div>
		<div className="button-row">
			<button onClick={doReset}>{localize("LABEL_RESET")}</button>
			<button onClick={doApply}>{localize("LABEL_APPLY")}</button>
			<button onClick={doCancel}>{localize("LABEL_CANCEL")}</button>
		</div>
	</div>
}

ModalCharacterFilter.clickOff = true;

export default ModalCharacterFilter;