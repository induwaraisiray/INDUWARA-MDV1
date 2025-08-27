const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const config = require('../config');
const axios = require('axios');

// ALIVE COMMAND
cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        const status = ` *Hello ${pushname}, Im INDUWARA-MD👾*
        
╭━━━━━━━━━━━━━━┈⊷
┃ *⏳ Uptime*:  ${runtime(process.uptime())} 
┃ *📈 CPU Load*: ${os.loadavg()[0].toFixed(2)} (1 min avg)
┃ *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃ *⚙️ HostName*: ${os.hostname()}
┃ *👨‍💻 Owner*: Isira Induwara
┃ *🧬 Version*: V1 
╰──────────────┈⊷

 https://whatsapp.com/channel/0029Vb6FspM6RGJNsF4Sfs31

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ`;

        await conn.sendMessage(from, {
            image: { url: `https://i.ibb.co/srSNWLW/w-Clr-IIGJFm.jpg` },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363357105376275@g.us@newsletter',
                    newsletterName: 'INDUWARA-MD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// PING COMMAND
cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const startTime = Date.now();
        const message = await conn.sendMessage(from, { text: '*PINGING...*' });
        const endTime = Date.now();
        const ping = endTime - startTime;
        await conn.sendMessage(from, { text: `*🔥 Pong : ${ping}ms*` }, { quoted: message });
    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`❌ ${e.message}`);
    }
});

// SYSTEM COMMAND
cmd({
    pattern: "system",
    react: "🛠️️",
    alias: ["sysinfo"],
    desc: "Check bot's system uptime and status.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
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
        console.error("Error in system command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
