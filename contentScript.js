let port = chrome.runtime.connect({name:"myTimer"});
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let myPomodoroInit = document.getElementById("workTime");
let mySeconds = document.getElementById("seconds");
let startTime, myWorkTime, timerWorking;

port.onMessage.addListener(msg=>{
    myPomodoroInit.value = msg.thisMinutes > 10 ? msg.thisMinutes : msg.thisMinutes.toString().padStart(2,"0");
    mySeconds.value = msg.thisSeconds > 10 ? msg.thisSeconds : msg.thisSeconds.toString().padStart(2,"0");
    if(msg.isRunning)configStart();
    else configEnd();
});

startButton.addEventListener("click",()=>{
   port.postMessage(startState());
   configStart();
});

stopButton.addEventListener("click",()=>{
    port.postMessage(stopState());
    configEnd();
});


function startState(){
    let myTimerState={
        startTime: Date.now(),
        myWorkTime: Number(myPomodoroInit.value)
    };
    return myTimerState;
}

function stopState(){
    let myTimerState={
        stopRunning: true
    };
    return myTimerState;
}

function configStart(){
    startButton.setAttribute("disabled","");
    startButton.removeAttribute("autofocus");
    myPomodoroInit.setAttribute("readonly","");
    stopButton.focus();
    stopButton.removeAttribute("disabled");
}

function configEnd(){
    startButton.removeAttribute("disabled");
    startButton.focus();
    myPomodoroInit.removeAttribute("readonly");
    stopButton.setAttribute("disabled","");
}