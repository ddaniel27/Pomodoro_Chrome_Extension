let port = chrome.runtime.connect({name:"myTimer"});
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let switchButton = document.getElementById("switchTimer");
let myPomodoroInit = document.getElementById("workTime");
let mySeconds = document.getElementById("seconds");

let workTimerElements = [...document.getElementsByClassName("work-timer")];
let restTimerElements = [...document.getElementsByClassName("rest-timer")];

let startTime, myWorkTime, timerWorking;

port.onMessage.addListener(msg=>{
    myPomodoroInit.value = msg.thisMinutes > 10 ? msg.thisMinutes : msg.thisMinutes.toString().padStart(2,"0");
    mySeconds.value = msg.thisSeconds > 10 ? msg.thisSeconds : msg.thisSeconds.toString().padStart(2,"0");
    if(msg.isRunning)configStart();
    else configEnd();
});

switchButton.addEventListener("click",()=>{
    workTimerElements.forEach(e=>e.toggleAttribute("hidden"));
    restTimerElements.forEach(e=>e.toggleAttribute("hidden"));
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
    switchButton.setAttribute("disabled","");
    workTimerElements.forEach(e=>e.removeAttribute("hidden"));
    restTimerElements.forEach(e=>e.setAttribute("hidden",""));
    stopButton.focus();
    stopButton.removeAttribute("disabled");
}

function configEnd(){
    startButton.removeAttribute("disabled");
    startButton.focus();
    switchButton.removeAttribute("disabled");
    myPomodoroInit.removeAttribute("readonly");
    stopButton.setAttribute("disabled","");
}