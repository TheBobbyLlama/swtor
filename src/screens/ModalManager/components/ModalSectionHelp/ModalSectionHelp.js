import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignJustify, faGrip, faTable, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";

import { localize } from "../../../../localization";

function ModalSectionHelp() {
	return <div className="holder">
		<div id="section-help" className="panel">
			<h2>{localize("HELP_SECTION_TITLE")}</h2>
			<table><tbody>
				<tr>
					<th>
						<FontAwesomeIcon icon={faAlignJustify} />
						{localize("LABEL_TEXT")}
					</th>
					<td>{localize("HELP_SECTION_TEXT")}</td>
				</tr>
				<tr>
					<th>
						<FontAwesomeIcon icon={faWindowMaximize} />
						{localize("LABEL_FRAME")}
					</th>
					<td>{localize("HELP_SECTION_FRAME")}</td>
				</tr>
				<tr>
					<th>
						<FontAwesomeIcon icon={faGrip} />
						{localize("LABEL_ITEMIZED")}
					</th>
					<td>{localize("HELP_SECTION_ITEMIZED")}</td>
				</tr>
				<tr>
					<th>
						<FontAwesomeIcon icon={faTable} />
						{localize("LABEL_TABLE")}
					</th>
					<td>{localize("HELP_SECTION_TABLE")}</td>
				</tr>
			</tbody></table>
		</div>
	</div>
}

ModalSectionHelp.clickOff = true;

export default ModalSectionHelp;