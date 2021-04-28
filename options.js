let inputFields = [...document.getElementsByClassName("text-timer")];
let textFields = [...document.getElementsByClassName("dummy-text")];
let setButton = document.getElementById("setButton");
let dropdown = document.getElementById("sound");
let audioTester = document.getElementById("audioTester");
let soundToUse;

chrome.storage.sync.get(["pomodoroWorkTimer", "pomodoroRestTimer", "soundToUse"],(res)=>{
    inputFields[0].value = res.pomodoroWorkTimer[0] > 10
    ? res.pomodoroWorkTimer[0]
    : res.pomodoroWorkTimer[0].toString().padStart(2, "0");
    inputFields[1].value = res.pomodoroRestTimer[0] > 10
    ? res.pomodoroRestTimer[0]
    : res.pomodoroRestTimer[0].toString().padStart(2, "0");
    soundToUse = res.soundToUse;
    let childSelected = [...dropdown.children].find(child => child.value == soundToUse);
    childSelected.setAttribute("selected","selected")
    audioTester.setAttribute("src",`./Audio/${soundToUse}.mp3`);
});


setButton.addEventListener("click",()=>{
    if(isNaN(inputFields[0].value) || isNaN(inputFields[1].value)){
        alert("Sorry, but you can't set a not a number value");
    }else{
        chrome.storage.sync.set({
            pomodoroWorkTimer:[Number(inputFields[0].value),0],
            pomodoroRestTimer:[Number(inputFields[1].value),0],
            soundToUse: soundToUse
        },()=>{
            textFields.forEach((textField,idx) =>{
                textField.innerHTML = `Now your default time is: ${inputFields[idx].value}`;
            });
        });
    }
});

dropdown.addEventListener("change",function(){
    soundToUse = dropdown.value;
    audioTester.setAttribute("src",`./Audio/${soundToUse}.mp3`);
});

