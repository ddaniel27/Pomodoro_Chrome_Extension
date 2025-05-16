let port = null
let timerID = null
let startTime = null
let isRunning = false
let currentDuration = 0

//Default values when the developer updates the app
chrome.runtime.onInstalled.addListener(() => {
  let timeTracker = new Array(31).fill(0)

  chrome.storage.sync.set({
    pomodoroWorkTimer: [25, 0],
    pomodoroRestTimer: [5, 0],
    isWorking: true,
    timeTracker: timeTracker,
    soundToUse: "Default",
    lastDate: new Date().toString()
  });
});

chrome.runtime.onConnect.addListener((p) => {
  port = p
  port.onMessage.addListener(handleMessage)
});

function handleMessage(msg) {
  if (msg.stopRunning) {
    stopTimer(msg.nowIsWorking);
  } else {
    startTimer(msg);
  }
}

function startTimer({myWorkTime, nowIsWorking}) {
  chrome.storage.sync.set({ isWorking: nowIsWorking });

  startTime = Date.now();
  currentDuration = myWorkTime;
  isRunning = true;

  timerID = setInterval(() => {
    const elapsedMS = Date.now() - startTime;
    const totalSeconds = currentDuration * 60;
    const elapsedSeconds = Math.floor(elapsedMS / 1000);

    const remainigSeconds = Math.max(totalSeconds - elapsedSeconds, 0)
    const minutes = Math.floor(remainigSeconds / 60);
    const seconds = remainigSeconds % 60;

    const timeUpdate = {
      thisMinutes: minutes,
      thisSeconds: seconds,
      isRunning: isRunning,
    }

    if (remainigSeconds <= 1) {
      stopTimer(nowIsWorking);
      timeUpdate.isRunning = false;
      timeUpdate.thisMinutes = currentDuration;
      timeUpdate.thisSeconds = 0;
    }

    try{
      port.postMessage(timeUpdate);
    } catch(e) {
      console.warn("Port disconnected")
    }
  }, 1000);
}

function stopTimer(wasWorking) {
  clearInterval(timerID);
  isRunning = false;
  updateTimeTracker(wasWorking);
  chrome.storage.sync.set({ isWorking: !wasWorking, });

  if (wasWorking) {
    showNotification("Time for cake!", "You deserve a cake for your hard work!")
  } else {
    showNotification("Time to work!", "Enough cake for now, it's time to work.", true);
  }

  playSound();
}

function showNotification(title, message, requireInteraction = false) {
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL("myicon.png"),
    message: message,
    requireInteraction: requireInteraction,
    title: title,
    type: "basic",
  });
}

function updateTimeTracker(wasWorking) {
  if (!wasWorking) return;

  chrome.storage.sync.get(["lastDate", "timeTracker"], ({ lastDate, timeTracker }) => {
    const now = new Date();
    const lastRegisteredDay = new Date(lastDate);
    const minutesWorked = ((Date.now() - startTime) / 60000).toFixed(2);

    const updatedTracker = [...timeTracker];

    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDateOnly = new Date(lastRegisteredDay.getFullYear(), lastRegisteredDay.getMonth(), lastRegisteredDay.getDate());
    let daysDifference = Math.floor((nowDateOnly - lastDateOnly) / (1000 * 60 * 60 * 24));

    if (daysDifference < 1) daysDifference = 0;
    if (daysDifference > 30) daysDifference = 30;

    if (daysDifference === 0) {
      updatedTracker[updatedTracker.length - 1] += parseFloat(minutesWorked);
    } else {
      updatedTracker.splice(0, daysDifference);
      for (let i = 1; i < daysDifference; i++) {
        updatedTracker.push(0);
      }
      updatedTracker.push(parseFloat(minutesWorked));
    }

    while (updatedTracker.length < 31) updatedTracker.unshift(0);
    while (updatedTracker.length > 31) updatedTracker.shift();

    chrome.storage.sync.set({
      timeTracker: updatedTracker,
      lastDate: now.toString()
    });
  });
}


function playSound(){
  chrome.storage.sync.get(["soundToUse"], ({ soundToUse }) => {
    if (soundToUse === "Mute") return;

    const soundMap = {
      Default: "./Audio/Default.mp3",
      Sonata: "./Audio/Sonata.mp3",
      RIP: "./Audio/RIP.mp3",
      Random: "./Audio/Random.mp3",
    }

    const audioURL = soundMap[soundToUse] || soundMap.Default;
    new Audio(audioURL).play();
  });
}
