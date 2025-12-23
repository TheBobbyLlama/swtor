import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import ModalGeneric from "./components/ModalGeneric/ModalGeneric";
import ModalSpinner from "./components/ModalSpinner/ModalSpinner";
import ModalLogin from "./components/ModalLogin/ModalLogin";
import ModalCharacterFilter from "./components/ModalCharacterFilter/ModalCharacterFilter";
import ModalPreview from "./components/ModalPreview/ModalPreview";
import ModalSectionHelp from "./components/ModalSectionHelp/ModalSectionHelp";
import ModalDiscordPost from "./components/ModalDiscordPost/ModalDiscordPost";

import { modalActions, modalKey, modalSelectors } from "../../store/slice/modal";

import "./ModalManager.css";

function ModalManager() {
	const currentKey = useSelector(modalSelectors.key);
	const [ startClickOff, setStartClickOff ] = useState(false);
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
			case modalKey.characterFilter:
				ModalComponent = ModalCharacterFilter;
				break;
			case modalKey.preview:
				ModalComponent = ModalPreview;
				break;
			case modalKey.sectionHelp:
				ModalComponent = ModalSectionHelp;
				break;
			case modalKey.discordPost:
				ModalComponent = ModalDiscordPost;
				break;
			default:
				ModalComponent = null;
		}

		const checkClickOff = (e) => {
			if (e.button === 0) {
				setStartClickOff((e.target.id === "modalBG") && (ModalComponent.clickOff));
			}
		}

		const clickOff = (e) => {
			if ((e.button === 0) && (startClickOff) && (e.target.id === "modalBG") && (ModalComponent.clickOff)) {
				dispatch(modalActions.showModal({ key: modalKey.clear }));
			}
		}

		if (ModalComponent) {
			return <div id="modalBG" onMouseDown={checkClickOff} onMouseUp={clickOff}>
				<ModalComponent />
			</div>;
		}
	}
	
	return null;
}

export default ModalManager;