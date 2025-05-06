const calendarEntriesContainer = document.querySelector("#calendar .entries");
const calendarEntryTemplate = document.querySelector("#calendar-entry-template");

updateCalendar();

function updateCalendar() {
	apbnData = getLocalData();
	console.log(apbnData);
	let calendarEntries = apbnData.calendarEntries;
	
	let currentDate = new Date();
	let calendarDateCont = document.querySelector("#calendar .date");
	calendarDateCont.textContent = currentDate.toLocaleDateString();
	
	if(calendarEntries.length > 0) {
		calendarEntriesContainer.textContent = "";
		
		let index = 0;
		for(const entry of calendarEntries) {
			let startTime = new Date(entry.startTime);
			let endTime = new Date(entry.endTime);
				
			if(startTime.toDateString() === currentDate.toDateString()) {
				let entryEl = calendarEntryTemplate.content.cloneNode(true).querySelector(".calendar-entry");
				
				entryEl.style.backgroundColor = entry.color;
				entryEl.setAttribute("data-guid", entry.guid);
				entryEl.querySelector(".title").textContent = entry.title;
				entryEl.querySelector(".duration > span").textContent = formattedTime(entry.timeRunning);
				entryEl.querySelector(".start > span").textContent = startTime.toLocaleTimeString();
				entryEl.querySelector(".end > span").textContent = endTime.toLocaleTimeString();
				
				calendarEntriesContainer.appendChild(entryEl);
				
			} else {
				// remove calendar entries from previous dates
				// this will be changed later! if I ever expand this project
				calendarEntries.splice(index, 1);
			}
			++index;
		}
	} else {
		calendarEntriesContainer.textContent = "No Entries Found";
	}
}