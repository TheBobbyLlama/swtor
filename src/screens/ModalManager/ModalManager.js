import { useDispatch, useSelector } from "react-redux";
import ModalGeneric from "./components/ModalGeneric/ModalGeneric";
import ModalSpinner from "./components/ModalSpinner/ModalSpinner";
import ModalLogin from "./components/ModalLogin/ModalLogin";
import ModalPreview from "./components/ModalPreview/ModalPreview";
import ModalSectionHelp from "./components/ModalSectionHelp/ModalSectionHelp";

import { modalActions, modalKey, modalSelectors } from "../../store/slice/modal";

import "./ModalManager.css";

function ModalManager() {
	const currentKey = useSelector(modalSelectors.key);
	const dispatch = useDispatch();

	if (currentKey) {
		let ModalComponent;

		switch (currentKey) {
			case modalKey.generic:
				ModalComponent = ModalGeneric;
				break;
			case modalKey.spinner:
				ModalComponent = ModalSpinner;
				break;
			case modalKey.login:
				ModalComponent = ModalLogin;
				break;
			case modalKey.preview:
				ModalComponent = ModalPreview;
				break;
			case modalKey.sectionHelp:
				ModalComponent = ModalSectionHelp;
				break;
			default:
				ModalComponent = null;
		}

		const clickOff = (e) => {
			if ((e.target.id === "modalBG") && (ModalComponent.clickOff)) {
				dispatch(modalActions.showModal({ key: modalKey.clear }));
			}
		}

		if (ModalComponent) {
			return <div id="modalBG" onClick={clickOff}>
				<ModalComponent />
			</div>;
		}
	}
	
	return null;
}

export default ModalManager;