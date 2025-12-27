import { useState } from "react";

import MarkdownTextArea from "../../../../components/Markdown/MarkdownTextArea";

import { localize } from "../../../../localization";

import "./ModalDiscordPost.css";

function ModalDiscordPost() {
	const [ postContent, setPostContent ] = useState("");
	const [ editorRef, setEditorRef ] = useState(null);
	const [ savedPosts, setSavedPosts ] = useState(JSON.parse(localStorage.getItem("SWTOR_DiscordPosts") || "{}"));
	const [ saveName, setSaveName ] = useState("");
	const [ postSelection, setPostSelection ] = useState("");
	const [ deleteEnabled, setDeleteEnabled ] = useState(false);

	const updateContent = (text) => {
		if (!text.length) {
			setSaveName("");
		}

		setPostContent(text);
		setDeleteEnabled(false);
	}

	const updateSaveName = (e) => {
		setSaveName(e.target.value);
		setDeleteEnabled(false);
	}

	const saveContent = () => {
		const newPosts = { ...savedPosts, [saveName]: postContent };

		setSavedPosts(newPosts);
		setPostSelection(saveName);
		localStorage.setItem("SWTOR_DiscordPosts", JSON.stringify(newPosts));
	}

	const changeSavedPost = (e) => {
		const newKey = e.target.value;

		setPostSelection(newKey);
		setDeleteEnabled(false);
	}

	const loadContent = (e) => {
		editorRef && editorRef.setMarkdown(savedPosts[postSelection] || "")
		setPostContent(savedPosts[postSelection] || "");
		setSaveName(postSelection);
		setDeleteEnabled(!!postSelection);
	}

	const deletePost = () => {
		const newPosts= { ...savedPosts };
		delete newPosts[postSelection];
		
		setSavedPosts(newPosts);
		setPostSelection("");
		localStorage.setItem("SWTOR_DiscordPosts", JSON.stringify(newPosts));
	}

	const copyContent = () => {
		navigator.clipboard.writeText(postContent.replace(/^\*\*\*$/gm, "―".repeat(40)));
	}

	return <div id="discord-post" className="panel">
		<h2>{localize("LABEL_DISCORD_POST")}</h2>
		<MarkdownTextArea getEditorRef={setEditorRef} allowHeadings={true} value={postContent} onChange={updateContent} />
		<div className="save-load">
			<div>
				<input type="text" value={saveName} onChange={updateSaveName}></input>
				<button disabled={!postContent || !saveName} onClick={saveContent}>{localize("LABEL_SAVE")}</button>
			</div>
			{!!Object.keys(savedPosts).length && <div>
				<select value={postSelection} onChange={changeSavedPost}>
					<option value={""}></option>
					{Object.keys(savedPosts).map(postKey => <option key={postKey} value={postKey}>{postKey}</option>)}
				</select>
				<button onClick={loadContent}>{localize("LABEL_LOAD")}</button>
				<button disabled={!deleteEnabled} onClick={deletePost}>{localize("LABEL_DELETE")}</button>
			</div>}
		</div>
		<button disabled={!postContent} onClick={copyContent}>{localize("LABEL_COPY")}</button>
	</div>
}

ModalDiscordPost.clickOff = true;

export default ModalDiscordPost;