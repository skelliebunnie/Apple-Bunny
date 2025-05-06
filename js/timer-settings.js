// TIMER SETTINGS
let timerSettings = document.querySelector("#timer-settings");
let timerSettingsToggle = timerSettings.querySelector(".dropdown");
let timerSettingsInputs = timerSettings.querySelectorAll("input");

// show/hide timer settings; always hidden by default to save space
timerSettingsToggle.addEventListener("click", function(e) {
	if(timerSettings.classList.contains("active")) {
		timerSettings.classList.remove("active");
	} else {
		timerSettings.classList.add("active");
	}
});

// handle changing inputs
timerSettingsInputs.forEach(input => {	
	apbnData[input.name] = input.name !== "blockLength" ? input.value / 60 : input.value;
	
	window.addEventListener("load", function(e) {
		input.value = input.name !== "blockLength" ? (apbnData[input.name] / 60).toString() : apbnData.blockLength.toString();
	});
	
	input.addEventListener("blur", function(e) {
		updateTimerSettings(e.target, true);
	});
	
	input.addEventListener("keyup", function(e) {
		if(e.key == "Enter") {
			input.blur();
			updateTimerSettings(e.target, true);
		}
	});
});

function updateTimerSettings(target) {
	stopTimer();
		
	let newVal = parseInt(target.value) * 60;
	let targetInput = target.name;
	
	if(targetInput === "intervalLength") {
		customIntervalLength = newVal;
		apbnData.intervalLength = newVal;
		
	} else if(targetInput === "breakLength") {
		customBreakLength = newVal;
		apbnData.breakLength = newVal;
		
	} else if(targetInput === "blockLength") {
		customBlockLength = newVal / 60;
		apbnData.blockLength = newVal / 60;
	}
	
	if(
		apbnData.currentType === "interval" && targetInput === "intervalLength" ||
		apbnData.currentType === "break" && targetInput === "breakLength"
	) {
		apbnData.timer.timerLength = newVal;
	}
	
	saveLocalData(apbnData);
	
	updateTimerLength();
}