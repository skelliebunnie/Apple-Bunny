const docBody = document.querySelector("body");
const modal = document.querySelector(".modal");

const todayDate = new Date();
const timerColorsPrimary = ["#390099", "#01BAEF", "#7BC559", "#9E0059", "#FF0054", "#FF8600"];

let customIntervalLength = 25;
let customBreakLength = 5;
let customBlockLength = 8;

let defaultData = {
	mode : "light",
	intervalLength : customIntervalLength * 60,
	breakLength : customBreakLength * 60,
	timer: {
		color : getRandom(timerColorsPrimary),
		guid : uuidv4(),
		title : "Interval 1",
		timerLength : 25 * 60,
		timeRunning : 0,
		startTime : 0,
		endTime : 0,
		type : "interval",
		isPaused : false,
	},
	currentType : "interval",
	calendarEntries : {},
	intervalCount : 1,
	breakCount : 1,
	blockLength : customBlockLength,
};

if(!getLocalData()) saveLocalData(defaultData);
let apbnData = getLocalData();