async function loadHardwareStatus() {

    try {

        const response = await fetch("/admin/hardwarestatus");
        const data = await response.json();

        const usedMemory =
            data.totalMemory - data.freeMemory;

        let cpuAvg = 0;
        let cpuMax = 0; 
        console.log(data.cpuInfo)  
        data.cpuInfo.forEach((cpu) => {
            if(cpu.speed > cpuMax){cpuMax = cpu.speed}
            cpuAvg += cpu.speed;
        });
        cpuAvg = parseInt(cpuAvg) / parseInt(data.cpuCount);

        const memoryPercent =
            ((usedMemory / data.totalMemory) * 100).toFixed(2);

        document.getElementById("hardware").innerHTML = `
            <div class="main-card">
                <strong>Hostname</strong><br>
                ${data.host}
            </div>

            <div class="main-card">
                <strong>CPU Count</strong><br>
                ${data.cpuCount}
            </div>

            <div class="main-card">
                <strong>Free Memory</strong><br>
                ${(data.freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB
            </div>

            <div class="main-card">
                <strong>Total Memory</strong><br>
                ${(data.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB
            </div>

            <div class="main-card">
                <strong>Memory Used</strong><br>
                ${memoryPercent}%
            </div>

            <div class="main-card">
                <strong>cpu Max</strong><br>
                ${cpuMax} Mhz
            </div>

            <div class="main-card">
                <strong>cpu average</strong><br>
                ${cpuAvg} Mhz
            </div>

        `;

    }
    catch (err) {

        console.error(err);

    }

}

async function loadVisitors() {

    try {

        const response = await fetch("/admin/visitors/50");
        const visitors = await response.json();

        const tbody =
            document.querySelector("#visitorTable tbody");

        tbody.innerHTML = "";

        visitors.forEach(visitor => {

            const row = document.createElement("tr");

            let date = convertDate(visitor.timestamp);

            row.innerHTML = `
                <td>${date}</td>
                <td>${visitor.method}</td>
                <td>${visitor.URL}</td>
                <td>${visitor.adress}</td>
            `;

            tbody.appendChild(row);

        });

    }
    catch (err) {

        console.error(err);

    }

}

function convertDate(timestamp) {
   
// Convert to Date object
const date = new Date(parseInt(timestamp));
// Format the date into a human-readable string
const humanReadableDate = date.toLocaleString("en-US", {
 year: "numeric",
 month: "long",
 day: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 second: "2-digit",
});
// Output the result
return humanReadableDate 
}

async function refresh() {

    await Promise.all([
        loadHardwareStatus(),
        loadVisitors()
    ]);

}

refresh();

/* Update every 5 seconds */
setInterval(refresh, 5000);