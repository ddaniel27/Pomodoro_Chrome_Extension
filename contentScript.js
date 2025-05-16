const port = chrome.runtime.connect({ name: "myTimer" });

const workTimerElements = Array.from(document.getElementsByClassName("work-timer"));
const restTimerElements = Array.from(document.getElementsByClassName("rest-timer"));
const buttonsArray = Array.from(document.getElementsByClassName("button-class"));

let startTime;
let isWorking = true;

// Utils
const formatNumber = (n) => n.toString().padStart(2, "0");

const updateTimerElements = (elements, minutes, seconds) => {
  elements[0].value = formatNumber(minutes);
  elements[1].value = formatNumber(seconds);
}

const setTimerFromStorage = ({ pomodoroWorkTimer, pomodoroRestTimer, isWorking: working}) => {
  updateTimerElements(workTimerElements, ...pomodoroWorkTimer);
  updateTimerElements(restTimerElements, ...pomodoroRestTimer);

  startTime = working ? pomodoroWorkTimer[0] : pomodoroRestTimer[0];
  isWorking = working;
  timerToShow(working);
}

// Listeners

buttonsArray[0].addEventListener("click", () => {
  chrome.tabs.create({ url: `chrome://extensions/?options=${chrome.runtime.id}` });
});

buttonsArray[1].addEventListener("click", () => {
  isWorking = !isWorking;
  workTimerElements.forEach(e => e.toggleAttribute("hidden"));
  restTimerElements.forEach(e => e.toggleAttribute("hidden"));
});

buttonsArray[2].addEventListener("click", () => {
  port.postMessage(startState(isWorking));
  configStart();
});

buttonsArray[3].addEventListener("click", () => {
  port.postMessage(stopState(isWorking));
  const elements = isWorking ? workTimerElements : restTimerElements;
  updateTimerElements(elements, startTime, 0);

  isWorking = !isWorking;
  timerToShow(isWorking);
  configEnd();
});

buttonsArray[4].addEventListener("click", () => {
  chrome.tabs.create({ url: `chrome-extension://${chrome.runtime.id}/charts.html` });
});


// Background communication

port.onMessage.addListener((msg) => {
  const elements = isWorking ? workTimerElements : restTimerElements;
  updateTimerElements(elements, msg.thisMinutes, msg.thisSeconds);

  if (msg.isRunning) {
    configStart();
  } else {
    configEnd();
    isWorking = !isWorking;
    timerToShow(isWorking);
  }
});

// State config
function startState(workingTime) {
  let minutes = Number((workingTime ? workTimerElements : restTimerElements)[0].value);
  if (isNaN(minutes)) minutes = 0;
  return {
    startTime: Date.now(),
    nowIsWorking: workingTime,
    myWorkTime: minutes,
  };
}

function stopState(workingTime) {
  return {
    nowIsWorking: workingTime,
    stopRunning: true,
  }
}

function configStart() {
  buttonsArray[2].setAttribute("disabled", "");
  buttonsArray[2].removeAttribute("autofocus");
  workTimerElements[0].setAttribute("readonly", "");
  buttonsArray[1].setAttribute("disabled", "");
  buttonsArray[3].focus();
  buttonsArray[3].removeAttribute("disabled");
}

function configEnd() {
  buttonsArray[2].removeAttribute("disabled");
  buttonsArray[2].focus();
  buttonsArray[1].removeAttribute("disabled");
  workTimerElements[0].removeAttribute("readonly");
  buttonsArray[3].setAttribute("disabled", "");
}

function timerToShow(workingTime) {
  const [show, hide] = workingTime ?
    [workTimerElements, restTimerElements] :
    [restTimerElements, workTimerElements];

  show.forEach(e => e.removeAttribute("hidden"))
  hide.forEach(e => e.setAttribute("hidden", ""))
}

function startApp() {
  chrome.storage.sync.get(
    ["pomodoroWorkTimer", "pomodoroRestTimer", "isWorking"],
    setTimerFromStorage
  );
}

startApp();
