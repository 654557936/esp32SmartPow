const os = require('os');
const osu = require('os-utils');
const si = require('systeminformation');

var getMetrics = require( 'metrics-os' );
var detaTx = null;
var detaRx = null;
async function getHardwareInfo() {
    try {
        osu.cpuUsage(async function(cpuUsage) {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memUsage = (usedMem / totalMem) * 100;

            const cpuTemp = await si.cpuTemperature();
            const cpuSpeed = await si.cpuCurrentSpeed();
            const gpu = await si.graphics();
            const networkStats = (await si.networkStats())[0];
            
        
            detaTx = detaTx === null ? networkStats.tx_bytes:networkStats.tx_bytes - detaTx;
            detaRx = detaRx === null ? networkStats.rx_bytes:networkStats.rx_bytes - detaRx;

            const hardwareInfo = {
                'CPU Usage': `${(cpuUsage * 100).toFixed(2)}%`,
                ramUsage: `${memUsage.toFixed(2)}%`,
                cpuTemp: cpuTemp.main !== null ? `${cpuTemp.main}°C` : 'N/A',
                cpuFrequency: cpuSpeed.avg !== null ? `${cpuSpeed.avg.toFixed(2)}GHz` : 'N/A',
                ramUsed: `${(usedMem / (1024 ** 3)).toFixed(2)}GB`,
                ramAvailable: `${(freeMem / (1024 ** 3)).toFixed(2)}GB`,
                gpuUsed: gpu.controllers.length > 0 && gpu.controllers[0].memoryUsed !== undefined ? `${(gpu.controllers[0].memoryUsed / (1024 ** 3)).toFixed(2)}GB` : 'N/A',
                gpuFrequency: gpu.controllers.length > 0 && gpu.controllers[0].clockCore !== undefined ? `${gpu.controllers[0].clockCore}MHz` : 'N/A',
                fps: gpu.displays.length > 0 && gpu.displays[0].currentRefreshRate !== undefined ? `${gpu.displays[0].currentRefreshRate}Hz` : 'N/A',
                uploadSpeed: networkStats && detaTx !== null ? `${(detaTx / (1024 ** 2)).toFixed(2)}MB/s` : 'N/A',
                downloadSpeed: networkStats && detaRx !== null ? `${(detaRx / (1024 ** 2)).toFixed(2)}MB/s` : 'N/A'
            };

            console.log(hardwareInfo);
        });
    } catch (error) {
        console.error(error);
    }
}

metrics = getMetrics();
setInterval(() => {
    getHardwareInfo();
}, 1000);