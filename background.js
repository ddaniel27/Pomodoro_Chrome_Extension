//Default values when the developer updates the app
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    pomodoroWorkTimer: [25, 0],
    pomodoroRestTimer: [5, 0],
    isWorking: true,
    timeTracker: [0, 1],
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
  timeTracker,
  isRunning = false;

chrome.storage.sync.get(["timeTracker"], (status) => {
  timeTracker = status.timeTracker;
  console.log(status);
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
  startTime = Date.now();
  myWorkTime = req;
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
}

function myRestNotification() {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL("myicon.png"),
    message: "You deserve a cake for your hard work!",
    title: "Time for cake!",
    type: "basic",
  });
}

function myTimeTracker(workingTime) {
  let lastDay = timeTracker.shift();
  let thisDay = new Date().getDate();

  if(workingTime){
  timeTracker[thisDay - 1] =
    lastDay == thisDay
      ? (timeTracker[thisDay - 1] += Math.floor(difference / 1000))
      : Math.floor(difference / 1000);
  }
  lastDay = thisDay;
  timeTracker.unshift(lastDay);
}

function myTimerFunc(request) {
  startTimer(request.myWorkTime);
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
