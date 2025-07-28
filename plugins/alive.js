const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const status = ` *Hello ${pushname}, Im INDUWARA-MD👾*
        
╭━━━━━━━━━━━━━━┈⊷
┃ *⏳ Uptime*:  ${runtime(process.uptime())} 
┃ *📈 CPU Load*: ${os.loadavg()[0].toFixed(2)} (1 min avg)
┃ *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃ *⚙️ HostName*: ${os.hostname()}
┃ *👨‍💻 Owner*: isira induwara
┃ *🧬 Version*: V1 
╰──────────────┈⊷

 https://whatsapp.com/channel/0029Vb6FspM6RGJNsF4Sfs31

> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ`;

        // Send only image with caption (no voice)
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
