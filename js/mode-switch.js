apbnData = getLocalData();
	
const modeSwitcherEl = document.querySelector("#mode-switcher");
const modeSwitcherButtons = modeSwitcherEl.querySelectorAll("i");

modeSwitcherButtons.forEach(button => {
	button.addEventListener("click", function() {
		let targetMode = this.classList.contains("mode-dark") ? "dark" : "light";
		setMode(targetMode);
	});
});
setMode(apbnData.mode);

function setMode(mode) {	
	if(mode === "dark") {
		document.querySelector("body").classList.add("mode-dark");
		document.querySelector("body").classList.remove("mode-light");
	} else {
		document.querySelector("body").classList.add("mode-light");
		document.querySelector("body").classList.remove("mode-dark");
	}
	
	apbnData.mode = mode;
	saveLocalData(apbnData);
}