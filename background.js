//Variables
let PORT, timerRunning, difference, startTime, myWorkTime, minutes, seconds, isRunning=false;

chrome.runtime.onConnect.addListener(connected);

function connected(p){
    PORT=p;
    PORT.onMessage.addListener(msg=>{
        if(msg.stopRunning){
            stopTimer(timerRunning);
        }
        else myTimerFunc(msg);
    });
}

function startTimer(req){
    startTime = Date.now();
    myWorkTime = req;
    isRunning = true;
}

function stopTimer(timerID){
    clearInterval(timerID);
    PORT.postMessage({thisMinutes: myWorkTime, thisSeconds: 0, isRunning: false});
}

function myTimerFunc(request){
    startTimer(request.myWorkTime);
    timerRunning = window.setInterval(()=>{
        difference = Date.now() - startTime;
        minutes = Math.floor(myWorkTime - (difference % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor(61-((difference % (1000 * 60)) / 1000));
        // console.log(minutes,seconds,PORT.name);
        try{
            PORT.postMessage({thisMinutes: minutes, thisSeconds: seconds, isRunning: isRunning});
        }catch(e){
            console.log("Waiting...")
        }
        if(difference/1000 >= ((myWorkTime*60)-1)){
           try{
               stopTimer(timerRunning);
           }catch(e){
               console.log(timerRunning);
           }
        }
    },1000);
}