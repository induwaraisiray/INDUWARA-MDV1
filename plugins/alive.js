const { cmd, commands } = require('../command');
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
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const status = `╭━━〔 *D-XTRO-MD* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *⏳Uptime*:  ${runtime(process.uptime())} 
┃◈┃• *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃◈┃• *⚙️ HostName*: ${os.hostname()}
┃◈┃• *👨‍💻 Owner*: ᴍʀ ᴅɪɴᴇꜱʜ
┃◈┃• *🧬 Version*: V2 BETA
┃◈└───────────┈⊷
╰──────────────┈⊷

  𝐪𝐮𝐞𝐞𝐧 𝐬𝐚𝐝𝐮 programing.𝐢𝐦 𝐚𝐥𝐢𝐯𝐞 𝐧𝐨𝐰. 

  https://whatsapp.com/channel/0029Vb0Anqe9RZAcEYc2fT2c

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ`;

        const voiceUrl = 'https://files.catbox.moe/5cs6nk.mp3';

        // 1. Send voice (PTT) message
        const voiceMessage = await conn.sendMessage(from, {
            audio: { url: voiceUrl },
            mimetype: 'audio/mpeg',
            ptt: true,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363357105376275@g.us@newsletter',
                    newsletterName: 'ᴍʀ ᴅɪɴᴇꜱʜ',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s

        // 2. Send image + caption + buttons
        await conn.sendMessage(from, {
            image: { url: `https://i.postimg.cc/44vBQhjF/IMG-20250206-224743.jpg` },
            caption: status,
            footer: "🔘 Select an option below:",
            buttons: [
                { buttonId: 'menu', buttonText: { displayText: '📜 Menu' }, type: 1 },
                { buttonId: 'ping', buttonText: { displayText: '📶 Ping' }, type: 1 }
            ],
            headerType: 4,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363357105376275@g.us@newsletter',
                    newsletterName: 'ᴍʀ ᴅɪɴᴇꜱʜ',
                    serverMessageId: 143
                }
            }
        }, { quoted: voiceMessage });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Optional: Handle 'menu' and 'ping' buttons
cmd({
    pattern: "menu",
    desc: "Show main menu",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    reply("📜 *Main Menu*\n\n✅ /alive\n✅ /ping\n✅ /news\n✅ /jataka 45\n...");
});

cmd({
    pattern: "ping",
    desc: "Check bot response",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    reply("🏓 *Pong!* Bot is alive and responding ✅");
});
