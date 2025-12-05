import { useNavigate } from "react-router-dom";

import Edit from "../../components/Edit/Edit";

function Demo () {
	const navigate = useNavigate();
	return <Edit create={true} demo={true} user={{ displayName: "DemoUser", uid: 42069 }} leaveFunc={() => navigate("/")} />
}

export default Demo;