import { useSelector } from "react-redux";

import Profile from "../../../../components/Profile/Profile";

import { modalSelectors } from "../../../../store/slice/modal";

function ModalPreview() {
	const modalData = useSelector(modalSelectors.data);

	return <div className="holder"><Profile metadata={modalData.metadata} profileData={modalData.profile} /></div>
}

ModalPreview.clickOff = true;

export default ModalPreview;