import { useEffect, useRef, useState } from "react";

import MarkdownTextArea from "../../components/Markdown/MarkdownTextArea";

import useFade from "../../hooks/useFade";
import { localize } from "../../localization";

import "./Helper.css";

const emoteList = require("../../data/emotes.json");

const connectorOptions = [
	{
		label: "+",
		start: "+ ",
		end: " +",
	},
	{
		label: "-",
		start: "- ",
		end: " -",
	},
	{
		label: ">",
		start: "> ",
		end: " >",
	},
	{
		label: "+ |",
		start: "| ",
		end: " +",
	},
	{
		label: "||",
		start: "|| ",
		end: " ||",
	},
];

function convertTextToOutput(input, connector) {
	let textPrefix = "/s ";
	const textChunks = [];

	// Determine which slash prefix we should be using.
	if (input.startsWith("/")) {
		textPrefix = input.substring(0, input.indexOf(" ") + 1);

		if (textPrefix.match(/^\/(e|ops|p|ra|s|y) $/g)?.length) {
			input = input.substring(textPrefix.length).trim();
		} else {
			if (textPrefix.length > 4) {
				textPrefix = "/e ";
				input = input.substring(1).trim();
			} else {
				input = input.substring(textPrefix.length).trim();
				textPrefix = "/s ";
			}
		}
	}

	let start = 0;
	let end = start + 255 - connector.end.length - textPrefix.length;

	// Loop to break apart input text...
	while (end < input.length - 1) {
		// Find end of last word, or if we can't, bite off the whole chunk.
		while (input[end] !== " ") {
			end--;

			if (end === start) {
				end = start + 255 - 2 * connector.start.length - textPrefix.length;
				break;
			}
		}

		textChunks.push(input.substring(start, end).trim());

		// Set up the next go in the loop.
		start = end;

		while ((start < input.length - 1) && (input[start] === " ")) {
			start++;
		}

		end = start + 255 - connector.start.length - connector.end.length - textPrefix.length;
	}

	// Finally, grab the last piece.
	textChunks.push(input.substring(start));

	for (let i = 0; i < textChunks.length; i++) {
		if ((i === 0) && (textChunks.length > 1)) {
			textChunks[i] = `${textPrefix}${textChunks[i]}${connector.end}`;
		} else if (i > 0) {
			if (i === textChunks.length - 1)
				textChunks[i] = `${textPrefix}${connector.start}${textChunks[i]}`;
			else
				textChunks[i] = `${textPrefix}${connector.start}${textChunks[i]}${connector.end}`;
		} 
	}

	return textChunks;
}

