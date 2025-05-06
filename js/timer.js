// TIMER SETUP AND HANDLING
let timeRemaining = 0;
let timerInterval = null;

const timerCont = document.querySelector("#timer-cont");
const timerTemplate = document.querySelector("#timer-template");
let timerEl = null;

const resetBlockBtn = document.querySelector(".reset-block");
resetBlockBtn.addEventListener("click", function() {
	resetBlock();
});

const calendarEntriesContainer = document.querySelector("#calendar .entries");
const calendarEntryTemplate = document.querySelector("#calendar-entry-template");

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

loadTimer();
updateCalendar();

// uses the timer settings to update the current timer data
// currently assumes the new length is longer than any time already elapsed
// TODO: update to check time elapsed VS timer length; create new timer if time is shorter
function updateTimerLength() {
	apbnData = getLocalData();
	
	let currentTimer = apbnData.timer;
	currentTimer.timerLength = currentTimer.type == "interval" ? apbnData.intervalLength : apbnData.breakLength;
	
	apbnData.timer = currentTimer;
	saveLocalData(apbnData);
}

// build the HTML and event listeners for the timer
function buildTimer(data) {
	timerCont.textContent = "";
	
	timerEl = timerTemplate.content.cloneNode(true).querySelector(".timer");
	
	let timerLength = formattedTime(data.timerLength - data.timeRunning);
	
	timerEl.style.backgroundColor = data.color;
	timerEl.dataset.guid = data.guid;
	timerEl.querySelector(".title").textContent = `${data.title}`;
	timerEl.querySelector(".time").textContent = `${timerLength}`;
	
	timerButtons();
	
	timerCont.replaceChildren(timerEl);
}

function timerButtons() {
	let playTimerBtn = timerEl.querySelector(".btn-play");
	let pauseTimerBtn = timerEl.querySelector(".btn-pause");
	let stopTimerBtn = timerEl.querySelector(".btn-stop");
	
	playTimerBtn.addEventListener("click", playTimer);
	pauseTimerBtn.addEventListener("click", pauseTimer);
	
	stopTimerBtn.addEventListener("click", function() {
		stopTimer();
		
		apbnData = getLocalData();
		
		if(apbnData.currentType === "interval") {
			saveEntry();
			apbnData.intervalCount += 1;
			saveLocalData(apbnData);
			newTimer("break");
		} else {
			apbnData.breakCount += 1;
			saveLocalData(apbnData);
			newTimer("interval");
		}
	});
}

// load saved timer
function loadTimer() {
	apbnData = getLocalData();
	
	buildTimer(apbnData.timer);
}

// create a new timer
function newTimer(type) {
	apbnData = getLocalData();
	
	let newData = {
		...defaultData.timer,
		color: getRandom(timerColorsPrimary),
		guid: uuidv4(),
		startTime: dayjs(),
		timerLength: type == "interval" ? defaultData.intervalLength : defaultData.breakLength,
		title: type == "interval" ? `Interval ${apbnData.intervalCount}` : `Break ${apbnData.breakCount}`,
		type: type
	}
	
	apbnData.currentType = type;
	apbnData.timer = newData;
	
	saveLocalData(apbnData);
	buildTimer(newData);
}

function resetBlock() {
	saveLocalData(defaultData);
	
	newTimer("interval");
}

function toggleButtons(event) {
	let playTimerBtn = timerEl.querySelector(".btn-play");
	let pauseTimerBtn = timerEl.querySelector(".btn-pause");
	
	console.log("event:", event);
	if(event == "play") {
		playTimerBtn.classList.add("hidden");
		pauseTimerBtn.classList.remove("hidden");
	}
	
	if(event == "pause" || event == "stop") {
		clearInterval(timerInterval);
		playTimerBtn.classList.remove("hidden");
		pauseTimerBtn.classList.add("hidden");
	}
}

// play the timer
function playTimer() {
	toggleButtons("play");
	
	startTimer();
}

