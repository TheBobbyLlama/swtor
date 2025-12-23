import { useState } from "react";

import MarkdownTextArea from "../../../../components/Markdown/MarkdownTextArea";

import { localize } from "../../../../localization";

import "./ModalDiscordPost.css";

function ModalDiscordPost() {
	const [ postContent, setPostContent ] = useState(localStorage.getItem("SWTOR_DiscordPost") || "");

	const contentChanged = (content) => {
		localStorage.setItem("SWTOR_DiscordPost", content);
		setPostContent(content);
	}

	const copyContent = () => {
		navigator.clipboard.writeText(postContent.replace(/^\*\*\*$/gm, "―".repeat(40)));
	}

	return <div id="discord-post" className="panel">
		<h2>{localize("LABEL_DISCORD_POST")}</h2>
		<MarkdownTextArea allowHeadings={true} value={postContent} onChange={contentChanged} />
		<button disabled={!postContent} onClick={copyContent}>{localize("LABEL_COPY")}</button>
	</div>
}

ModalDiscordPost.clickOff = true;

export default ModalDiscordPost;