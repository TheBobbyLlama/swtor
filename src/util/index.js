export function getUrlBase() {
	if ((window.location.host.startsWith("localhost")) || (window.location.host.endsWith(".github.io")))
		return "/swtor";
	else
		return "";
}

/// Adds HTML encoding to a given string.
export function htmlEncode(name) {
	if (!name) return "";

	return name.replace(/[&<>'"]/g, function(match) {
		switch (match)
		{
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case "'":
				return "&apos;";
			case "\"":
				return "&quot;";
			default:
				return "[ENCODING ERROR!]"
		}
	})
}

/// Removes HTML encoding from a given string.
export function htmlDecode(name) {
	if (!name) return "";

	return name.replace(/&amp;|&lt;|&gt;|&apos;|&#39;|&quot;/g, function (match) {
		switch (match)
		{
			case "&amp;":
				return "&";
			case "&lt;":
				return "<";
			case "&gt;":
				return ">";
			case "&apos;":
			case "&#39;":
				return "'";
			case "&quot;":
				return "\"";
			default:
				return "[DECODING ERROR!]"
		}
	})
}

/// Strips all non-alphanumeric characters from a string.
export function dbTransform(input) {
	return htmlDecode(input).replace(/[\s\W]/g, "").toLowerCase();
}

/// Reduces markdown to plain text
export function stripMarkdown(input) {
	let working = input.replace(/\[(.+?)\]\(.+?( ".*")?\)/g, "$1"); // Links
	return working.replace(/~~|[*_]/g, "").trim(); // Formatting characters
}