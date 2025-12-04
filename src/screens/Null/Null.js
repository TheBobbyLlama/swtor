import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { localize } from "../../localization";
import spinner from "../../assets/images/spinner.gif";

function Null() {
	const navigate = useNavigate();

	useEffect(() => {
		setTimeout(navigate, 500, "/", { replace: true });
	}, [navigate]);

	return <div style={{ alignItems: "center", display: "flex", flexDirection: "column" }}><h2>{localize("LABEL_PAGE_NOT_FOUND")}</h2><img src={spinner} alt="One moment..." /></div>;
}

export default Null;