let port = chrome.runtime.connect({ name: "myTimer" });
let workTimerElements = [...document.getElementsByClassName("work-timer")];
let restTimerElements = [...document.getElementsByClassName("rest-timer")];
let buttonsArray = [...document.getElementsByClassName("button-class")];

let startTime,
  myWorkTime,
  isWorking = true;

startApp();

buttonsArray[0].addEventListener("click",()=>{
  console.log("It's working!");
  chrome.tabs.create({ "url": "chrome://extensions/?options=" + chrome.runtime.id });
});

port.onMessage.addListener((msg) => {
  if (isWorking) {
    workTimerElements[0].value =
      msg.thisMinutes > 10
        ? msg.thisMinutes
        : msg.thisMinutes.toString().padStart(2, "0");
    workTimerElements[1].value =
      msg.thisSeconds > 10
        ? msg.thisSeconds
        : msg.thisSeconds.toString().padStart(2, "0");
  } else {
    restTimerElements[0].value =
      msg.thisMinutes > 10
        ? msg.thisMinutes
        : msg.thisMinutes.toString().padStart(2, "0");
    restTimerElements[1].value =
      msg.thisSeconds > 10
        ? msg.thisSeconds
        : msg.thisSeconds.toString().padStart(2, "0");
  }
  if (msg.isRunning) configStart();
  else{
    configEnd();
    isWorking = !isWorking;
    timerToShow(isWorking);
  }
});

buttonsArray[1].addEventListener("click", () => {
  isWorking = !isWorking;
  workTimerElements.forEach((e) => e.toggleAttribute("hidden"));
  restTimerElements.forEach((e) => e.toggleAttribute("hidden"));
});

buttonsArray[2].addEventListener("click", () => {
  port.postMessage(startState(isWorking));
  configStart();
});

buttonsArray[3].addEventListener("click", () => {
  port.postMessage(stopState(isWorking));
  if (isWorking) {
    workTimerElements[0].value = startTime;
    workTimerElements[1].value = "00";
  } else {
    restTimerElements[0].value = startTime;
    restTimerElements[1].value = "00";
  }
  isWorking = !isWorking;
  timerToShow(isWorking);
  configEnd();
});

function startState(workingTime) {
  let validation = workingTime
  ? Number(workTimerElements[0].value)
  : Number(restTimerElements[0].value);
  if(isNaN(validation))validation = 0;
  let myTimerState = {
    startTime: Date.now(),
    nowIsWorking: workingTime,
    myWorkTime: validation,
  };
  return myTimerState;
}

function stopState(workingTime) {
  let myTimerState = {
    nowIsWorking: workingTime,
    stopRunning: true,
  };
  return myTimerState;
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
  if (workingTime) {
    workTimerElements.forEach((e) => e.removeAttribute("hidden"));
    restTimerElements.forEach((e) => e.setAttribute("hidden", ""));
  } else {
    workTimerElements.forEach((e) => e.setAttribute("hidden", ""));
    restTimerElements.forEach((e) => e.removeAttribute("hidden"));
  }
}

function startApp() {
  chrome.storage.sync.get(
    ["pomodoroWorkTimer", "pomodoroRestTimer", "isWorking"],
    (status) => {
      startTime = status.isWorking
      ? status.pomodoroWorkTimer[0]
      : status.pomodoroRestTimer[0];
      workTimerElements[0].value =
        status.pomodoroWorkTimer[0] > 10
          ? status.pomodoroWorkTimer[0]
          : status.pomodoroWorkTimer[0].toString().padStart(2, "0");
      workTimerElements[1].value =
        status.pomodoroWorkTimer[1] > 10
          ? status.pomodoroWorkTimer[1]
          : status.pomodoroWorkTimer[1].toString().padStart(2, "0");
      restTimerElements[0].value =
        status.pomodoroRestTimer[0] > 10
          ? status.pomodoroRestTimer[0]
          : status.pomodoroRestTimer[0].toString().padStart(2, "0");
      restTimerElements[1].value =
        status.pomodoroRestTimer[1] > 10
          ? status.pomodoroRestTimer[1]
          : status.pomodoroRestTimer[1].toString().padStart(2, "0");
      isWorking = status.isWorking;
      timerToShow(status.isWorking);
    }
  );
}