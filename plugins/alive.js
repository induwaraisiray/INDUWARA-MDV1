const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "📟",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const status = `╭━━〔 *D-XTRO-MD* 〕━━┈⊷
┃◈• *⏳Uptime*: ${runtime(process.uptime())}
┃◈• *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃◈• *⚙️ HostName*: ${os.hostname()}
┃◈• *👨‍💻 Owner*: ᴍʀ ᴅɪɴᴇꜱʜ
┃◈• *🧬 Version*: V2 BETA
╰──────────────┈⊷

𝐪𝐮𝐞𝐞𝐧 𝐬𝐚𝐝𝐮 𝐢𝐦 𝐚𝐥𝐢𝐯𝐞 𝐧𝐨𝐰.
🔗 https://whatsapp.com/channel/0029Vb0Anqe9RZAcEYc2fT2c`;

        const voiceUrl = 'https://files.catbox.moe/5cs6nk.mp3';

        // 1. Send Voice First
        const voiceMessage = await conn.sendMessage(from, {
            audio: { url: voiceUrl },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Send Image + Caption + Buttons
        await conn.sendMessage(from, {
            image: { url: `https://i.postimg.cc/44vBQhjF/IMG-20250206-224743.jpg` },
            caption: status,
            footer: "🔘 Select an option:",
            buttons: [
                { buttonId: 'menu', buttonText: { displayText: '📜 Menu' }, type: 1 },
                { buttonId: 'ping', buttonText: { displayText: '📶 Ping' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: voiceMessage });

    } catch (err) {
        console.error(err);
        reply('❌ Error: ' + err.message);
    }
});
