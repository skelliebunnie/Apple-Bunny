// CONST VARIABLES
const todayDate = new Date();

const bodyEl = document.querySelector("body");
const modeSwitcherEl = document.querySelector("#mode-switcher");
const modeSwitcherButtons = modeSwitcherEl.querySelectorAll("i");

const mainEl = document.querySelector("main");

const intervalTemplate = document.getElementById("interval-template");
const breakTemplate = document.getElementById("break-template");

const calendarEl = document.querySelector("#calendar");
const calendarEntriesEl = calendarEl.querySelector(".entries");
const calendarEntryTemplate = document.querySelector("#calendar-entry-template");

// DATA
const timerColorsPrimary = ["#390099", "#01BAEF", "#7BC559", "#9E0059", "#FF0054", "#FF5400", "#FF8600"];

const intervalEntries = [];
let currentInterval = 1;
let currentBreak = 1;
let currentTimerType = getLocalData("apbn-timer-type") || "interval";
if(!getLocalData("apbn-timer-type")) saveLocalData("apbn-timer-type", "interval");

let customIntervalLength = getLocalData("apbn-interval-length") !== null ? parseInt(getLocalData("apbn-interval-length")) : 20;
let customBreakLength = getLocalData("apbn-break-length") !== null ? parseInt(getLocalData("apbn-break-length")) : 5;

// intervals
const defaultIntervalData = {
	type: "interval",
	number: 1,
	length: customIntervalLength * 60, // 20 minutes in seconds
	duration: 0,
	manuallyStopped: false,
	color: getRandom(timerColorsPrimary),
	guid: uuidv4(),
	startTime: Date.now(),
	endTime: null,
};
const defaultBreakLength = customBreakLength * 60;

let timeRemaining = 0;
let timeRunning = 0;
let timerInterval = null;

let intervalEl = intervalTemplate.content.cloneNode(true).querySelector(".interval-cont");
let savedInterval = getLocalData("apbn-interval");
let intervalData = savedInterval !== null ? savedInterval : defaultIntervalData;
if(!savedInterval) {
	intervalData.title = `${titleCase(intervalData.type)} ${intervalData.number}`;
}
saveLocalData("apbn-interval", intervalData);

let breakEl = breakTemplate.content.cloneNode(true).querySelector(".break-cont");
let savedBreak = getLocalData("apbn-break");
let breakData = savedBreak !== null ? savedBreak : defaultIntervalData;
if(!savedBreak) {
	breakData.type = "break";
	breakData.title = `${titleCase(breakData.type)} ${breakData.number}`;
	breakData.length = defaultBreakLength;
}
saveLocalData("apbn-break", breakData);

setupTimer("interval", true);
setupTimer("break", true);

// calendar
let calendarDateEl = calendarEl.querySelector(".date");
const calDateOptions = {
	weekday: "long",
	year: "numeric",
	month: "long",
	day: "numeric",
};
calendarDateEl.innerHTML = todayDate.toLocaleDateString(undefined, calDateOptions);

let calendarEntries = getLocalData('apbn-calendar');
if(calendarEntries === null) calendarEntries = [];
updateCalendar();

let clearCalBtn = calendarEl.querySelector(".clear-cal");
clearCalBtn.addEventListener("click", function() {
	calendarEntries = [];
	saveLocalData("apbn-calendar", calendarEntries);
	updateCalendar();
	
	currentInterval = 1;
	currentBreak = 1;
	currentTimerType = "interval";
});

// SOUNDS
var playTimerSound = new Howl({
  src: ['../audio/correct--freesound_community.mp3']
});

var pauseTimerSound = new Howl({
	src: ['../audio/cricket--freesound_community.mp3']
});

var stopTimerSound = new Howl({
	src: ['../audio/end--universfield.mp3']
});

// EVENT LISTENERS
modeSwitcherButtons.forEach(button => {
	button.addEventListener("click", function() {
		let targetMode = this.classList.contains("mode-dark") ? "dark" : "light";
		setMode(targetMode, true);
	});
});
setMode('', false);

