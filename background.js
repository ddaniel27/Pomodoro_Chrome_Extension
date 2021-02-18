//Cuando se actualiza la extensión se cargan valores por defecto
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({pomodoroWorkTimer: [25,0], pomodoroRestTimer: [5,0], isWorking: true});
  });

//Variables
let PORT, timerRunning, startTime, myWorkTime, minutes, seconds, isRunning=false;

chrome.runtime.onConnect.addListener(connected);

function connected(p){
    PORT=p;
    PORT.onMessage.addListener(msg=>{
        console.log(msg.nowIsWorking);
        if(msg.stopRunning) stopTimer(timerRunning,msg.nowIsWorking)//PORT.postMessage(stopTimer(timerRunning,msg.nowIsWorking));
        else myTimerFunc(msg);
    });
}

function startTimer(req){
    startTime = Date.now();
    myWorkTime = req;
    isRunning = true;
}

function stopTimer(timerID,workingTime){
    clearInterval(timerID);
    chrome.storage.sync.set({isWorking: (!workingTime)});
    return {thisMinutes: myWorkTime, thisSeconds: 0, isRunning: false};
}

function myNotification(){
    chrome.notifications.create({
        "type": "basic",
        "iconUrl": chrome.runtime.getURL("myicon.png"),
        "title": "Time for cake!",
        "message": "Something something cake"
      });
}

function myTimerFunc(request){
    startTimer(request.myWorkTime);
    timerRunning = window.setInterval(()=>{
        let difference = Date.now() - startTime;
        minutes = Math.floor(myWorkTime - (difference % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor(60-((difference % (1000 * 60)) / 1000));
        let timeToSend = {thisMinutes: minutes, thisSeconds: seconds, isRunning: isRunning};
        if(difference/1000 >= ((myWorkTime*60)-1)){
            myNotification();
            timeToSend = stopTimer(timerRunning,request.nowIsWorking);
        }
        try{
            PORT.postMessage(timeToSend);
        }catch(e){
            console.log("Waiting");
        }
    },1000);
}