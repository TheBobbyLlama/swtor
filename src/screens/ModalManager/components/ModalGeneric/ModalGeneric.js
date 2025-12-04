import { useDispatch, useSelector } from "react-redux";
import { modalActions, modalKey, modalSelectors } from "../../../../store/slice/modal";

import { localize } from "../../../../localization";

function generateTextMarkup(text, index) {
	const split = text.split(":");
	const remainder = split.slice(1).join(":");

	switch(split[0]) {
		case "CODE":
			return <code key={index}>{remainder}</code>;
		case "LIST":
			return <div key={index} className="list">{remainder}</div>;
		case "HEADER":
			return <h3 key={index}>{remainder}</h3>;
		case "WARNING":
			return <h3 key={index} className="warning">{remainder}</h3>;
		default:
			return <p key={index}>{text}</p>;
	}
}

function ModalGeneric() {
	const modalData = useSelector(modalSelectors.data);
	const dispatch = useDispatch();

	const doAction = () => {
		if (modalData.action) {
			// Action of 'true' means this was a confirmation dialog
			if (modalData.action === true) {
				dispatch(modalActions.applyConfirmation());
				dispatch(modalActions.clearModal());
			} else {
				dispatch(modalData.action);

				// Clear the modal if we're not chaining into a different one.
				if (!modalData.action.type.startsWith("modal")) {
					dispatch(modalActions.clearModal());
				}
			}
		} else {
			dispatch(modalActions.clearModal());
		}
	}

	const cancelAction= () => {
		dispatch(modalActions.clearModal());
	}

	return <section className="panel" style={{ minWidth: modalData.width ? modalData.width : "auto" }}>
		<h2>{modalData.title}</h2>
		{ modalData.text.map ?
			modalData.text.map((item, index) => generateTextMarkup(item, index)) : generateTextMarkup(modalData.text)}
		<div>
			<button onClick={doAction}>{modalData.buttonLabel || localize("LABEL_OK")}</button>
			{modalData.action && !modalData.error && <button onClick={cancelAction}>{localize("LABEL_CANCEL")}</button>}
		</div>
	</section>;
}

export default ModalGeneric;