const { cmd } = require('../command');
const axios = require("axios");

cmd({
  pattern: "xnxx",
  desc: "XNXX Search and Download",
  category: "download",
  use: ".xnxx <query>",
  react: "🔞",
}, async (darknero, match, m, { text }) => {
  if (!text) {
    return match.reply("🔍 Enter a search term!\n\n*Example:* `.xnxx hot`");
  }

  try {
    // Step 1: Search video from API
    const search = await axios.get(
      "https://api.vreden.my.id/api/xnxxsearch?query=" + encodeURIComponent(text)
    );

    const result = search.data?.result?.[0];
    if (!result) {
      return match.reply("❌ No results found.");
    }

    // Step 2: Get download link
    const download = await axios.get(
      "https://api.vreden.my.id/api/xnxxdl?query=" + encodeURIComponent(result.link)
    );

    const video = download.data?.result;
    if (!video?.files?.high) {
      return match.reply("⚠️ Could not get download link.");
    }

    // Step 3: Send video thumbnail & info
    await darknero.sendMessage(
      m.chat,
      {
        image: { url: video.image },
        caption:
          `🔞 *${video.title}*\n\n🎞️ Duration: *${video.duration}s*\n\n` +
          `> *•ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ•*`
      },
      { quoted: m }
    );

    // Step 4: Send video
    await darknero.sendMessage(
      m.chat,
      {
        video: { url: video.files.high },
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
      },
      { quoted: m }
    );

  } catch (err) {
    console.error(err);
    match.reply("❌ Error occurred while fetching the video.");
  }
});


// 🔞 XNXX Search Command
cmd({
  pattern: "xnxxm",
  desc: "XNXXm Search and Download",
  category: "download",
  use: ".xnxxm <query>",
  react: "🔞",
}, async (darknero, match, m, { text }) => {
  if (!text) {
    return match.reply("🔍 Search term එකක් දාන්න!\n\n*උදා:* `.xnxx hot`");
  }

  try {
    // Step 1: Search
    const search = await axios.get(
      "https://api.vreden.my.id/api/xnxxsearch?query=" + encodeURIComponent(text)
    );

    const results = search.data?.result;
    if (!results || results.length === 0) {
      return match.reply("❌ Results නැහැ!");
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

    menu += `➡️ Reply with a *number (1-${Math.min(10, results.length)})* to download.`;

    // Save results for reply (cache per user)
    global.xnxxCache = global.xnxxCache || {};
    global.xnxxCache[m.sender] = results.slice(0, 10);

    await match.reply(menu);

  } catch (err) {
    console.error(err);
    match.reply("❌ Error occurred while fetching search results.");
  }
});

// 🔽 Number reply handler (Download Selected Video)
cmd({
  on: "text"
}, async (darknero, match, m, { body }) => {
  if (!global.xnxxCache) return;
  const videos = global.xnxxCache[m.sender];
  if (!videos) return;

  const choice = parseInt(body.trim());
  if (isNaN(choice) || choice < 1 || choice > videos.length) return;

  const selected = videos[choice - 1];

  try {
    // Step 3: Get download info
    const download = await axios.get(
      "https://api.vreden.my.id/api/xnxxdl?query=" + encodeURIComponent(selected.link)
    );

    const video = download.data?.result;
    if (!video?.files?.high) {
      return match.reply("⚠️ Could not get download link.");
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

    // Step 5: Send video
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
    delete global.xnxxCache[m.sender];

  } catch (err) {
    console.error(err);
    match.reply("❌ Error occurred while downloading video.");
  }
});