// pause the timer
function pauseTimer() {
	toggleButtons("pause");
	
	apbnData = getLocalData();
	let currentTime = dayjs();
	
	apbnData.timer.isPaused = true;	
	apbnData.timer.timeRunning = Math.trunc(Math.abs(currentTime.getTime() - apbnData.timer.startTime) / 1000);
	
	saveLocalData(apbnData);
}

// stop the timer
function stopTimer() {
	toggleButtons("stop");
}

function startTimer() {
	apbnData = getLocalData();
	if(apbnData.timer.isPaused) {
		apbnData.timer.isPaused = false;
	} else {
		apbnData.timer.startTime = Date.now();
	}
	console.log("start timer", apbnData);
	saveLocalData(apbnData);
	
	timeRemaining = apbnData.timer.timerLength - apbnData.timer.timeRunning;
	
	timerInterval = setInterval(() => {
		if(timeRemaining >= 0) {
			timeRemaining--;
			
			updateTimerDisplay();
		} else {
			stopTimer();
		}
	}, 1000);
	
	playTimerSound.play();
}

function updateTimerDisplay() {
	const timeString = formattedTime(timeRemaining);
	timerEl.querySelector(".time").textContent = timeString;
}

// save timer data to calendar entry
function saveEntry() {
	console.log("save timer data to calendar entry, local storage");
	
	let startTime = dayjs(apbnData.timer.startTime, "x");
	let endTime = dayjs();
	
	let timerEntry = {
		...apbnData.timer,
		endTime : dayjs(),
		timeRunning : endTime.diff(startTime, 'second'),
	}
	
	apbnData.calendarEntries[apbnData.timer.guid] = timerEntry;
	saveLocalData(apbnData);
	updateCalendar();
}

// update the calendar to show entries
function updateCalendar() {
	console.log("build calendar");
	apbnData = getLocalData();
	let calendarEntries = apbnData.calendarEntries;
	
	let currentDate = dayjs();
	let calendarDateCont = document.querySelector("#calendar .date");
	calendarDateCont.textContent = currentDate.format("MMMM DD, YYYY");
	
	if(Object.keys(calendarEntries).length > 0) {
		calendarEntriesContainer.classList.remove("no-entries");
		calendarEntriesContainer.textContent = "";
		
		for(const key of Object.keys(calendarEntries)) {
			let entry = calendarEntries[key];
			console.log(entry);
			let startTime = dayjs(entry.startTime, "x");
				
			if(startTime.isSame(currentDate, "day")) {
				buildCalendarEntry(entry);
				
			} else {
				// remove calendar entries from previous dates
				// this will be changed later! if I ever expand this project
				delete calendarEntries[entry.guid];
			}
		}
	} else {
		calendarEntriesContainer.textContent = "No Entries Found";
		calendarEntriesContainer.classList.add("no-entries");
	}
}

function buildCalendarEntry(entry) {
	let entryEl = calendarEntryTemplate.content.cloneNode(true).querySelector(".calendar-entry");
	
	let startTime = new Date(entry.startTime);
	let endTime = new Date(entry.endTime);
	
	let st = dayjs(entry.startTime, "x");
	let et = dayjs(entry.endTime, "x");
	
	let timeRunning = et.diff(st, 'second');
				
	entryEl.style.backgroundColor = entry.color;
	entryEl.setAttribute("data-guid", entry.guid);
	entryEl.querySelector(".title").textContent = entry.title;
	entryEl.querySelector(".duration > span").textContent = formattedTime(timeRunning);
	entryEl.querySelector(".start > span").textContent = startTime.toLocaleTimeString();
	entryEl.querySelector(".end > span").textContent = endTime.toLocaleTimeString();
	
	calendarEntriesContainer.appendChild(entryEl);
}

document.querySelector("#calendar .clear-cal").addEventListener("click", function() {
	apbnData = getLocalData();
	
	if(apbnData) {
		apbnData.calendarEntries = [];
	
		resetBlock();
		
		updateCalendar();
	}
});