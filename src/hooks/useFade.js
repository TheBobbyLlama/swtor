import { useEffect, useState } from "react";

// FADE OUT STATE
// 0 - No fade
// 1 - Fading in
// 2 - Fading out
// -1 - Fade in immediately.

const useFade = (ref) => {
	const [fadeOut, setFadeOut] = useState(-1);
	const [transition, setTransition] = useState(false); // Indicates that this is a fade out -> fade in sequence

	useEffect(() => {
		if (ref?.current) {
			if (!ref.current.className.startsWith("fade ")) {
				ref.current.className = "fade " + ref.current.className;
			}

			switch(fadeOut) {
				case 1: // Fading in
					ref.current.className = ref.current.className.replace(/ fade-(in|out)\b/g, "") + " fade-in";
					setTimeout(setFadeOut, 500, 0);
					break;
				case 2: // Fading out
					ref.current.className = ref.current.className.replace(/ fade-(in|out)\b/g, "") + " fade-out";
					setTimeout(setFadeOut, 250, transition ? -1 : 0);
					break;
				case -1: // Immediately fade back in
					ref.current.className = ref.current.className.replace(/ fade-(in|out)\b/g, "");
					setFadeOut(1);
					setTransition(false);
					break;
				default:
					break;
			}
			
		}
	}, [ref?.current, fadeOut]);

	return (func, ...args) => {
		setFadeOut(2);

		if (func) {
			setTransition(true);
			setTimeout((...args) => {
				func(...args);
			}, 250, ...args);
		}
	}
}

export default useFade;