function Helper() {
	const ref = useRef(null);
	const [ curMode, setCurMode ] = useState(localStorage.getItem("SWTOR_Faction") || "republic");
	const [ panelStatus, setPanelStatus ] = useState(localStorage.getItem("SWTOR_Panels") || 0);
	const [ textInput, setTextInput ] = useState("");
	const [ textOutput, setTextOutput ] = useState([]);
	const [ connector, setConnector ] = useState(connectorOptions.find(con => con.label === localStorage.getItem("SWTOR_Connector")) || connectorOptions[0]);
	const [ outputPage, setOutputPage ] = useState(0);
	const [ notes, setNotes ] = useState(localStorage.getItem("SWTOR_Notes") || "");
	const [ excludedEmotes, setExcludedEmotes ] = useState(JSON.parse(localStorage.getItem("SWTOR_Emotes")) || []);
	useFade(ref);

	useEffect(() => {
		document.title = localize("LABEL_RP_HELPER");
		document.body.className = curMode;
	}, [curMode]);

	useEffect(() => {
		setTextOutput(convertTextToOutput(textInput, connector));
	}, [connector])

	const changeMode = (mode) => {
		setCurMode(mode);
		localStorage.setItem("SWTOR_Faction", mode);
	}

	const updateText = (e) => {
		const newText = e.target.value;

		setTextInput(newText);
		setTextOutput(convertTextToOutput(newText, connector));
		setOutputPage(0);
	}

	const togglePanel = (panelID) => {
		const newStatus = panelStatus ^ panelID;
		setPanelStatus(newStatus);
		localStorage.setItem("SWTOR_Panels", newStatus);
	}

	const changeConnector = (e) => {
		const selection = e.target.value;
		setConnector(connectorOptions.find(con => con.label === selection));
		localStorage.setItem("SWTOR_Connector", selection);
	}

	const copyOutputPage = () => {
		navigator.clipboard.writeText(textOutput[outputPage]);
	}

	const updateNotes = (v) => {
		setNotes(v);
		localStorage.setItem("SWTOR_Notes", v);
	}

	const toggleEmoteType = (type) => {
		let newExclusion;

		if (excludedEmotes.indexOf(type) > -1) {
			newExclusion = excludedEmotes.filter(emote => emote !== type);			
		} else {
			newExclusion = [ ...excludedEmotes, type ];
		}

		setExcludedEmotes(newExclusion);
		localStorage.setItem("SWTOR_Emotes", JSON.stringify(newExclusion))
	}

	return <div id="helper" className="fade fade-out" ref={ref}>
		<header>
			<nav>
				<button className="button-republic" aria-label="Republic view" onClick={() => changeMode("republic")}></button>
				<button className="button-empire" aria-label="Empire view" onClick={() => changeMode("empire")}></button>
			</nav>
			<h1>{localize("LABEL_RP_HELPER")}</h1>
		</header>
		<div className={`panel text-section${panelStatus & 1 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(1)}>{panelStatus & 1 ? "+" : "-"}</button>
			</div>
			<h2 className="show-closed">{localize("LABEL_TEXT_INPUT")}</h2>
			<div className="input-holder">
				<h2>{localize("LABEL_TEXT_INPUT")}</h2>
				<textarea id="text-input" placeholder={localize("LABEL_HELPER_INPUT")} value={textInput} onChange={updateText}></textarea>
			</div>
			<div className="output-holder">
				<div>
					<h2>{localize("LABEL_TEXT_OUTPUT")}</h2>
				</div>
				<div>
					<textarea id="text-output" readOnly={true} maxLength={255} placeholder={localize("LABEL_HELPER_OUTPUT")} value={textOutput.length ? textOutput[outputPage] : ""}></textarea>
				</div>
				<div>
					<div>
						<label htmlFor="connector-options">{localize("LABEL_CONNECTORS")}: </label>
						<select id="connector-options" onChange={changeConnector}>
							{connectorOptions.map(option => <option key={option.label}>{option.label}</option>)}
						</select>
					</div>
					<div>
						<button className="button-small" disabled={!textOutput.length || outputPage === 0} onClick={() => setOutputPage(outputPage - 1)}>{"<"}</button>
						<label> {outputPage + 1}/{textOutput.length} </label>
						<button className="button-small" disabled={!textOutput.length || outputPage >= textOutput.length - 1} onClick={() => setOutputPage(outputPage + 1)}>{">"}</button>
					</div>
					<button className="button-small" disabled={!textOutput.length} onClick={copyOutputPage}>{localize("LABEL_COPY")}</button>
				</div>
			</div>
		</div>
		<div className={`panel notes-section${panelStatus & 2 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(2)}>{panelStatus & 2 ? "+" : "-"}</button>
			</div>
			<h2 title={localize("LABEL_NOTES_HELPER")}>{localize("LABEL_NOTES")}</h2>
			<MarkdownTextArea value={notes} onChange={updateNotes} />
		</div>
		<div className={`panel cheatsheets${panelStatus & 4 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(4)}>{panelStatus & 4 ? "+" : "-"}</button>
			</div>
			<h2>{localize("LABEL_CHEATSHEETS")}</h2>
			<div className="code-holder">
				<div>
					<h3>{localize("CODE_JEDI")}</h3>
					<div className="code jedi">
						<p>{localize("CODE_JEDI_1")}</p>
						<p>{localize("CODE_JEDI_2")}</p>
						<p>{localize("CODE_JEDI_3")}</p>
						<p>{localize("CODE_JEDI_4")}</p>
						<p>{localize("CODE_JEDI_5")}</p>
					</div>
				</div>
				<div>
					<h3>{localize("CODE_SITH")}</h3>
					<div className="code sith">
						<p>{localize("CODE_SITH_1")}</p>
						<p>{localize("CODE_SITH_2")}</p>
						<p>{localize("CODE_SITH_3")}</p>
						<p>{localize("CODE_SITH_4")}</p>
						<p>{localize("CODE_SITH_5")}</p>
						<p>{localize("CODE_SITH_6")}</p>
					</div>
				</div>
			</div>
		</div>
		<div className={`panel${panelStatus & 8 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(8)}>{panelStatus & 8 ? "+" : "-"}</button>
			</div>
			<h2><a href="https://swtorista.com/emotes/" target="_blank">{localize("LABEL_EMOTES")}</a></h2>
			<h2 className="show-closed">{localize("LABEL_EMOTES")}</h2>
			<div className="emote-display">
				<div className="emote-header">
					<div><strong>{localize("LABEL_EMOTE_TYPES")}</strong> <em>{localize("LABEL_EMOTE_TYPES_HELPER")}</em></div>
					<div className={`emote-free${excludedEmotes.indexOf("free") > -1 ? " excluded" : ""}`} onClick={() => toggleEmoteType("free")}>{localize("LABEL_EMOTE_FREE")}</div>
					<div className={`emote-sub${excludedEmotes.indexOf("sub") > -1 ? " excluded" : ""}`} onClick={() => toggleEmoteType("sub")}>{localize("LABEL_EMOTE_SUB")}</div>
					<div className={`emote-market${excludedEmotes.indexOf("market") > -1 ? " excluded" : ""}`} onClick={() => toggleEmoteType("market")}>{localize("LABEL_EMOTE_MARKET")}</div>
					<div className={`emote-unlocked${excludedEmotes.indexOf("unlocked") > -1 ? " excluded" : ""}`} onClick={() => toggleEmoteType("unlocked")}>{localize("LABEL_EMOTE_UNLOCKED")}</div>
				</div>
				<div className={`emote-table excluded${excludedEmotes.length}`}>
					{emoteList.filter(emote => excludedEmotes.indexOf(emote.type) === -1).map(emote => {
						return <div key={emote.emote} className={`emote-${emote.type}`}>
							<div>{localize(emote.emote)}</div>
							<div>{localize(`${emote.emote}_desc`)}</div>
						</div>
					})}
				</div>
			</div>
		</div>
	</div>;
}

export default Helper;