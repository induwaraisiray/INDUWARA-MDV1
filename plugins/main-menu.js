const config = require('../config');
const { cmd, commands } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu",
    alias: ["allmenu", "fullmenu"],
    use: '.menu',
    desc: "Show all bot commands",
    category: "menu",
    react: "📂",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        let dec = `👋Hello ${pushname}
> 🚀𝗪ᴇʟʟ𝗖ᴏᴍᴇ 𝗧ᴏ 𝗜ɴᴅᴜᴡᴀʀᴀ-𝗠ᴅ📌        
╭━━━━━━━━━━━━━━┈⊷
┃ *⏱️ Uptime*:  ${runtime(process.uptime())} 
┃ *👤 User*: ${pushname}
┃ *👾 Bot*: ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ
┃ *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃ *⚙️ HostName*: ${os.hostname()}
┃ *📦 Version* : *0.0.1*
╰━━━━━━━━━━━━━━━━━━━┈⊷

> 📂 *BOT MENU* 
╭──────────·๏
┃ alive
┃ ping
┃ restart 
┃ song
┃ setting
┃ vv
┃ vv2 (❤️,😇,💔,🙂,😂)
┃ ytsearch
┃ system 
┃ autonews
╰━━━━━━━━━━┈⊷
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ`;

        await conn.sendMessage(from, {
            image: { url: `https://i.ibb.co/Zp6zsyFs/2483.jpg` },
            caption: dec,
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
        console.error("Error in menu command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
