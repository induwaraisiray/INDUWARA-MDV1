const config = require('../config');
const { cmd } = require('../command');
const axios = require("axios");

cmd({
  pattern: "mediafire1",
  alias: ["mfire"],
  desc: "To download MediaFire files.",
  react: "♨️",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) {
      return reply("❌ Please provide a valid MediaFire link.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    let response;
    try {
      response = await axios.get(`https://nethu-api.vercel.app/download/mfire?url=${encodeURIComponent(q)}`);
    } catch (err) {
      console.error("API Error:", err.message);
      return reply("⚠️ MediaFire API is not responding. Please try again later.");
    }

    const data = response?.data;

    if (!data || !data.status || !data.result || !data.result.dl_link) {
      return reply("⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.");
    }

    const { dl_link, fileName, fileType, fileSize } = data.result;
    const file_name = fileName || "mediafire_download";
    const mime_type = fileType || "application/octet-stream";
    const file_size = fileSize || "Unknown";

    // Large file check (200MB example)
    if (fileSize && (parseInt(fileSize) > 200 * 1024 * 1024)) {
      return reply(`⚠️ The file is too large to send via WhatsApp.\n\n📦 *File Name:* ${file_name}\n📏 *Size:* ${file_size}`);
    }

    await conn.sendMessage(from, {
      react: { text: "⬆️", key: m.key }
    });

    // Initial caption
    let caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *File Name:* ${file_name}\n`
      + `┃▸ *File Type:* ${mime_type}\n`
      + `┃▸ *File Size:* ${file_size}\n`
      + `╰━━━⪼\n\n`
      + `📥 *Preparing download...*`;

    const msg = await conn.sendMessage(from, { text: caption }, { quoted: m });

    // Fake progress bar simulation
    const progressSteps = [
      "█░░░░░░░░░ 10%",
      "██░░░░░░░░ 20%",
      "███░░░░░░░ 30%",
      "████░░░░░░ 40%",
      "█████░░░░░ 50%",
      "██████░░░░ 60%",
      "███████░░░ 70%",
      "████████░░ 80%",
      "█████████░ 90%",
      "██████████ 100%"
    ];

    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(r => setTimeout(r, 600)); // Delay
      await conn.sendMessage(from, {
        edit: msg.key,
        text: `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n`
          + `┃▸ *File Name:* ${file_name}\n`
          + `┃▸ *File Size:* ${file_size}\n`
          + `╰━━━⪼\n\n`
          + `📥 Downloading...\n\n${progressSteps[i]}`
      });
    }

    // Send the file
    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: mime_type,
      fileName: file_name,
      caption: `✅ *Download Complete!*`
    }, { quoted: m });

  } catch (error) {
    console.error("Command Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});

cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  desc: "To download MediaFire files.",
  react: "♨️",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q) {
      return reply("❌ Please provide a valid MediaFire link.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const response = await axios.get(`https://nethu-api.vercel.app/download/mfire?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result || !data.result.dl_link) {
      return reply("⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.");
    }

    const { dl_link, fileName, fileType } = data.result;
    const file_name = fileName || "mediafire_download";
    const mime_type = fileType || "application/octet-stream";

    await conn.sendMessage(from, {
      react: { text: "⬆️", key: m.key }
    });

    const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *File Name:* ${file_name}\n`
      + `┃▸ *File Type:* ${mime_type}\n`
      + `╰━━━⪼\n\n`
      + `📥 *Downloading your file...*`;

    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: mime_type,
      fileName: file_name,
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});
    
