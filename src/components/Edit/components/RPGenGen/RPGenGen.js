import { useState } from "react";

import "./RPGenGen.css";

// https://rebane2001.com/discord-colored-text-generator/
function createRPGenText(formData) {
	return `\`\`\`ansi
[2;40m-|| [2;36m[2;32m[1;32mMessage Sent[0m[2;32m[2;40m[0m[2;36m[2;40m[0m[2;40m || [2;33m[2;34m[1;34mSubject:[0m[2;34m[2;40m[0m[2;33m[2;40m[0m[2;40m [2;37m${formData.subject}[0m[2;40m || [2;34m[1;34mEncryption Level:[0m[2;34m[2;40m[0m[2;40m [2;37m[2;31m${formData.encryption}[0m[2;37m[2;40m[0m[2;40m || [2;33m[2;32m[1;32mMessage Loading...[0m[2;32m[2;40m[0m[2;33m[2;40m[0m[2;40m || -[0m

[2;37m${formData.message}[0m

[2;40m-|| [2;32m[1;32mMessage Loaded[0m[2;32m[2;40m[0m[2;40m || [2;34m[1;34mSubject:[0m[2;34m[2;40m[0m[2;40m [2;37m${formData.subject}[0m[2;40m || [2;33m[1;33mWould you like to reply?[0m[2;33m[2;40m [[0m[2;40m[2;32m[1;32mY[0m[2;32m[2;40m[0m[2;40m/[2;31m[1;31mN[0m[2;31m[2;40m[0m[2;40m[2;33m][0m[2;40m || -[0m
\`\`\``
}

function RPGenGen() {
	const [ formData, setFormData ] = useState({
		subject: "",
		encryption: localStorage.getItem("SWTOR_Encryption") || 1,
		message: "",
	});

	const updateFormData = (e) => {
		const newFormData = { ...formData };

		newFormData[e.target.name] = e.target.value;

		if (e.target.name === "encryption") {
			localStorage.setItem("SWTOR_Encryption", e.target.value);
		}

		setFormData(newFormData);
	}

	const copyRPGen = () => {
		navigator.clipboard.writeText(createRPGenText(formData));
	}

	return <div id="rp-gen-gen">
		<div className="rp-gen-panel">
			<div>
				<label>- || </label>
				<label className="text-green bold">Message Sent</label>
				<label> || </label>
				<label className="text-blue bold">Subject: </label>
				<input name="subject" className="text-white" type="text" value={formData.subject} onChange={updateFormData}></input>
				<label> || </label>
				<label className="text-blue bold">Encryption Level: </label>
				<select name="encryption" className="text-red" value={formData.encryption} onChange={updateFormData}>
					<option value={1}>1</option>
					<option value={2}>2 (E3)</option>
					<option value={3}>3 (O1-O3)</option>
					<option value={4}>4</option>
					<option value={5}>5 (O4)</option>
					<option value={"X"}>X (Black Cipher)</option>
				</select>
				<label> || </label>
				<label className="text-green bold">Message Loading...</label>
				<label> || -</label>
			</div>
			<div>
				<textarea name="message" className="text-white" value={formData.message} onChange={updateFormData}></textarea>
			</div>
			<div>
				<label>- || </label>
				<label className="text-green bold">Message Loaded</label>
				<label> || </label>
				<label className="text-blue bold">Subject: </label>
				<label className="text-white">{formData.subject}</label>
				<label> || </label>
				<label className="text-gold bold">Would you like to reply?</label>
				<label className="text-gold">{" ["}</label>
				<label className="text-green bold">Y</label>
				<label>/</label>
				<label className="text-red bold">N</label>
				<label className="text-gold">{"]"}</label>
				<label> || -</label>
			</div>
		</div>
		<button disabled={!formData.subject || !formData.message} onClick={copyRPGen}>Copy</button>
	</div>;
}

export default RPGenGen;