import { useRef, useState } from "react";
import {
	MDXEditor,
	linkPlugin,
	linkDialogPlugin,
	maxLengthPlugin,
	toolbarPlugin,
	UndoRedo,
	CreateLink,
	BoldItalicUnderlineToggles
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./Markdown.css";

function MarkDownInput({ label, placeholder, maxLength = 100, value, onBlur, onChange, dataPath, ...props}) {
	const ref = useRef(null);
		const [ curValue, setCurValue ] = useState(value);
	
		const processChange = (v) => {
			if (v !== value) {
				if (onChange) {
					onChange(v, dataPath);
				}
	
				setCurValue(ref.current.getMarkdown());
			}
		}
	
		const forwardOnBlur = () => {
			if (onBlur) onBlur(curValue);
		}

	return <MDXEditor
		ref={ref}
		className="markdown-input-container"
		placeholder={placeholder}
		contentEditableClassName="markdown-input"
		markdown={value}
		onBlur={forwardOnBlur}
		onChange={processChange}
		plugins={[
			maxLengthPlugin(maxLength),
			linkPlugin(),
			linkDialogPlugin(),
			toolbarPlugin({
				toolbarContents: () => {
					return <div className="markdown-toolbar">
						<label>{label}</label>
						<div>
							<BoldItalicUnderlineToggles />
							<CreateLink />
							<UndoRedo />
						</div>
					</div>
				}
			})
		]}
		{...props}
	/>
}

export default MarkDownInput;