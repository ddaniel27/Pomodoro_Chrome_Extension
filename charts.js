let renderBtns = [...document.getElementsByClassName("renderBtn")];
renderBtns[0].addEventListener("click", function() {chartData(7)});
renderBtns[1].addEventListener("click", function() {chartData(30)});

function renderChart(data, labels) {
    var ctx = document.getElementById("myChart").getContext('2d');
    new Chart(ctx, {
        type: 'line',
        options:{
            scales:{
                y:{
                    title:{
                        display: true,
                        text: "Minutes"
                    }
                }
            }
        },
        data: {
            labels: labels,
            datasets: [{
                label: 'Your progress',
                data: data,
                borderColor: 'rgba(204, 153, 255, 1)',
                backgroundColor: 'rgba(230, 204, 255, 0.4)',
            }]
        },
    });
}

function resetChart(){
    document.getElementById("myChart").remove();
    let myContainer = [...document.getElementsByClassName("container")][0];
    myContainer.append(document.createElement("canvas"));
    let myChildrenArray = [...myContainer.childNodes];
    myChildrenArray[myChildrenArray.length - 1].setAttribute("id","myChart");
}

function chartData(day){
    resetChart();
    chrome.storage.sync.get(["timeTracker"],status=> {
        let myData = Object.values(status.timeTracker);
        let myLabels = Object.keys(status.timeTracker);
        if(day == 7){
            myData = myData.slice(24,31);
            myLabels = [1,2,3,4,5,6,7];
        }
        else{
            myData.shift();
            myLabels.shift();
        }
        renderChart(myData, myLabels);
    });
};

