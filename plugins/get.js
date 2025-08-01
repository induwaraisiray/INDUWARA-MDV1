const config = require('../config');
const { cmd, commands } = require('../command'); // ✅ Only one declaration!
const os = require("os");

// VV2 command
cmd({
  pattern: "vv2",
  alias: ["❤️", "😇", "💔", "🙂", "😂", "send"],
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) return;
    if (!match.quoted) return await client.sendMessage(from, {
      text: "*🍁 Please reply to a view once message!*"
    }, { quoted: message });

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(message.sender, messageContent, options);
  } catch (error) {
    console.error("vv2 Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv2 message:\n" + error.message
    }, { quoted: message });
  }
});

// VV command
cmd({
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '🐳',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) return await client.sendMessage(from, {
      text: "*☢️ This is an owner command.*"
    }, { quoted: message });

    if (!match.quoted) return await client.sendMessage(from, {
      text: "*👾 මෙය oneviwe massege එකක් නොවේ!*"
    }, { quoted: message });

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});

// GetPP command
cmd({
  pattern: "getpp",
  react: "🖼️",
  desc: "Sends the profile picture of a user by phone number (owner only)",
  category: "owner",
  use: ".getpp <phone number>",
  filename: __filename
}, async (darknero, match, me, { text }) => {
  try {
    if (!text) return match.reply("🔥 Please provide a phone number (e.g., .getpp 1234567890)");

    const targetJid = text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    let ppUrl;
    try {
      ppUrl = await darknero.profilePictureUrl(targetJid, "image");
    } catch (e) {
      return match.reply("🖼️ This user has no profile picture or it cannot be accessed!");
    }

    let userName = targetJid.split("@")[0];
    try {
      const contact = await darknero.onWhatsApp(targetJid);
      userName = contact?.[0]?.notify || contact?.[0]?.vname || userName;
    } catch (e) {
      // fallback name used
    }

    await darknero.sendMessage(match.chat, {
      image: { url: ppUrl },
      caption: `𝗣𝗢𝗪𝗘𝗥𝗗 𝗕𝗬 𝗜𝗡𝗗𝗨𝗪𝗔𝗥𝗔 〽️𝗗 +${userName}`
    }, { quoted: match });

    await darknero.sendMessage(match.chat, {
      react: { text: "✅", key: match.key }
    });

  } catch (e) {
    console.error("PP Fetch Error:", e);
    match.reply("🛑 An error occurred while fetching the profile picture!");
  }
});
// send/save status command
cmd({
  pattern: "send",
  alias: ["sendme", 'save'],
  react: '📤',
  desc: "Forwards quoted message back to user",
  category: "utility",
  filename: __filename
}, async (client, message, match, { from }) => {
  try {
    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message!*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: match.quoted.ptt || false
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("Forward Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error forwarding message:\n" + error.message
    }, { quoted: message });
  }
});
