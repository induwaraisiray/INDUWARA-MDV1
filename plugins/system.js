const config = require('../config')
const { cmd } = require('../command')
const os = require("os")
const { runtime } = require('../lib/functions')

cmd({
    pattern: "system",
    react: "🛠️️",
    alias: ["uptime", "status", "runtime"],
    desc: "Check bot's system uptime and status.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, {
    from, reply, pushname
}) => {
    try {
        const uptime = runtime(process.uptime());
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(2);
        const cpuLoad = os.loadavg()[0].toFixed(2);
        const hostname = os.hostname();

        const status = `*╭──────────●●►*
*> System Information ⚠️*

*_⏰ UPTIME:_* ${uptime}
*_📊 RAM USAGE:_* ${ramUsed}MB / ${ramTotal}MB
*_🛠️ HOSTNAME:_* ${hostname}
*_📈 CPU LOAD:_* ${cpuLoad} (1 min avg)
*_🧬 VERSION:_* V1 
*_👨‍💻 OWNER:_* Isira Induwara
*╰──────────●●►*`;

        await conn.sendMessage(from, {
            image: { url: `https://i.ibb.co/srSNWLW/w-Clr-IIGJFm.jpg` },
            caption: status
        }, { quoted: mek });

    } catch (e) {
        console.log(e)
        reply(`❌ Error: ${e.message}`)
    }
});
