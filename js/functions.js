function saveLocalData(data) {
	localStorage.setItem("apbn-data", JSON.stringify(data));
}

function getLocalData() {
	let data = localStorage.getItem("apbn-data");
	if(data !== null) return JSON.parse(data);
	return null;
}

function deleteLocalData() {
	localStorage.removeItem("apbn-data");
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