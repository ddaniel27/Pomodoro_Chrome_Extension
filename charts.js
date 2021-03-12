function renderChart(data, labels) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Your progress',
                data: data,
            }]
        },
    });
}

document.getElementById("renderBtn").addEventListener("click", function() {chartData()})


function chartData(){
    chrome.storage.sync.get(["timeTracker"],status=> {
        let myData = Object.values(status.timeTracker);
        let myLabels = Object.keys(status.timeTracker);
        myData.shift();
        myLabels.shift();
        renderChart(myData, myLabels);
    });
};