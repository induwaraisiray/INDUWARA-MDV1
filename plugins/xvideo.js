const { cmd } = require('../command');
const axios = require("axios");

cmd({
  pattern: "mediafire",
  alias: ["mf", "mfdown"],
  desc: "To download MediaFire files.",
  react: "♨️",
  category: "download",
  filename: __filename,
  handler: async (m, { conn, text }) => {
    if (!text) {
      return m.reply('❌ Please provide a MediaFire link to download.\n\nExample: https://www.mediafire.com/file/xxxxxxxxx/xxxxx.zip/file');
    }

    try {
      // Fetch data from API
      const { data } = await axios.get(`https://restapi.simplebot.my.id/api/download/mediafire?url=${text}`);

      console.log(data);

      // Validate API response
      if (!data || !data.result || !data.result.url) {
        return m.reply('⚠️ Invalid response from API. Please check the link.');
      }

      // Notify user
      await conn.sendMessage(m.chat, { text: "⬇️ Downloading your file from MediaFire..." }, { quoted: m });

      // Send the file
      await conn.sendMessage(m.chat, {
        document: { url: data.result.url },
        mimetype: data.result.mimetype || 'application/octet-stream',
        fileName: data.result.filename || "mediafire_file",
        caption: `📂 *Name*: ${data.result.filename}\n📦 *Size*: ${data.result.size}`
      }, { quoted: m });

      // Success confirmation
      await conn.sendMessage(m.chat, { text: "✅ File uploaded successfully!" }, { quoted: m });

    } catch (error) {
      console.error('Error downloading MediaFire file:', error);
      m.reply('❌ Failed to download the file. Please check the MediaFire link and try again.');
    }
  }
});
