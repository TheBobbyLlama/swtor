import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import MarkdownTextArea from "../../components/Markdown/MarkdownTextArea";
import RPGenGen from "../../components/Edit/components/RPGenGen/RPGenGen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome} from "@fortawesome/free-solid-svg-icons";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

import useFade from "../../hooks/useFade";
import { modalActions, modalKey } from "../../store/slice/modal";
import { localize } from "../../localization";
import { getUrlBase } from "../../util";

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

	if (!input) return textChunks;

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

	if (textChunks.length === 1) {
		textChunks[0] = `${textPrefix}${textChunks[0]}`;
	} else {
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
	}

	return textChunks;
}

// TODO - IE mode is defaulted to true while it is only the Equinox guilds using the helper; this may change in the future.
function Helper({ ieMode = true }) {
	const ref = useRef(null);
	const [ curMode, setCurMode ] = useState(localStorage.getItem("SWTOR_Faction") || "republic");
	const [ panelStatus, setPanelStatus ] = useState(localStorage.getItem(("SWTOR_Panels") || 0) | 48); // Some panels always starts closed
	const [ textInput, setTextInput ] = useState("");
	const [ textOutput, setTextOutput ] = useState([]);
	const [ connector, setConnector ] = useState(connectorOptions.find(con => con.label === localStorage.getItem("SWTOR_Connector")) || connectorOptions[0]);
	const [ outputPage, setOutputPage ] = useState(0);
	const [ notes, setNotes ] = useState(localStorage.getItem("SWTOR_Notes") || "");
	const [ excludedEmotes, setExcludedEmotes ] = useState(JSON.parse(localStorage.getItem("SWTOR_Emotes")) || []);
	const [ equinox ] = useState(ieMode || localStorage.getItem("SWTOR_IE"));
	const dispatch = useDispatch();
	const navigate = useNavigate();
	useFade(ref);

	useEffect(() => {
		 if (ieMode) {
			localStorage.setItem("SWTOR_IE", true);
		 }
	}, []);

	useEffect(() => {
		document.title = localize("LABEL_RP_HELPER");
		document.body.className = curMode;
	}, [curMode]);

	useEffect(() => {
		setTextOutput(convertTextToOutput(textInput, connector));
	}, [connector])

	const goHome = () => {
		navigate("/");
	}

	const goHomeNew = (e) => {
		if (e.button === 1)
			window.open(`${getUrlBase()}`);
	}

	const startDiscordPost = () => {
		dispatch(modalActions.showModal({ key: modalKey.discordPost }));
	}

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
			<div>
				<button className="button-minimal" aria-label={localize("LABEL_GO_HOME")} title={localize("LABEL_GO_HOME")} onClick={goHome} onMouseDown={goHomeNew}><FontAwesomeIcon icon={faHome} /></button>
				<button className="button-minimal" aria-label={localize("LABEL_DISCORD_POST")} title={localize("LABEL_DISCORD_POST")} onClick={startDiscordPost}><FontAwesomeIcon icon={faDiscord} /></button>
			</div>
			<h1>{localize("LABEL_RP_HELPER")}</h1>
			<nav>
				<button className="button-republic" aria-label={localize("FACTION_REPUBLIC")} title={localize("FACTION_REPUBLIC")} onClick={() => changeMode("republic")}></button>
				<button className="button-empire" aria-label={localize("FACTION_EMPIRE")} title={localize("FACTION_EMPIRE")} onClick={() => changeMode("empire")}></button>
			</nav>
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
			<MarkdownTextArea maxLength={10000} value={notes} onChange={updateNotes} />
		</div>
		<div className={`panel cheatsheets${panelStatus & 4 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(4)}>{panelStatus & 4 ? "+" : "-"}</button>
			</div>
			<h2>{localize("LABEL_CHEATSHEETS")}</h2>
			<div className="cheatsheet-content">
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
				{equinox && <div className="table-holder">
					<h3>Rank Table</h3>
					<table><tbody>
						<tr>
							<th>Rank Name</th>
							<th>HP</th>
							<th>Die</th>
							<th>Bonus</th>
						</tr>
						<tr>
							<td className="pub-only">Citizen/Adept/Initiate/Cadet/Private (E1 & E2)</td>
							<td className="imp-only">Citizen/Initiate/Acolyte/Cadet/Private (E1 & E2)</td>
							<td>2</td>
							<td>d20</td>
							<td>+0</td>
						</tr>
						<tr>
							<td className="pub-only">Padawan/Specialist (E3)</td>
							<td className="imp-only">Apprentice/Sergeant (E3)</td>
							<td>3</td>
							<td>d20</td>
							<td>+2</td>
						</tr>
						<tr>
							<td className="pub-only">Knight/Corporal (O1)</td>
							<td className="imp-only">Lord/Lieutenant (O1)</td>
							<td>4</td>
							<td>d25</td>
							<td>+5</td>
						</tr>
						<tr>
							<td className="pub-only">Knight I/Sergeant (O2)</td>
							<td className="imp-only">Lord I/Captain (O2)</td>
							<td>4</td>
							<td>d25</td>
							<td>+7</td>
						</tr>
						<tr>
							<td className="pub-only">Knight II/Ensign (O3)</td>
							<td className="imp-only">Lord II/Colonel (O3)</td>
							<td>4</td>
							<td>d25</td>
							<td>+9</td>
						</tr>
						<tr>
							<td className="pub-only">Master/Major (O4)</td>
							<td className="imp-only">Darth/Moff (O4)</td>
							<td>5</td>
							<td>d30</td>
							<td>+15</td>
						</tr>
						<tr>
							<td className="pub-only">Jedi Councilor/General (O5)</td>
							<td className="imp-only">Dark Councilor/Grand Moff (O5)</td>
							<td>6</td>
							<td>d40</td>
							<td>+20</td>
						</tr>
						<tr>
							<td className="imp-only">High Councilor (O6)</td>
							<td className="imp-only">7</td>
							<td className="imp-only">d40</td>
							<td className="imp-only">+22</td>
						</tr>
						<tr>
							<td className="imp-only">Wrath (O7)</td>
							<td className="imp-only">7</td>
							<td className="imp-only">d45</td>
							<td className="imp-only">+25</td>
						</tr>
						<tr>
							<td className="imp-only">Voice (O8)</td>
							<td className="imp-only">10</td>
							<td className="imp-only">d50</td>
							<td className="imp-only">+30</td>
						</tr>
						<tr>
							<td className="imp-only">Emperor (GM)</td>
							<td className="imp-only">15</td>
							<td className="imp-only">d65</td>
							<td className="imp-only">+35</td>
						</tr>
					</tbody></table>
				</div>}
			</div>
		</div>
		<div className={`panel${panelStatus & 8 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(8)}>{panelStatus & 8 ? "+" : "-"}</button>
			</div>
			<h2><a href="https://swtorista.com/emotes/" target="_blank">{localize("LABEL_EMOTES")}</a></h2>
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
		{equinox && <div className={`panel${panelStatus & 16 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(16)}>{panelStatus & 16 ? "+" : "-"}</button>
			</div>
			<h2><a href="https://docs.google.com/document/d/1sh0sWuoRm01HJfOQPhoAQerm_eYuuqzMsgAgRJgtC2A/preview?tab=t.0#heading=h.n75654wmgaeq" target="blank">Guild Documentation</a></h2>
			{((panelStatus & 16) === 0) && <iframe src="https://docs.google.com/document/d/1sh0sWuoRm01HJfOQPhoAQerm_eYuuqzMsgAgRJgtC2A/preview?tab=t.0#heading=h.n75654wmgaeq"></iframe>}
		</div>}
		{equinox && <div className={`panel${panelStatus & 32 ? " closed" : ""}`}>
			<div className="close-button">
				<button type="button" className="button-small" onClick={() => togglePanel(32)}>{panelStatus & 32 ? "+" : "-"}</button>
			</div>
			<h2>RP-Gen Creator</h2>
			<RPGenGen />
		</div>}
	</div>;
}

export default Helper;