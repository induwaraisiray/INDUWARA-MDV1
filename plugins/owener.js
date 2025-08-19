const config = require('../config');
const { cmd } = require('../command');
const os = require("os");
const Jimp = require("jimp");
const axios = require("axios");

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
        messageContent = { image: buffer, caption: match.quoted.text || '' };
        break;
      case "videoMessage":
        messageContent = { video: buffer, caption: match.quoted.text || '' };
        break;
      case "audioMessage":
        messageContent = { audio: buffer, ptt: match.quoted.ptt || false };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(message.sender, messageContent, options);
  } catch (error) {
    console.error("vv2 Error:", error);
    await client.sendMessage(from, { text: "❌ Error fetching vv2 message:\n" + error.message }, { quoted: message });
  }
});

// VV command
cmd({
  pattern: "vv",
  alias: ["viewonce", "retrive"],
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
      text: "*👾 This is not a view once message!*"
    }, { quoted: message });

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const options = { quoted: message };

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = { image: buffer, caption: match.quoted.text || '' };
        break;
      case "videoMessage":
        messageContent = { video: buffer, caption: match.quoted.text || '' };
        break;
      case "audioMessage":
        messageContent = { audio: buffer, ptt: match.quoted.ptt || false };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, { text: "❌ Error fetching vv message:\n" + error.message }, { quoted: message });
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
}, async (client, message, match, { text, from, isCreator }) => {
  try {
    if (!isCreator) return message.reply("🚫 *Only owner can use this command!*");

    if (!text) return message.reply("🔥 Please provide a phone number (e.g., .getpp 1234567890)");

    const targetJid = text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    let ppUrl;
    try {
      ppUrl = await client.profilePictureUrl(targetJid, "image");
    } catch {
      return message.reply("🖼️ This user has no profile picture or it cannot be accessed!");
    }

    await client.sendMessage(from, {
      image: { url: ppUrl },
      caption: `© Powered by Induwara 〽️ MD`
    }, { quoted: message });

  } catch (e) {
    console.error("PP Fetch Error:", e);
    message.reply("🛑 An error occurred while fetching the profile picture!");
  }
});

// Send/Save quoted message
cmd({
  pattern: "send",
  alias: ["sendme", "save"],
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
        messageContent = { image: buffer, caption: match.quoted.text || '' };
        break;
      case "videoMessage":
        messageContent = { video: buffer, caption: match.quoted.text || '' };
        break;
      case "audioMessage":
        messageContent = { audio: buffer, ptt: match.quoted.ptt || false };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);
  } catch (error) {
    console.error("Forward Error:", error);
    await client.sendMessage(from, { text: "❌ Error forwarding message:\n" + error.message }, { quoted: message });
  }
});

// JID command
cmd({
  pattern: 'jid',
  desc: 'Get the chat JID (WhatsApp ID)',
  category: 'tools',
  react: '🆔',
}, async (client, message, match) => {
  try {
    message.reply(message.chat);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error getting JID.');
  }
});

// FullPP command
cmd({
  pattern: 'fullpp',
  react: '🖼️',
  category: 'owner'
}, async (client, message, match, { isCreator }) => {
  try {
    if (!isCreator) return message.reply("🚫 *You are not authorized to use this command!*");

    if (!match.quoted) return message.reply("🍁 Please reply to an image message!");

    const media = await match.quoted.download();
    let image = await Jimp.read(media);

    const size = Math.max(image.bitmap.width, image.bitmap.height);
    if (image.bitmap.width !== image.bitmap.height) {
      const squareImage = new Jimp(size, size, 0x00000000);
      squareImage.composite(image, (size - image.bitmap.width) / 2, (size - image.bitmap.height) / 2);
      image = squareImage;
    }

    const ppSize = process.env.USER_PP_SIZE || 720;
    image.resize(ppSize, ppSize);

    await client.updateProfilePicture(client.user.id, await image.getBufferAsync(Jimp.MIME_JPEG));

    message.reply("✅ *Profile picture updated successfully!*");
  } catch (e) {
    console.error("Fullpp command error:", e);
    message.reply("❌ Error occurred while processing fullpp.");
  }
});

// Save text command
cmd({
  pattern: 'svtext',
  desc: 'Save text content and get shareable URL',
  category: 'tools',
  react: '📄',
}, async (client, message, match, { text }) => {
  try {
    if (!text) return message.reply('📌 Please provide text to save.\n\nExample: *.svtext Hello bro*');

    const title = `Text by ${message.pushName || 'User'}`;
    const response = await axios.post('https://text.genux.me/api/texts', { title, content: text });

    const json = response.data;
    if (!json || !json.success || !json.links?.view) {
      return message.reply('❌ Failed to save text. Try again later.');
    }

    message.reply(`✅ *Text Saved!*\n📄 *Title:* ${title}\n🔗 *URL:* ${json.links.view}`);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error saving text.');
  }
});
