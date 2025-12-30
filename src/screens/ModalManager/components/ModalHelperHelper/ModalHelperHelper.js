
import { localize } from "../../../../localization";

import "./ModalHelperHelper.css";

const channelList = [
	"CHANNEL_SAY",
	"CHANNEL_EMOTE",
	"CHANNEL_YELL",
	"CHANNEL_GROUP",
	"CHANNEL_GUILD",
	"CHANNEL_OPS",
	"CHANNEL_OPS_ANNOUNCEMENT",
	"CHANNEL_OPS_OFFICER",
]

function ModalHelperHelper() {
	return <div id="helperhelp" className="panel">
		<h2>{localize("LABEL_HELPER_HELP")}</h2>
		<p>{localize("HELP_HELPER_1")}</p>
		<table>
			<tbody>
				{channelList.map((chan, index) => <tr key={chan}>
					<th>{localize(chan)}</th>
					<td>{localize(`${chan}_PREFIX`)}{!index ? <i> {localize("LABEL_DEFAULT")}</i> : null}</td>
				</tr>)}
			</tbody>
		</table>
		<p>{localize("HELP_HELPER_2")}</p>
	</div>;
}

ModalHelperHelper.clickOff = true;

export default ModalHelperHelper;