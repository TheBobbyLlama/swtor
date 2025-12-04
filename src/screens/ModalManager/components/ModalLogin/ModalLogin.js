import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authActions, authSelectors } from "../../../../store/slice/auth";
import { modalActions } from "../../../../store/slice/modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey, faLock, faUser } from "@fortawesome/free-solid-svg-icons";

import { localize } from "../../../../localization";
import spinner from "../../../../assets/images/spinner.gif";

import "./ModalLogin.css";

function ModalLogin() {
	const [ signup, setSignUp ] = useState(false);
	const [ userInfo, setUserInfo ] = useState({displayName: "", email: "", password: "" });
	const [ passwordConfirm, setPasswordConfirm ] = useState("");
	const authBusy = useSelector(authSelectors.busy);
	const authUser = useSelector(authSelectors.user);
	const authError = useSelector(authSelectors.error);
	const dispatch = useDispatch();

	useEffect(() => {
		if (authUser) {
			dispatch(modalActions.clearModal());
		}
	}, [authUser]);

	if (authBusy) {
		return <img src={spinner} alt="One moment..." />;
	}

	const swapFormState = (e) => {
		e.preventDefault();
		setSignUp(!signup);
	}

	const updateUserInfo = (e) => {
		if (e.target.name) {
			let tmpInfo = { ...userInfo };
			let tmpValue = e.target.value;

			if (e.target.name === "displayName") {
				tmpValue = tmpValue.replace(/\W/g, "");
			}

			tmpInfo[e.target.name] = tmpValue;

			setUserInfo(tmpInfo);
			dispatch(authActions.clearError());
		}
	}

	const doLogin = (e) => {
		e.preventDefault();

		if ((userInfo.email) && (userInfo.password)) {
			dispatch(authActions.login(userInfo));
		} else {
			dispatch(authActions.error("ERROR_MISSING_DATA"));
		}
	}

	const doSignup = (e) => {
		e.preventDefault();

		if ((userInfo.displayName) && (userInfo.email) && (userInfo.password)) {
			dispatch(authActions.signup(userInfo));
		} else {
			dispatch(authActions.error("ERROR_MISSING_DATA"));
		}
	}

	const doCancel = (e) => {
		e.preventDefault();

		dispatch(authActions.clearError());
		dispatch(modalActions.clearModal());
	}

	return <div id="login" className="panel">
		<h2>{localize(signup ? "LABEL_SIGNUP" : "LABEL_LOGIN")}</h2>
		<form>
			<table><tbody>
			{signup && <tr>
				<td><label htmlFor="displayName"><FontAwesomeIcon icon={faUser} /></label></td>
				<td><input type="text" name="displayName" placeholder={localize("LABEL_DISPLAY_NAME")} maxLength={100} value={userInfo.displayName} onChange={updateUserInfo} /></td>
			</tr>}
			<tr>
				<td><label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} /></label></td>
				<td><input type="email" name="email" placeholder={localize("LABEL_EMAIL")} value={userInfo.email} onChange={updateUserInfo} /></td>
			</tr>
			<tr>
				<td><label htmlFor="password"><FontAwesomeIcon icon={faKey} /></label></td>
				<td><input type="password" name="password" placeholder={localize("LABEL_PASSWORD")} value={userInfo.password} onChange={updateUserInfo} /></td>
			</tr>
			{signup && <tr>
					<td><label htmlFor="password-confirm"><FontAwesomeIcon icon={faLock} /></label></td>
					<td><input type="password" className={userInfo.password !== passwordConfirm ? "error" : ""} name="password-confirm" placeholder={localize("LABEL_PASSWORD_CONFIRM")} onChange={(e) => {setPasswordConfirm(e.target.value)}} value={passwordConfirm}></input></td>
				</tr>}
			</tbody></table>
			<div className="button-row">
				{!signup && <button type="submit" disabled={!userInfo.email || !userInfo.password} onClick={doLogin}>{localize("LABEL_LOGIN")}</button>}
				{signup && <button type="submit" disabled={!userInfo.displayName || !userInfo.email || !userInfo.password || !passwordConfirm || (userInfo.password !== passwordConfirm)} onClick={doSignup}>{localize("LABEL_SIGNUP")}</button>}
				<button onClick={doCancel}>{localize("LABEL_CANCEL")}</button>
			</div>
		</form>
		{authError && <div className="error">{localize(authError)}</div>}
		<a href="/#" onClick={swapFormState}>{localize("LABEL__INSTEAD", localize(signup ? "LABEL_LOGIN" : "LABEL_SIGNUP"))}</a>
	</div>
}

export default ModalLogin;