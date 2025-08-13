const { cmd } = require('../command');
const config = require("../config");
const path = require('path');
const fs = require('fs');

// Helper function to safely read JSON
function safeReadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error(`JSON Read Error (${filePath}):`, err);
    return {};
  }
}

// Boolean check
function isEnabled(value) {
  return value && value.toString().toLowerCase() === "true";
}

// -------------------- Anti-Bad Words --------------------
cmd({ on: "body" }, async (conn, m, store, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
  try {
    const badWords = ["wtf", "mia", "xxx", "fuck", "sex", "huththa", "pakaya", "ponnaya", "hutto"];

    if (!isGroup || isAdmins || !isBotAdmins || !isEnabled(config.ANTI_BAD)) return;

    const messageText = body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord) {
      await conn.sendMessage(from, { delete: m.key });
      await conn.sendMessage(from, { text: "🚫 ⚠️ BAD WORDS NOT ALLOWED ⚠️ 🚫" }, { quoted: m });
    }
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing the message.");
  }
});

// -------------------- Anti-Delete --------------------
const { getAnti, setAnti } = require('../data/antidel');

cmd({
  pattern: "antidelete",
  alias: ['antidel', 'del'],
  desc: "Toggle anti-delete feature",
  category: "misc",
  filename: __filename
}, async (conn, mek, m, { from, reply, text, isCreator }) => {
  if (!isCreator) return reply('This command is only for the bot owner');

  try {
    const currentStatus = await getAnti();

    if (!text || text.toLowerCase() === 'status') {
      return reply(`*AntiDelete Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\nUsage:\n• .antidelete on - Enable\n• .antidelete off - Disable`);
    }

    const action = text.toLowerCase().trim();
    if (action === 'on') {
      await setAnti(true);
      reply('✅ Anti-delete has been enabled');
    } else if (action === 'off') {
      await setAnti(false);
      reply('❌ Anti-delete has been disabled');
    } else {
      reply('Invalid command. Usage:\n• .antidelete on\n• .antidelete off\n• .antidelete status');
    }
  } catch (e) {
    console.error("Error in antidelete command:", e);
    reply("An error occurred while processing your request.");
  }
});

// -------------------- Anti-Link (Warn or Kick) --------------------
global.warnings = {};

cmd({ on: "body" }, async (conn, m, store, { from, body, sender, isGroup, isAdmins, isBotAdmins, reply }) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins || !isEnabled(config.ANTI_LINK)) return;

    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
      /https?:\/\/(?:www\.)?whatsapp\.com\/channel\/\S+/gi,
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
      /https?:\/\/(?:www\.)?[a-z0-9-]+\.(com|net|org|info|io|me)\/\S+/gi,
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
    ];

    const containsLink = linkPatterns.some(pattern => pattern.test(body));
    if (!containsLink) return;

    await conn.sendMessage(from, { delete: m.key });

    if ((config.ANTI_LINK_MODE || "warn").toLowerCase() === "kick") {
      await conn.sendMessage(from, { text: `⚠️ Links are not allowed.\n@${sender.split('@')[0]} has been removed. 🚫`, mentions: [sender] });
      await conn.groupParticipantsUpdate(from, [sender], "remove");
    } else {
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];
      if (warningCount < 4) {
        await conn.sendMessage(from, {
          text: `‎*⚠️LINKS ARE NOT ALLOWED⚠️*\n*╭────⬡ WARNING ⬡────*\n*├▢ USER :* @${sender.split('@')[0]}\n*├▢ COUNT : ${warningCount}*\n*├▢ REASON : LINK SENDING*\n*├▢ WARN LIMIT : 3*\n*╰────────────────*`,
          mentions: [sender]
        });
      } else {
        await conn.sendMessage(from, { text: `@${sender.split('@')[0]} *HAS BEEN REMOVED - WARN LIMIT EXCEEDED!*`, mentions: [sender] });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});

// -------------------- Auto Presence --------------------
cmd({ on: "body" }, async (conn, mek, m, { from }) => {
  if (isEnabled(config.AUTO_RECORDING)) {
    await conn.sendPresenceUpdate('recording', from);
  }
});

cmd({ on: "body" }, async (conn, mek, m, { from }) => {
  if (isEnabled(config.AUTO_TYPING)) {
    await conn.sendPresenceUpdate('composing', from);
  }
});

