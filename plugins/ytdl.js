const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios'); // ❗ Missing import fixed

// 🎧 SONG COMMAND
cmd(
  {
    pattern: "song",
    react: "🎧",
    category: "download",
    desc: "Download a song from YouTube",
  },
  async (darknero, match, me, { text, prefix }) => {
    if (!text) {
      return match.reply(
        `🔍 Please provide a query.\n\nExample: ${prefix}song despacito`
      );
    }

    try {
      // 🔎 Search YouTube
      const search = await yts(text);
      if (!search?.all?.length) {
        return match.reply("❌ No results found on YouTube.");
      }
      const info = search.all[0];

      // ⏳ Inform user
      await darknero.sendMessage(
        match.chat,
        { text: `⏳ Please wait... *${info.title}*` },
        { quoted: match }
      );

      // 🌐 API request to fetch download link
      const { data } = await axios.get(
        "https://api.davidcybertech.my.id/play?q=" + encodeURIComponent(text)
      );

      if (!data?.status || !data?.result?.download_url) {
        return match.reply("❌ Failed to fetch song download link.");
      }

      const song = data.result;

      // 📩 Send song info
      await darknero.sendMessage(
        match.chat,
        {
          image: { url: info.thumbnail },
          caption: `
🎶 ɪɴᴅᴜᴡᴀʀᴀ-ᴍᴅ ᴍᴜsɪᴄ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ 🎶
────────────────►►
📜 Title: ${info.title}
✍️ Author: ${info.author.name}
👀 Views: ${info.views}
⏳ Uploaded: ${info.ago}
🔗 URL: ${info.url}
────────────────►►
> © ᴍᴀᴅᴇ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ
          `,
        },
        { quoted: match }
      );

      // 🎵 Send audio file
      await darknero.sendMessage(
        match.chat,
        {
          audio: { url: song.download_url },
          mimetype: "audio/mpeg",
          fileName: `${info.title}.mp3`,
        },
        { quoted: match }
      );
    } catch (err) {
      console.error("SONG ERROR:", err.message || err);
      return match.reply("⚠️ Error fetching song. Please try again later.");
    }
  }
);

// 🎬 VIDEO COMMAND
cmd(
  {
    pattern: "video",
    desc: "Download video from YouTube by title",
    category: "download",
    react: "🎬",
  },
  async (darknero, match, me, { text, prefix }) => {
    if (!text) {
      return match.reply(
        `❗ Please enter a video title.\n\nExample: ${prefix}video Faded`
      );
    }

    try {
      await match.reply("🔎 Searching, please wait...");

      // 🔎 Search YouTube
      const search = await yts(text);
      if (!search?.videos?.length) {
        return match.reply("❌ No video results found.");
      }

      const video = search.videos[0];
      const ytUrl = video.url;

      // 🌐 API request for MP4
      const api = `https://api.davidcybertech.my.id/youtube/mp4?url=${encodeURIComponent(
        ytUrl
      )}`;
      const { data } = await axios.get(api);

      if (!data?.status || !data?.result?.url) {
        return match.reply("❌ Failed to fetch video download link.");
      }

      const { url: downloadLink } = data.result;

      // 🎥 Send video
      await darknero.sendMessage(
        match.chat,
        {
          video: { url: downloadLink },
          caption: `✅ Downloaded successfully!`,
          mimetype: "video/mp4",
        },
        { quoted: match }
      );
    } catch (err) {
      console.error("VIDEO ERROR:", err.message || err);
      return match.reply("⚠️ Error fetching video. Please try again later.");
    }
  }
);
