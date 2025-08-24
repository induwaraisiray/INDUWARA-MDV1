const config = require('../config');
const {cmd , commands} = require('../command');
const axios = require("axios");


cmd(
  {
  pattern: "xv",
  desc: "XV Search and Download",
  category: "download",
  use: ".xv <query>",
  react: "🔞",
}, async (darknero, match, m, { text }) => {
  
  if (!text) {
    return match.reply("🔍 Enter a search term!\n\n*Example:* `.xnxx hot`");
  }

  try {
    // Search request
    const search = await axios.get(`https://api.vreden.my.id/api/xnxxsearch?query=${encodeURIComponent(text)}`);
    const result = search.data?.result?.[0];
    if (!result) return match.reply("❌ No results found.");

    // Download request
    const download = await axios.get(`https://api.vreden.my.id/api/xnxxdl?query=${encodeURIComponent(result.link)}`);
    const video = download.data?.result?.files;

    if (!video?.high?.length) {
      return match.reply("⚠️ Could not get download link.");
    }

    // Send video info (thumbnail + title + duration)
    await darknero.sendMessage(m.chat, {
      image: { url: download.data.result.image },
      caption: `🔞 *${download.data.result.title}*\n\n🎞️ Duration: *${download.data.result.duration}s*\n\n> Join Support\nhttps://www.whatsapp.com/channel/0029Vb6Xm9H96H4SgVAD7E1M/182`
    }, { quoted: m });

    // Send the video itself
    await darknero.sendMessage(m.chat, {
      video: { url: video.high },
      mimetype: "video/mp4",
      caption: "*DONE...✅*",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: download.data.result.title.trim(),
          body: "Powered by DARK-NERO",
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: download.data.result.image,
          sourceUrl: result.link,
          mediaUrl: result.link,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    match.reply("❌ Error occurred while fetching the video.");
  }
});