// FUNCTIONS
function setMode(modeName, isClick) {
	let targetMode = modeName !== undefined && modeName !== '' ? modeName : "dark";
	
	if(!isClick) {
		let storedMode = getLocalData('apbn-mode');
		if(storedMode !== undefined) targetMode = storedMode;
	}
	
	if(targetMode === 'dark') {
		// switch to dark mode
		bodyEl.classList.remove("mode-light");
		bodyEl.classList.add("mode-dark");
		
		modeSwitcherEl.querySelector(".mode-dark").classList.add('hidden');
		modeSwitcherEl.querySelector(".mode-light").classList.remove('hidden');
		
		saveLocalData('apbn-mode', 'dark');
		
	} else {
		// switch to light mode
		bodyEl.classList.remove("mode-dark");
		bodyEl.classList.add("mode-light");
		
		modeSwitcherEl.querySelector(".mode-light").classList.add('hidden');
		modeSwitcherEl.querySelector(".mode-dark").classList.remove('hidden');
		
		saveLocalData('apbn-mode', 'light');
	}
}

function saveLocalData(targetName, data) {
	localStorage.setItem(targetName, JSON.stringify(data));
	return `saved ${targetName} data`;
}

function getLocalData(targetName) {
	let data = localStorage.getItem(targetName);
	if(data !== null) return JSON.parse(data);
	return null;
}

function deleteLocalData(targetName) {
	localStorage.removeItem(targetName);
	return `deleted ${targetName} data`;
}

function editInterval(target) {}

function setupButtons(target) {
	let playTimerBtn = target.querySelector(".btn-play");
	let pauseTimerBtn = target.querySelector(".btn-pause");
	let stopTimerBtn = target.querySelector(".btn-stop");
	playTimerBtn.addEventListener("click", function(e) {
		playTimer(e.target)
	});
	pauseTimerBtn.addEventListener("click", function(e) {
		pauseTimer(e.target);
	});
	stopTimerBtn.addEventListener("click", function(e) {
		stopTimer(true, e.target);
	});
}

function playTimer(target) {
	console.log("play timer");

	let parent = target.closest(".timer-wrapper");
	let type = parent.classList.contains("interval-cont") ? "interval" : "break";
	console.log("timer type", type);
	
	target.closest(".controls").querySelector(".btn-play").classList.add("hidden");
	target.closest(".controls").querySelector(".btn-pause").classList.remove("hidden");
	
	intervalData.startTime = Date.now();
	
	timeRemaining = type == "interval" ? intervalData.length - intervalData.duration : breakData.length - breakData.duration;
	
	timerInterval = setInterval(() => {
		if(timeRemaining >= 0) {
			timeRemaining--;
			timeRunning++;
			updateTimerDisplay(type);
		} else {
			clearInterval(timerInterval);
			stopTimer(false, target);
		}
	}, 1000);
	
	playTimerSound.play();
}

function pauseTimer(target) {
	console.log("paused timer");
	clearInterval(timerInterval);
	
	let parent = target.closest(".timer-wrapper");
	let type = parent.classList.contains("interval-cont") ? "interval" : "break";
	console.log("timer type", type);
	
	target.closest(".controls").querySelector(".btn-pause").classList.add("hidden");
	target.closest(".controls").querySelector(".btn-play").classList.remove("hidden");
	
	if(type == "interval") {
		intervalData.duration = timeRunning;
		saveLocalData("apbn-interval", intervalData);
	} else {
		breakData.duration = timeRunning;
		saveLocalData("apbn-break", breakData);
	}
	
	pauseTimerSound.play();
}

function stopTimer(manuallyStopped = false, target) {
	console.log("stopped timer");
	clearInterval(timerInterval);
	
	let parent = target.closest(".timer-wrapper");
	let type = parent.classList.contains("interval-cont") ? "interval" : "break";
	
	let pauseButtons = document.querySelectorAll(".btn-pause");
	let playButtons = document.querySelectorAll(".btn-play");
	
	pauseButtons.forEach(btn => btn.classList.add("hidden"));
	playButtons.forEach(btn => btn.classList.remove("hidden"));
	
	// we don't save break data, only intervals
	if(type == "interval") {
		if(manuallyStopped) intervalData.manuallyStopped = true;
		intervalData.duration = timeRunning;
		intervalData.endTime = Date.now();
		
		calendarEntries.push(intervalData);
		saveLocalData("apbn-calendar", calendarEntries);
		updateCalendar();
		
		currentTimerType = "break";
	} else {
		currentTimerType = "interval";
	}
	
	setupTimer(type, false);
	
	stopTimerSound.play();
}

