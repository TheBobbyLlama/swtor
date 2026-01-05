import { useEffect, useRef, useState } from "react";

import MarkdownView from "react-showdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";


import useFade from "../../hooks/useFade";
import { localize } from "../../localization";

import "./Profile.css";

function renderSection(section, index) {
	switch(section.type) {
		case "frame":
			if (section.url) {
				return <section key={index}>
					<h3>{section.heading && <span>{section.heading}</span>}<button className="button-minimal" aria-label={localize("LABEL_NEW_WINDOW")} title={localize("LABEL_NEW_WINDOW")} onClick={() => { window.open(section.url) }}><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></button></h3>
					<iframe src={section.url} title={section.heading} allowFullScreen={true} />
				</section>
			} else {
				return null;
			}
		case "itemized":
			return <section className="itemized-container" key={index}>
				{section.heading && <h3><MarkdownView markdown={section.heading} /></h3>}
				<div className="itemized">
					{section.items.map(item => <MarkdownView key={item} markdown={item} />)}
				</div>
			</section>;
		case "table":
			const width = Math.max(section.headers.length, section.data.reduce((result, current) => { return Math.max(result, current.length)}, section.data[0]?.length || 0));
			const generateHeaders = () => {
				const result = [];

				for (let i = 0; i < width; i++) {
					result.push(<th><MarkdownView markdown={section.headers[i] || ""} /></th>);
				}

				return result;
			}
			const generateRow = (row) => {
				const result = [];

				for (let i = 0; i < width; i++) {
					result.push(<td><MarkdownView markdown={section.data[row][i] || ""} /></td>);
				}

				return result;
			}

			return <section key={index}>
				{section.heading && <h3><MarkdownView markdown={section.heading} /></h3>}
				<div className="table-holder">
					<table><tbody>
						<tr>{generateHeaders()}</tr>
						{section.data.map((data, row) => <tr>{generateRow(row)}</tr>)}
					</tbody></table>
				</div>
			</section>
		case "text":
			return <section key={index}>
				{section.heading && <h3><MarkdownView markdown={section.heading} /></h3>}
				<MarkdownView markdown={section.content.replace(/\\n/g, "\n")} />
			</section>;
	}

	return <div>Invalid section type!</div>
}

function quickDateFormat(date) {
	return `${date.toDateString()}, ${date.getHours() % 12 || 12}:${date.getMinutes().toString().padStart(2, '0')} ${localize(date.getHours() < 12 ? "LABEL_TIME_AM" : "LABEL_TIME_PM")}`;
}

function Profile({ metadata, profileData }) {
	const panelRef = useRef(null);
	const pageRef = useRef(null);
	const fadeTransition = useFade(panelRef);
	const [ curMetadata, setMetadata ] = useState(metadata);
	const [ curProfileData, setProfileData ] = useState(profileData);
	const [ curPage, setCurPage ] = useState(-1);

	useEffect(() => {
		fadeTransition(() => {
			if (metadata.name) {
				document.title = `${localize("APP_NAME")} - ${metadata.name}`;
			}

			document.body.className = (metadata.faction === "FACTION_EMPIRE") ? "empire" : "republic";

			setMetadata(metadata);
			setProfileData(profileData);
			setCurPage(undefined);
		});
	}, [metadata]);

	const pageData = curProfileData.pages[curPage];

	const changePage = (page) => {
		if (page === curPage) {
			setCurPage(-1);
		} else {
			setCurPage(page);
			
			if (pageRef.current)
				pageRef.current.className = "current-page";

			setTimeout(() => {
				if (pageRef.current) {
					pageRef.current.className = "current-page fade-in";
					panelRef.current?.scrollIntoView({ behavior: "smooth"});
				}
			}, 1);
		}
	}

	return <div id="profile" className="panel fade-out" ref={panelRef}>
		<h1>{curMetadata.name}</h1>
		<div className="character-info">
			{curProfileData.image && <div key={curMetadata.name} className="character-image" style={{ background: `url('${curProfileData.image}')`}}></div>}
			<table><tbody>
				<tr>
					<td><label>{localize("LABEL_SPECIES")}:</label></td>
					<td>{localize(curMetadata.species)}</td>
				</tr>
				{curMetadata.gender !== "GENDER_NONE" && <tr>
					<td><label>{localize("LABEL_GENDER")}:</label></td>
					<td>{localize(curMetadata.gender)}</td>
				</tr>}
				{curProfileData.age && <tr>
					<td><label>{localize("LABEL_AGE")}:</label></td>
					<td><MarkdownView markdown={curProfileData.age} /></td>
				</tr>}
				{curMetadata.homeworld && <tr>
					<td><label>{localize("LABEL_HOMEWORLD")}:</label></td>
					<td><MarkdownView markdown={curMetadata.homeworld} /></td>
				</tr>}
				{curProfileData.customFields?.map(field => <tr key={field[0]}>
					<td><label>{field[0].replace(/:$/, "")}:</label></td>
					<td><MarkdownView markdown={field[1]} /></td>
				</tr>)}
			</tbody></table>
		</div>
		<div className="button-row">
			{curProfileData.pages.map((page, index) => <button key={`${index}:${page.title}`} onClick={() => changePage(index)}>{page.title}</button>)}
		</div>
		{curPage > -1 && <div className="current-page" ref={pageRef}>
			<h2>{pageData.title}</h2>
			{pageData.sections?.map(renderSection)}
		</div>}
		<footer title={curProfileData.lastUpdated ? localize("LABEL_LAST_UPDATED_", quickDateFormat(new Date(curProfileData.lastUpdated))) : undefined}>{metadata.private ? 
			<p>{localize("LABEL_PRIVATE")}</p> :
			<><label>{localize("LABEL_BY")}</label><span>{metadata.creator}</span></>}
		</footer>
	</div>;
}

export default Profile;