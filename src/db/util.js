/// Adds HTML encoding to a given string.
function encode(name) {
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
function decode(name) {
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

/// Reduces markdown to plain text
function stripMarkdown(input) {
	let working = input.replace(/\[(.+?)\]\(.+?\)/g, "$1"); // Links
	return working.replace(/~~|[*_]/g, "").trim(); // Formatting characters
}

/// Strips all non-alphanumeric characters from a string.
function transform(input) {
	return decode(input).replace(/[\s\W]/g, "").toLowerCase();
}

const dbUtil = {
	encode,
	decode,
	transform,
}

export default dbUtil;