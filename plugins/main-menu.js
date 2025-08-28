const fs = require('fs');
const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu",
    desc: "Show interactive menu system",
    category: "menu",
    react: "📂",
    filename: __filename
}, async (conn, mek, { from, pushname }, { reply }) => {
    try {
        const totalCommands = Object.keys(commands).length;

        const menuCaption = `*╭━━━〔 Iɴᴅᴜᴡᴀʀᴀ-Mᴅ 〕━━┈⊷*
*│ ‍🤵‍♂️ 𝐔𝚜𝚎𝚛* : ${pushname || 'User'}
*│ 🔍 𝐁𝚊𝚕𝚒𝚢𝚊𝚛𝚜* : Multi Device
*│ ⌨️ 𝐓𝚢𝚙𝐞* : NodeJs
*│ ✒️ 𝐏𝚛𝐞𝐟𝐢𝐱* : [${config.PREFIX}]
*│ 📟 𝐕𝚎𝐫𝐬𝐢𝐨𝐧* : 1.0.0 Bᴇᴛᴀ 
*╰━━━━━━━━━━━━━━━━━┈⊷*
*⏬ 𝗠ᴇɴᴜ 𝗜ᴛᴇᴍꜱ*
╭━━━━━━━━━━━━●●►
│❯❯ 01 *DOWNLOAD*
│❯❯ 02 *GROUP*
│❯❯ 03 *SEARCH*
│❯❯ 04 *TOOLS*
│❯❯ 05 *AI*
│❯❯ 06 *OWNER*
│❯❯ 07 *NEWS*
│❯❯ 08 *MAIN*
╰━━━━━━━━━━━━●●►
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`;

        // Context info (mentions only)
        const contextInfo = {
            mentionedJid: [mek.sender],
            forwardingScore: 999,
            isForwarded: true
        };

        // Function to send menu (image fallback -> text)
        const sendMenuImage = async () => {
            try {
                return await conn.sendMessage(
                    from,
                    {
                        image: { url: "https://i.ibb.co/Zp6zsyF/2483.jpg" }, // check link
                        caption: menuCaption,
                        contextInfo
                    },
                    { quoted: mek }
                );
            } catch (err) {
                console.error("Image menu error:", err.message);
                return await conn.sendMessage(
                    from,
                    { text: menuCaption, contextInfo },
                    { quoted: mek }
                );
            }
        };

        let sentMsg;
        try {
            sentMsg = await Promise.race([
                sendMenuImage(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Image send timeout')), 10000))
            ]);
        } catch {
            sentMsg = await conn.sendMessage(
                from,
                { text: menuCaption, contextInfo },
                { quoted: mek }
            );
        }

        const messageID = sentMsg.key.id;

        // Menu data (options)
        const menuData = {
            '1': { title: "📥 *Download Menu*", content: `╭📥 *DOWNLOAD COMMANDS*
┃ facebook
┃ img
┃ ringtone
┃ tiktok
┃ ytpost
┃ ig2
┃ twitter
┃ apk
┃ gdrive
┃ gitclone
┃ movie
┃ pindl
┃ song
┃ mp3
┃ video
┃ mp4
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '2': { title: "👥 *Group Menu*", content: `╭👥 *GROUP COMMANDS*
┃ join <link>
┃ invite
┃ revoke
┃ kick @user
┃ promote @user
┃ demote @user
┃ hidetag <text>
┃ taggp <groupJid>
┃ ginfo
┃ mute
┃ unmute
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '3': { title: "🔍 *Search Menu*", content: `╭🔍 *SEARCH COMMANDS*
┃ npm
┃ yts
┃ ytinfo
┃ srepo
┃ xstalk
┃ whether
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '4': { title: "🔗 *Tools Menu*", content: `╭🔗 *TOOLS COMMANDS*
┃ cinfo
┃ tourl
┃ aivoice
┃ report
┃ msg
┃ tempmail
┃ genmail
┃ mailinbox
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '5': { title: "🤖 *AI Menu*", content: `╭🤖 *AI COMMANDS*
┃ gpt
┃ openai
┃ deepseek
┃ gpt4
┃ chatgpt
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '6': { title: "👨‍💻 *Owner Menu*", content: `╭👨‍💻 *OWNER COMMANDS*
┃ vv
┃ vv2 (❤️, 😇, 💔, 🙂, 😂)
┃ getpp <number>
┃ fullpp
┃ block
┃ unblock
┃ send
┃ sendme / save
┃ jid
┃ svtext <text>
┃ restart
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '7': { title: "📰 *News Menu*", content: `╭📰 *NEWS COMMANDS*
┃ newson
┃ newsoff
┃ autonews
┃ alerton
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true },

            '8': { title: "📂 *Main Menu*", content: `╭📂 *MAIN COMMANDS*
┃ alive
┃ ping
┃ system
┃ menu
┃ repo
┃ about
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, image: true }
        };

        // Handler
        const handler = async (msgData) => {
            try {
                const receivedMsg = msgData.messages[0];
                if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

                const isReplyToMenu = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (isReplyToMenu) {
                    const receivedText = receivedMsg.message.conversation || 
                                         receivedMsg.message.extendedTextMessage?.text;
                    const senderID = receivedMsg.key.remoteJid;

                    if (menuData[receivedText]) {
                        const selectedMenu = menuData[receivedText];
                        try {
                            if (selectedMenu.image) {
                                await conn.sendMessage(
                                    senderID,
                                    {
                                        image: { url: "https://i.ibb.co/Zp6zsyF/2483.jpg" },
                                        caption: selectedMenu.content,
                                        contextInfo
                                    },
                                    { quoted: receivedMsg }
                                );
                            } else {
                                await conn.sendMessage(
                                    senderID,
                                    { text: selectedMenu.content, contextInfo },
                                    { quoted: receivedMsg }
                                );
                            }
                            await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
                        } catch (err) {
                            console.error("Submenu error:", err.message);
                            await conn.sendMessage(senderID, { text: selectedMenu.content, contextInfo }, { quoted: receivedMsg });
                        }
                    } else {
                        await conn.sendMessage(
                            senderID,
                            { text: `❌ *Invalid Option!* ❌\n\nReply 1-8 to select a menu.\n> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*`, contextInfo },
                            { quoted: receivedMsg }
                        );
                    }
                }
            } catch (e) {
                console.log('Handler error:', e);
            }
        };

        conn.ev.on("messages.upsert", handler);
        setTimeout(() => conn.ev.off("messages.upsert", handler), 300000);

    } catch (e) {
        console.error('Menu Error:', e);
        try {
            await conn.sendMessage(
                from,
                { text: `❌ Menu system busy. Try later.\n> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*` },
                { quoted: mek }
            );
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});