// -------------------- Auto Reply --------------------
cmd({ on: "body" }, async (conn, mek, m, { from, body }) => {
  const data = safeReadJSON(path.join(__dirname, '../assets/autoreply.json'));
  if (isEnabled(config.AUTO_REPLY)) {
    for (const text in data) {
      if (body.toLowerCase() === text.toLowerCase()) {
        await m.reply(data[text]);
      }
    }
  }
});

// -------------------- Auto Sticker --------------------
cmd({ on: "body" }, async (conn, mek, m, { from, body }) => {
  const data = safeReadJSON(path.join(__dirname, '../assets/autosticker.json'));
  if (isEnabled(config.AUTO_STICKER)) {
    for (const text in data) {
      if (body.toLowerCase() === text.toLowerCase()) {
        const stickerPath = path.join(__dirname, '../assets/autosticker', data[text]);
        if (fs.existsSync(stickerPath)) {
          const stickerBuffer = fs.readFileSync(stickerPath);
          await conn.sendMessage(from, {
            sticker: stickerBuffer,
            packname: 'JESTER-AI',
            author: 'AUTO-STICKER'
          }, { quoted: mek });
        }
      }
    }
  }
});

// -------------------- ENV Command --------------------
cmd({
  pattern: "env",
  alias: ["config", "settings"],
  desc: "Show all bot configuration variables (Owner Only)",
  category: "system",
  react: "⚙️",
  filename: __filename
}, async (conn, mek, m, { from, reply, isCreator }) => {
  try {
    if (!isCreator) return reply("🚫 *Owner Only Command!*");

    const menuImageURL = config.MENU_IMAGE_URL || 'https://example.com/default-image.jpg';
    let envSettings = `
╭───『 *${config.BOT_NAME} CONFIG* 』───❏
│
├─❏ *🤖 BOT INFO*
│  ├─∘ *Name:* ${config.BOT_NAME}
│  ├─∘ *Prefix:* ${config.PREFIX}
│  ├─∘ *Owner:* ${config.OWNER_NAME}
│  ├─∘ *Number:* ${config.OWNER_NUMBER}
│  └─∘ *Mode:* ${config.MODE.toUpperCase()}
│
├─❏ *⚙️ CORE SETTINGS*
│  ├─∘ *Public Mode:* ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"}
│  ├─∘ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"}
│  ├─∘ *Read Msgs:* ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"}
│  └─∘ *Read Cmds:* ${isEnabled(config.READ_CMD) ? "✅" : "❌"}
│
├─❏ *🔌 AUTOMATION*
│  ├─∘ *Auto Reply:* ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"}
│  ├─∘ *Auto React:* ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"}
│  ├─∘ *Custom React:* ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"}
│  ├─∘ *React Emojis:* ${config.CUSTOM_REACT_EMOJIS}
│  ├─∘ *Auto Sticker:* ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"}
│
├─❏ *📢 STATUS SETTINGS*
│  ├─∘ *Status Seen:* ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"}
│  ├─∘ *Status Reply:* ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"}
│  ├─∘ *Status React:* ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"}
│  └─∘ *Status Msg:* ${config.AUTO_STATUS_MSG}
│
├─❏ *🛡️ SECURITY*
│  ├─∘ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"}
│  ├─∘ *Anti-Bad:* ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"}
│  ├─∘ *Anti-VV:* ${isEnabled(config.ANTI_VV) ? "✅" : "❌"}
│  └─∘ *Del Links:* ${isEnabled(config.DELETE_LINKS) ? "✅" : "❌"}
│
├─❏ *🎨 MEDIA*
│  ├─∘ *Alive Img:* ${config.ALIVE_IMG}
│  ├─∘ *Menu Img:* ${menuImageURL}
│  ├─∘ *Alive Msg:* ${config.LIVE_MSG}
│  └─∘ *Sticker Pack:* ${config.STICKER_NAME}
│
├─❏ *⏳ MISC*
│  ├─∘ *Auto Typing:* ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"}
│  ├─∘ *Auto Record:* ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"}
│  ├─∘ *Anti-Del Path:* ${config.ANTI_DEL_PATH}
│  └─∘ *Dev Number:* ${config.DEV}
│
╰───『 *${config.DESCRIPTION}* 』───❏
`;

    await conn.sendMessage(from, { image: { url: menuImageURL }, caption: envSettings }, { quoted: mek });
  } catch (error) {
    console.error('Env command error:', error);
    reply(`❌ Error displaying config: ${error.message}`);
  }
});