function setupTimer(type = "interval", reload = false) {
	// reload in these timer functions means "load data from local storage instead of creating a new timer"
	if(type == "interval") {
		intervalData = reload ? getLocalData("apbn-interval") : updateTimerData("interval");
		
		if(reload) {
			timeRemaining = intervalData.length - intervalData.duration;
		}
		
		createTimer(intervalEl, intervalData, "interval");
	} else {
		breakData = reload ? getLocalData("apbn-break") : updateTimerData("break");
		
		if(reload) {
			timeRemaining = breakData.length - breakData.duration;
		}
		
		createTimer(breakEl, breakData, "break");
	}
	
	toggleTimers();
}

function updateTimerData(type = "interval") {
	++currentInterval;
	++currentBreak;
	
	let newData = {
		...defaultIntervalData,
		title : type === "interval" ? `Interval ${currentInterval}` : `Break ${currentBreak}`,
		number : type === "interval" ? currentInterval : currentBreak,
		type : type,
		color: getRandom(timerColorsPrimary),
		guid: uuidv4()
	};
	
	if(type == "interval") saveLocalData("apbn-interval", newData);
	if(type == "break") {
		newData.length = defaultBreakLength;
		saveLocalData("apbn-break", newData);
	}
	
	return newData;
}

function toggleTimers() {
	if(currentTimerType === "break") {
		intervalEl.classList.remove("active");
		breakEl.classList.add("active");
	} else {
		breakEl.classList.remove("active");
		intervalEl.classList.add("active");
	}
	
	saveLocalData("apbn-timer-type", currentTimerType);
}

function createTimer(target, data, type = "interval") {
	target.style.backgroundColor = data.color;
	target.dataset.guid = data.guid;
	target.querySelector(".title").textContent = `${data.title}`;
	target.querySelector(".timer").textContent = `${formattedTime(data.length)}`;
	setupButtons(target);
	
	mainEl.querySelector(`#${type}-cont`).replaceChildren(target);
}

function resetLoop() {}

function updateTimerDisplay(type = "interval") {
	const timeString = formattedTime(timeRemaining);
	
	if(timeRemaining > 0) {
		if(type == "interval") intervalEl.querySelector(".timer").textContent = timeString;
		if(type == "break") breakEl.querySelector(".timer").textContent = timeString;
	} else {
		if(type == "interval") stopTimer(false, document.querySelector("#interval-cont"));
		if(type == "interval") stopTimer(false, document.querySelector("#break-cont"));
	}
}

function updateCalendar() {
	if(calendarEntries !== null && calendarEntries.length > 0) {
		calendarEntriesEl.textContent = "";
		
		let index = 0;
		for(const entry of calendarEntries) {
			let startTime = new Date(entry.startTime);
			let endTime = new Date(entry.endTime);
			let currentDate = new Date();
				
			if(startTime.toDateString() === currentDate.toDateString()) {
				let entryEl = calendarEntryTemplate.content.cloneNode(true).querySelector(".calendar-entry");
				
				entryEl.style.backgroundColor = entry.color;
				
				entryEl.setAttribute("data-guid", entry.guid);
				entryEl.querySelector(".title").textContent = entry.title;
				entryEl.querySelector(".duration > span").textContent = formattedTime(entry.duration);
				entryEl.querySelector(".start > span").textContent = startTime.toLocaleTimeString();
				entryEl.querySelector(".end > span").textContent = endTime.toLocaleTimeString();
				
				calendarEntriesEl.appendChild(entryEl);
				
			} else {
				// remove calendar entries from previous dates
				// this will be changed later! if I ever expand this project
				calendarEntries.splice(index, 1);
			}
			++index;
		}
	} else {
		if(calendarEntries === null) calendarEntries = [];
		calendarEntriesEl.textContent = "No Entries Found";
	}
}

// support functions
function formattedTime(seconds) {
	const min = Math.floor(seconds / 60);
	const sec = seconds % 60;
	
	return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function titleCase(str) {
	return str.toLowerCase().split(' ').map(function(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	}).join(' ');
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, 
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getRandom(arr) {
	const randomIndex = Math.floor(Math.random() * arr.length);
  	return arr[randomIndex];
}

// COPYRIGHT
const copyElyear = document.querySelector("#currentYear");
const currentYear = new Date().getFullYear();
copyElyear.innerHTML = currentYear.toString();

// Howler sound handling demo
// var sound = new Howl({
//   src: ['sound.webm', 'sound.mp3']
// });
// sound.play();