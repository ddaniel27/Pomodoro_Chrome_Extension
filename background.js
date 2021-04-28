//Default values when the developer updates the app
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    pomodoroWorkTimer: [25, 0],
    pomodoroRestTimer: [5, 0],
    isWorking: true,
    timeTracker: new Array(31).fill(0),
    soundToUse: "Default"
  });
});

//Variables
let PORT,
  difference,
  timerRunning,
  startTime,
  myWorkTime,
  minutes,
  seconds,
  timeTracker=[],
  isRunning = false;

chrome.storage.sync.get(["timeTracker","soundToUse"], (status) => {
  timeTracker = status.timeTracker;
  switch(status.soundToUse){
    case "Default":
      url="./Audio/Default.mp3";
      break;
    case "Sonata":
      url="./Audio/Sonata.mp3";
      break;
    case "RIP":
      url="./Audio/RIP.mp3";
      break;
    case "Random":
      url="./Audio/Random.mp3";
      break;
    default:
      url="./Audio/Default.mp3";
      break;
  }
});

chrome.runtime.onConnect.addListener(connected);

function connected(p) {
  PORT = p;
  PORT.onMessage.addListener((msg) => {
    if (msg.stopRunning) stopTimer(timerRunning, msg.nowIsWorking);
    else myTimerFunc(msg);
  });
}

function startTimer(req) {
  chrome.storage.sync.set({
    isWorking: req.nowIsWorking
  });
  startTime = Date.now();
  myWorkTime = req.myWorkTime;
  isRunning = true;
}

function stopTimer(timerID, workingTime) {
  clearInterval(timerID);
  myTimeTracker(workingTime);
  chrome.storage.sync.set({
    isWorking: !workingTime,
    timeTracker: timeTracker,
  });
  if (workingTime) myRestNotification();
  else myWorkNotification();
  return { thisMinutes: myWorkTime, thisSeconds: 0, isRunning: false };
}

function myWorkNotification() {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL("myicon.png"),
    message: "Enough cake for now, it's time to work.",
    requireInteraction: true,
    title: "Time to work!",
    type: "basic",
  });
  urlSound();
}

function myRestNotification() {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL("myicon.png"),
    message: "You deserve a cake for your hard work!",
    title: "Time for cake!",
    type: "basic",
  });
  urlSound();
}

function myTimeTracker(workingTime) {
  let lastDay = timeTracker.shift();
  let thisDay = new Date().getDate();
  let timeWorked = difference / 60000;
  timeWorked = Number(timeWorked.toFixed(2));
  if(workingTime){
    if(lastDay == thisDay){
      timeTracker[timeTracker.length - 1] += timeWorked;
    }
    else{
      timeTracker.shift();
      timeTracker.push(timeWorked);
    } 
  }
  lastDay = thisDay;
  timeTracker.unshift(lastDay);
}

function myTimerFunc(request) {
  startTimer(request);
  timerRunning = window.setInterval(() => {
    difference = Date.now() - startTime;
    minutes = Math.floor(
      myWorkTime - (difference % (1000 * 60 * 60)) / (1000 * 60)
    );
    seconds = Math.floor(60 - (difference % (1000 * 60)) / 1000);
    let timeToSend = {
      thisMinutes: minutes,
      thisSeconds: seconds,
      isRunning: isRunning,
    };
    if (difference / 1000 >= myWorkTime * 60 - 1) {
      timeToSend = stopTimer(timerRunning, request.nowIsWorking);
    }
    try {
      PORT.postMessage(timeToSend);
    } catch (e) {
      console.log("Waiting");
    }
  }, 1000);
}

function urlSound(){
  chrome.storage.sync.get(["soundToUse"], (status) => {
    let url;
    switch(status.soundToUse){
      case "Default":
        url="./Audio/Default.mp3";
        break;
      case "Sonata":
        url="./Audio/Sonata.mp3";
        break;
      case "RIP":
        url="./Audio/RIP.mp3";
        break;
      case "Random":
        url="./Audio/Random.mp3";
        break;
      default:
        url="./Audio/Default.mp3";
        break;
    }
    new Audio(url).play();
  });
}