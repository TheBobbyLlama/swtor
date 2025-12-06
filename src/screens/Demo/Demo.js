import { useNavigate } from "react-router-dom";

import Edit from "../../components/Edit/Edit";

function Demo () {
	const navigate = useNavigate();
	return <div className="edit-holder">
		<Edit create={true} demo={true} user={{ displayName: "Demo", uid: 42069 }} leaveFunc={() => navigate("/")} />
	</div>;
}

export default Demo;