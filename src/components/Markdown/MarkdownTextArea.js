import { useRef, useState } from "react";
import {
	MDXEditor,
	headingsPlugin,
	linkPlugin,
	linkDialogPlugin,
	listsPlugin,
	maxLengthPlugin,
	quotePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
	CreateLink,
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	InsertImage,
	InsertThematicBreak
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./Markdown.css";

function MarkdownTextArea({ placeholder, maxLength = 1000, value, onBlur, onChange, dataPath, allowHeadings, ...props }) {
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
		placeholder={placeholder}
		contentEditableClassName="markdown-textarea"
		markdown={value}
		onBlur={forwardOnBlur}
		onChange={processChange}
		plugins={[
			maxLengthPlugin(maxLength),
			headingsPlugin(),
			linkPlugin(),
			linkDialogPlugin(),
			listsPlugin(),
			quotePlugin(),
			thematicBreakPlugin(),
			toolbarPlugin({
				toolbarContents: () => {
					return <div className="markdown-toolbar">
						<div>
							{allowHeadings && <BlockTypeSelect />}
							<BoldItalicUnderlineToggles />
							<CreateLink />
							<InsertThematicBreak />
							<UndoRedo />
						</div>
					</div>
				}
			})
		]}
		{...props}
	/>
}

export default MarkdownTextArea;