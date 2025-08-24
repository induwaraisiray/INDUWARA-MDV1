const { cmd } = require('../command');
const axios = require("axios");
global.xnxxCache = global.xnxxCache || new Map();


cmd({
  pattern: "xnxx",
  desc: "XNXX Search and Download",
  category: "download",
  use: ".xnxx <query>",
  react: "🔞",
}, async (darknero, match, m, { text }) => {
  if (!text) return m.reply("🔍 Enter a search term!\n\n*Example:* `.xnxx hot`");

  try {
    const search = await axios.get(`https://api.vreden.my.id/api/xnxxsearch?query=${encodeURIComponent(text)}`);
    const result = search.data?.result?.[0];
    if (!result) return m.reply("❌ No results found.");

    const download = await axios.get(`https://api.vreden.my.id/api/xnxxdl?query=${encodeURIComponent(result.link)}`);
    const video = download.data?.result;
    if (!video?.files) return m.reply("⚠️ Could not get download link.");

    const videoUrl = video.files.high || video.files.low;

    // Send thumbnail & info
    await darknero.sendMessage(m.chat, {
      image: { url: video.image },
      caption: `🔞 *${video.title}*\n🎞️ Duration: *${video.duration}s*\n> *•ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ•*`
    }, { quoted: m });

    // Send video
    await darknero.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: "video/mp4",
      caption: "*DONE...✅*",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: video.title.trim(),
          body: "*•ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ•*",
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true,
          thumbnailUrl: video.image,
          sourceUrl: result.link,
          mediaUrl: result.link,
          showAdAttribution: true,
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply("❌ Error occurred while fetching the video.");
  }
});

cmd({
  pattern: "xnxxm",
  desc: "XNXX Search and Download",
  category: "download",
  use: ".xnxxm <query>",
  react: "🔞",
}, async (darknero, match, m, { text }) => {
  if (!text) {
    return darknero.sendMessage(m.chat, { text: "🔍 Search term send!\n\n*example :* `.xnxxm hot`" }, { quoted: m });
  }

  try {
    // Step 1: Search
    const search = await axios.get("https://api.vreden.my.id/api/xnxxsearch?query=" + encodeURIComponent(text));
    const results = search.data?.result;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return darknero.sendMessage(m.chat, { text: "❌ Results නැහැ!" }, { quoted: m });
    }

    // Step 2: Build Menu (Top 10 results)
    let menu = `🔞 *XNXX Search Results*\n\n`;
    results.slice(0, 10).forEach((vid, i) => {
      menu += `*${i + 1}.* ${vid.title}\n`;
      if (vid.duration) menu += `   ⏱️ Duration: ${vid.duration}\n`;
      if (vid.views) menu += `   👁️ Views: ${vid.views}\n`;
      if (vid.quality) menu += `   🎞️ Quality: ${vid.quality}\n`;
      if (vid.tags) menu += `   🏷️ Tags: ${vid.tags.join(", ")}\n`;
      menu += `   🔗 ${vid.link}\n\n`;
    });

    menu += `➡️ Reply with a *number (1-${Math.min(10, results.length)})* to download.\n(⏳ Auto clear in 5 minutes)`;

    // Save results for reply (cache per user)
    global.xnxxCache.set(m.sender, results.slice(0, 10));

    // Auto clear after 5 minutes
    setTimeout(() => {
      if (global.xnxxCache.has(m.sender)) global.xnxxCache.delete(m.sender);
    }, 5 * 60 * 1000);

    await darknero.sendMessage(m.chat, { text: menu }, { quoted: m });

  } catch (err) {
    console.error(err);
    darknero.sendMessage(m.chat, { text: "❌ Error occurred while fetching search results." }, { quoted: m });
  }
});

// 🔽 Number reply handler (Download Selected Video)
cmd({
  on: "text"
}, async (darknero, match, m, { text }) => {
  if (!global.xnxxCache.has(m.sender)) return;
  const videos = global.xnxxCache.get(m.sender);
  if (!videos) return;

  const choice = parseInt(text.trim());
  if (isNaN(choice) || choice < 1 || choice > videos.length) return;

  const selected = videos[choice - 1];

  try {
    // Step 3: Get download info
    const download = await axios.get("https://api.vreden.my.id/api/xnxxdl?query=" + encodeURIComponent(selected.link));
    const video = download.data?.result;

    if (!video?.files?.high) {
      return darknero.sendMessage(m.chat, { text: "⚠️ Could not get download link." }, { quoted: m });
    }

    // Step 4: Send details (with thumbnail)
    await darknero.sendMessage(
      m.chat,
      {
        image: { url: video.image },
        caption: 
          `🔞 *${video.title}*\n\n` +
          `⏱️ Duration: *${video.duration}*\n` +
          (video.views ? `👁️ Views: *${video.views}*\n` : "") +
          (video.quality ? `🎞️ Quality: *${video.quality}*\n` : "") +
          (video.tags ? `🏷️ Tags: *${video.tags.join(", ")}*\n` : "") +
          `\n➡️ Source: ${selected.link}\n\n` +
          `> *•ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ•*`
      },
      { quoted: m }
    );

    // Step 5: Send video (check size if needed)
    await darknero.sendMessage(
      m.chat,
      {
        video: { url: video.files.high },
        mimetype: "video/mp4",
        caption: "*DONE...✅*"
      },
      { quoted: m }
    );

    // Clear cache for this user
    global.xnxxCache.delete(m.sender);

  } catch (err) {
    console.error(err);
    darknero.sendMessage(m.chat, { text: "❌ Error occurred while downloading video." }, { quoted: m });
  }
});;