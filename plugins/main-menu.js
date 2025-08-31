const config = require("../config");
const { cmd, commands } = require("../command");
const os = require("os");
const { runtime } = require("../lib/functions");

const imageUrl = "https://files.catbox.moe/bs9phe.jpg";

cmd(
  {
    pattern: "menu",
    react: "🗿",
    alias: ["panel", "main"],
    desc: "bot menu all",
    category: "commands",
    use: ".menu",
    filename: __filename,
  },
  async (conn, mek, m, { from, quoted, pushname, reply }) => {
    try {
      const menuMessage = `
*╭━━━〔 Iɴᴅᴜᴡᴀʀᴀ-Mᴅ 〕━━┈⊷*
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
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;


      // send menu message with image
      const sentMsg = await conn.sendMessage(from, {
        image: { url: imageUrl },
        caption: menuMessage,
      });

      // wait for replies (numbers 1-08)
      conn.ev.on("messages.upsert", async (msgUpdate) => {
        const msg = msgUpdate.messages[0];
        if (!msg.message || !msg.message.extendedTextMessage) return;

        const userReply =
          msg.message.extendedTextMessage.text.trim();

        if (
          msg.message.extendedTextMessage.contextInfo &&
          msg.message.extendedTextMessage.contextInfo.stanzaId ===
            sentMsg.key.id
        ) {
          let menuText;
          switch (userReply) {
            case "1":
              menuText = `
╭📥 *DOWNLOAD COMMANDS*
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
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "2":
              menuText = `
╭👥 *GROUP COMMANDS*
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
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "3":
              menuText = `
╭🔍 *SEARCH COMMANDS*
┃ npm
┃ yts
┃ ytinfo
┃ srepo
┃ xstalk
┃ whether
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "4":
              menuText = `
🔗 *TOOLS COMMANDS*
┃ cinfo
┃ tourl
┃ aivoice
┃ report
┃ msg
┃ tempmail
┃ genmail
┃ mailinbox
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "5":
              menuText = `
🤖 *AI COMMANDS*
┃ gpt
┃ openai
┃ deepseek
┃ gpt4
┃ chatgpt
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "6":
              menuText = `
╭👨‍💻 *OWNER COMMANDS*
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
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "7":
              menuText = `
╭📰 *NEWS COMMANDS*
┃ newson
┃ newsoff
┃ autonews
┃ alerton
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            case "8":
              menuText = `
╭📂 *MAIN COMMANDS*
┃ alive
┃ ping
┃ system
┃ menu
┃ repo
┃ about
╰━━━━━━━━━━━━━┈⊷
> *• © ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ •*
`;
              break;

            default:
              menuText =
                "❌ Invalid option. Please enter a valid number (1-10)";
          }

          await conn.sendMessage(from, { text: menuText }, { quoted: msg });
        }
      });
    } catch (e) {
      console.error(e);
      reply("⚠ An error occurred: " + e.message);
    }
  }
);
