let inputFields = [...document.getElementsByClassName("text-timer")];
let textFields = [...document.getElementsByClassName("dummy-text")];
let setButtons = [...document.getElementsByClassName("options-behavior-button")];

chrome.storage.sync.get(["pomodoroWorkTimer", "pomodoroRestTimer"],(res)=>{
    inputFields[0].value = res.pomodoroWorkTimer[0] > 10
    ? res.pomodoroWorkTimer[0]
    : res.pomodoroWorkTimer[0].toString().padStart(2, "0");
    inputFields[1].value = res.pomodoroRestTimer[0] > 10
    ? res.pomodoroRestTimer[0]
    : res.pomodoroRestTimer[0].toString().padStart(2, "0");
});

setButtons.forEach((btn,idx) => {
    btn.addEventListener("click",()=>{
        let obj = idx ? {pomodoroRestTimer:[Number(inputFields[idx].value),0]} : {pomodoroWorkTimer:[Number(inputFields[idx].value),0]};
        console.log(obj);
        if(isNaN(inputFields[idx].value)){
            alert("Sorry, but you can't set a not a number value");
        }else{
            chrome.storage.sync.set(obj,()=>textFields[idx].innerHTML = `Now your default time is: ${inputFields[idx].value}`);
        }
    });
});