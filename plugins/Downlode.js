"use strict";

/**
 * Cleaned & fixed command pack
 * - Consistent error handling + timeouts
 * - Safer null/shape checks
 * - Event listener leaks prevented
 * - GitHub HEAD check via axios.head (no fetch dependency issues)
 * - Mixed quoted objects fixed (mek vs m)
 */

const axios = require("axios").create({
  timeout: 25_000, // prevent hanging
  maxRedirects: 5,
});
const { cmd } = require("../command");
const config = require("../config");
const { fetchJson } = require("../lib/functions");

const api = `https://nethu-api-ashy.vercel.app`;
let session = Object.create(null); // safer empty object

// Small helpers
const isHttpUrl = (u) => typeof u === "string" && /^https?:\/\//i.test(u || "");
const safe = (v, d = null) => (v === undefined || v === null ? d : v);

/* ======================= FACEBOOK DOWNLOADER ======================= */
cmd(
  {
    pattern: "facebook",
    react: "🎥",
    alias: ["fbb", "fbvideo", "fb"],
    desc: "Download videos from Facebook",
    category: "download",
    use: ".facebook <facebook_url>",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q)) return reply("🚩 Please give me a valid Facebook URL.");

      const fb = await fetchJson(
        `${api}/download/fbdown?url=${encodeURIComponent(q)}`
      ).catch(() => null);

      const res = fb?.result || {};
      const sd = res.sd;
      const hd = res.hd;
      const thumb = res.thumb;

      if (!sd && !hd) return reply("I couldn't find anything :(");

      const caption = `*ɪɴᴅᴜᴡᴀʀᴀ ᴍᴅ ʙᴏᴛ*\n\n📝 ᴛɪᴛʟᴇ : Facebook video\n🔗 ᴜʀʟ : ${q}`;

      if (thumb && isHttpUrl(thumb)) {
        await conn.sendMessage(
          from,
          {
            image: { url: thumb },
            caption,
          },
          { quoted: mek }
        );
      }

      if (sd && isHttpUrl(sd)) {
        await conn.sendMessage(
          from,
          {
            video: { url: sd },
            mimetype: "video/mp4",
            caption: `*SD-Quality*`,
          },
          { quoted: mek }
        );
      }

      if (hd && isHttpUrl(hd)) {
        await conn.sendMessage(
          from,
          {
            video: { url: hd },
            mimetype: "video/mp4",
            caption: `*HD-Quality*`,
          },
          { quoted: mek }
        );
      }
    } catch (err) {
      console.error("facebook:", err);
      reply("*ERROR*");
    }
  }
);


cmd(
  {
    pattern: "tiktok",
    react: "📱",
    desc: "Download TikTok Video (No Watermark)",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      // Check if a URL is provided
      if (!q) return reply("Ex: `.tiktok https://vm.tiktok.com/XYZ123`");

      const tiktokUrl = q.trim();

      // Basic TikTok URL validation
      if (!tiktokUrl.includes("tiktok.com")) {
        return reply("❌ Please provide a valid TikTok URL.");
      }

      // API configuration using tikwm.com
      const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;

      // Notify user of progress
      const processingMsg = await reply("♻️ *Processing TikTok Video Download...*");

      // Handle reactions safely
      try {
        if (processingMsg && processingMsg.key) {
          await robin.sendMessage(from, { react: { text: "⏳", key: processingMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

      // Fetch video info from API
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Check if the response is OK
      if (!response.ok) {
        // Try to react with error emoji
        try {
          if (processingMsg && processingMsg.key) {
            await robin.sendMessage(from, { react: { text: "❌", key: processingMsg.key } });
          }
        } catch (reactionError) {
          console.log("Reaction error:", reactionError);
        }
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result = await response.json();

      // Detailed response validation
      if (result.code !== 0 || !result.data || !result.data.play) {
        // Try to react with error emoji
        try {
          if (processingMsg && processingMsg.key) {
            await robin.sendMessage(from, { react: { text: "❌", key: processingMsg.key } });
          }
        } catch (reactionError) {
          console.log("Reaction error:", reactionError);
        }
        console.log("API Response:", result); // Log for debugging
        return reply("❌ Error: Couldn't fetch video. The URL might be invalid or the API is unavailable.");
      }

      // Extract video details
      const videoUrl = result.data.play; // Clean version (no watermark)
      const title = result.data.title || "TikTok Video";
      const author = result.data.author?.nickname || "Unknown";
      const duration = result.data.duration || "Unknown";
      const diggCount = result.data.digg_count || 0;
      const commentCount = result.data.comment_count || 0;
      const shareCount = result.data.share_count || 0;

      // Create a formatted caption
      const caption = `*🪄 VILON-X-MD TIKTOK DOWNLOADER 🪄*\n\n` +
        `🎥 *Title*: ${title}\n` +
        `👤 *Author*: ${author}\n` +
        `⏱️ *Duration*: ${duration}s\n` +
        `❤️ *Likes*: ${diggCount.toLocaleString()}\n` +
        `💬 *Comments*: ${commentCount.toLocaleString()}\n` +
        `🔁 *Shares*: ${shareCount.toLocaleString()}\n` +
        `🔗 *URL*: ${tiktokUrl}\n\n` +
        `> *Made with Vilon-x-MD*`;

      // Try to change reaction to success on the processing message
      try {
        if (processingMsg && processingMsg.key) {
          await robin.sendMessage(from, { react: { text: "✅", key: processingMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

      // Send the video with the caption
      const videoMsg = await robin.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption: caption,
          mimetype: 'video/mp4'
        },
        { quoted: mek }
      );

      // Try to add reaction to the video message
      try {
        if (videoMsg && videoMsg.key) {
          await robin.sendMessage(from, { react: { text: "📱", key: videoMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

    } catch (e) {
      console.error("Error in TikTok download:", e); // Log full error for debugging
      return reply(`❌ Error: ${e.message || "Something went wrong. Please try again later."}`);
    }
  }
);

// Command to download TikTok video with watermark
cmd(
  {
    pattern: "tiktokwm",
    react: "💦",
    desc: "Download TikTok Video (With Watermark)",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      // Check if a URL is provided
      if (!q) return reply("Ex: `.tiktokwm https://vm.tiktok.com/XYZ123`");

      const tiktokUrl = q.trim();

      // Basic TikTok URL validation
      if (!tiktokUrl.includes("tiktok.com")) {
        return reply("❌ Please provide a valid TikTok URL.");
      }

      // API configuration using tikwm.com
      const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;

      // Notify user of progress
      const processingMsg = await reply("♻️ *Processing Watermarked Video Download...*");

      // Fetch video info from API
      const response = await fetch(API_URL);
      const result = await response.json();

      // Check if the response is valid
      if (result.code !== 0 || !result.data || !result.data.wmplay) {
        return reply("❌ Error: Couldn't fetch watermarked video.");
      }

      // Send the watermarked video
      const wmVideoMsg = await robin.sendMessage(
        from,
        {
          video: { url: result.data.wmplay },
          caption: `*🫦 TikTok Watermarked Video 🫦*\n\n🎥 *Author*: ${result.data.author?.nickname || "Unknown"}\n\n*Made with Rasiya-MD🫦*`,
          mimetype: 'video/mp4'
        },
        { quoted: mek }
      );

      // Try to add reaction to the video message
      try {
        if (wmVideoMsg && wmVideoMsg.key) {
          await robin.sendMessage(from, { react: { text: "💦", key: wmVideoMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

    } catch (e) {
      console.error("Error in TikTok watermarked download:", e);
      return reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

// Command to download TikTok audio
cmd(
  {
    pattern: "tiktokaudio",
    react: "🎵",
    desc: "Download TikTok Audio",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, q, reply }) => {
    try {
      // Check if a URL is provided
      if (!q) return reply("Ex: `.tiktokaudio https://vm.tiktok.com/XYZ123`");

      const tiktokUrl = q.trim();

      // Basic TikTok URL validation
      if (!tiktokUrl.includes("tiktok.com")) {
        return reply("❌ Please provide a valid TikTok URL.");
      }

      // API configuration using tikwm.com
      const API_URL = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;

      // Notify user of progress
      const processingMsg = await reply("🎵 *Processing Audio Download...*");

      // Fetch video info from API
      const response = await fetch(API_URL);
      const result = await response.json();

      // Check if the response is valid
      if (result.code !== 0 || !result.data || !result.data.music) {
        return reply("❌ Error: Couldn't fetch audio from this TikTok.");
      }

      const audioUrl = result.data.music;
      const title = result.data.music_info?.title || "TikTok Audio";
      const author = result.data.music_info?.author || result.data.author?.nickname || "Unknown";

      // Send the audio
      const audioMsg = await robin.sendMessage(
        from,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mp4',
          fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
          caption: `*🎵 TikTok Audio 🎵*\n\n🎵 *Title*: ${title}\n👤 *Artist*: ${author}\n\n> *Made with Vilon-x-md*`
        },
        { quoted: mek }
      );

      // Try to add reaction to the audio message
      try {
        if (audioMsg && audioMsg.key) {
          await robin.sendMessage(from, { react: { text: "🎵", key: audioMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }

    } catch (e) {
      console.error("Error in TikTok audio download:", e);
      return reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

cmd(
  {
    pattern: "tikhelp",
    react: "ℹ️",
    desc: "Help for TikTok Downloader",
    category: "download",
    filename: __filename,
  },
  async (robin, mek, m, { from, reply }) => {
    try {
      const helpText = `*♻️ Rasiya bot TikTok Downloader Help ♻️*

*Available Commands:*

✅English✅

• .tiktok [url] - Download TikTok video without watermark
• .tiktokwm [url] - Download TikTok video with watermark
• .tiktokaudio [url] - Download TikTok audio only
• .tikhelp - Show this help message

✅සිංහලෙන්✅

• .tiktok [url] - දිය සලකුණක් නොමැතිව TikTok වීඩියෝව බාගන්න
• .tiktokwm [url] - දිය සලකුණක් සහිත TikTok වීඩියෝව බාගන්න
• .tiktoaudio [url] - TikTok ශ්‍රව්‍ය පමණක් බාගන්න
• .tikhelp - මෙම උදව් පණිවිඩය පෙන්වන්න

*Example:*
.tiktok https://vm.tiktok.com/XYZABC12

*Notes:*
- Make sure to use valid TikTok URLs
- Videos may take time to download depending on size
- Some TikTok videos may be protected and can't be downloaded

*සටහන්:*
- වලංගු TikTok URL භාවිතා කිරීමට වග බලා ගන්න
- ප්‍රමාණය අනුව වීඩියෝ බාගත කිරීමට කාලය ගත විය හැක
- සමහර TikTok වීඩියෝ ආරක්ෂිත විය හැකි අතර බාගත කළ නොහැක

> *Made BY Rasiya-MD by rasindu ❤️ *`;

      // Send help message with image
      const helpMsg = await robin.sendMessage(from, {
        image: { url: "https://github.com/chathurahansaka1/help/blob/main/src/f52f8647-b0fd-4f66-9cfa-00087fc06f9b.jpg?raw=true" },
        caption: helpText,
      });

      // Try to add reaction to the help message
      try {
        if (helpMsg && helpMsg.key) {
          await robin.sendMessage(from, { react: { text: "ℹ️", key: helpMsg.key } });
        }
      } catch (reactionError) {
        console.log("Reaction error:", reactionError);
      }
    } catch (e) {
      console.error("Error in TikTok help command:", e);
      return reply(`❌ Error: ${e.message || "Something went wrong."}`);
    }
  }
);

/* ======================= YOUTUBE POST DOWNLOADER ======================= */
cmd(
  {
    pattern: "ytpost",
    alias: ["ytcommunity", "ytc"],
    desc: "Download a YouTube community post",
    category: "downloader",
    react: "🎥",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q))
        return reply(
          "Please provide a YouTube community post URL.\nExample: `.ytpost <url>`"
        );

      const { data } = await axios.get(
        `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(q)}`
      );

      if (!data?.status || !data?.data) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        return reply("Failed to fetch the community post. Please check the URL.");
      }

      const post = data.data;
      let caption =
        `📢 *YouTube Community Post* 📢\n\n` + `📜 *Content:* ${safe(post?.content, "-")}`;

      const imgs = Array.isArray(post?.images) ? post.images : [];
      if (imgs.length > 0) {
        for (const img of imgs) {
          if (!isHttpUrl(img)) continue;
          await conn.sendMessage(
            from,
            { image: { url: img }, caption },
            { quoted: mek }
          );
          caption = ""; // only once
        }
      } else {
        await conn.sendMessage(from, { text: caption }, { quoted: mek });
      }

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
      console.error("ytpost:", e);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      reply("An error occurred while fetching the YouTube community post.");
    }
  }
);


/* ======================= APK DOWNLOADER ======================= */
cmd(
  {
    pattern: "apk",
    desc: "Download APK from Aptoide.",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("❌ Please provide an app name to search.");

      await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(
        q
      )}/limit=1`;
      const { data } = await axios.get(apiUrl);

      const list = data?.datalist?.list;
      if (!Array.isArray(list) || list.length === 0) {
        return reply("*⚠️ No results found for the given app name.*");
      }

      const app = list[0];
      const appSize = app?.size ? (app.size / 1048576).toFixed(2) : "N/A";
      const apkUrl = app?.file?.path_alt || app?.file?.path;
      const appIcon = app?.icon; // <-- App Icon URL

      if (!isHttpUrl(apkUrl)) return reply("⚠️ APK file not available.");

      const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${safe(app?.name, "-")}
┃ 🏋️ *Size:* ${appSize} MB
┃ 📦 *Package:* ${safe(app?.package, "-")}
┃ 📅 *Updated On:* ${safe(app?.updated, "-")}
┃ 👨‍💻 *Developer:* ${safe(app?.developer?.name, "-")}
╰━━━━━━━━━━━━━━━┈⊷
> *ᴩᴏᴡᴇʀᴅ ʙʏ ᴠɪʟᴏɴ-x-ᴍᴅ*`;

      await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

      // First send app icon with caption
      if (isHttpUrl(appIcon)) {
        await conn.sendMessage(
          from,
          {
            image: { url: appIcon },
            caption,
          },
          { quoted: mek }
        );
      } else {
        await reply(caption);
      }

      // Then send apk file
      await conn.sendMessage(
        from,
        {
          document: {
            url: apkUrl,
            fileName: `${safe(app?.name, "app")}.apk`,
            mimetype: "application/vnd.android.package-archive",
          },
        },
        { quoted: mek }
      );

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (error) {
      console.error("apk:", error);
      reply("❌ An error occurred while fetching the APK. Please try again.");
    }
  }
);
/* ======================= GOOGLE DRIVE DOWNLOADER ======================= */
cmd(
  {
    pattern: "gdrive",
    desc: "Download Google Drive files.",
    react: "🌐",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q)) {
        return reply("*❌ Please provide a valid Google Drive link.*");
      }

      await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

      const { data } = await axios.get(
        `https://api.fgmods.xyz/api/downloader/gdrive?url=${encodeURIComponent(
          q
        )}&apikey=mnp3grlZ`
      );

      const dl = data?.result;
      if (!isHttpUrl(dl?.downloadUrl)) {
        return reply("*⚠️ No download URL found. Please check the link and try again.*");
      }

      await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

      await conn.sendMessage(
        from,
        {
          document: {
            url: dl.downloadUrl,
            mimetype: safe(dl.mimetype, "application/octet-stream"),
            fileName: safe(dl.fileName, "gdrive_file"),
          },
          caption: "*ᴩᴏᴡᴇʀᴅ ʙʏ ᴠɪʟᴏɴ-x-ᴍᴅ*",
        },
        { quoted: mek }
      );

      await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (error) {
      console.error("gdrive:", error);
      reply("❌ An error occurred while fetching the Google Drive file. Please try again.");
    }
  }
);

/* ======================= GITHUB DOWNLOADER ======================= */
cmd(
  {
    pattern: "gitclone",
    alias: ["git", "getrepo"],
    desc: "Download GitHub repository as a zip file.",
    react: "📦",
    category: "downloader",
    filename: __filename,
  },
  async (conn, mek, m, { from, args, reply }) => {
    try {
      const link = args?.[0];
      if (!link) {
        return reply(
          "❌ Where is the GitHub link?\n\nExample:\n.gitclone https://github.com/username/repository"
        );
      }

      if (!/^https?:\/\/github\.com\/.+/i.test(link)) {
        return reply("⚠️ Invalid GitHub link. Please provide a valid GitHub repository URL.");
      }

      const regex = /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git|\/|$)/i;
      const match = link.match(regex);
      if (!match) throw new Error("Invalid GitHub URL.");

      const [, username, repo] = match;
      const zipUrl = `https://api.github.com/repos/${username}/${repo}/zipball`;

      // Use axios.head to avoid Node fetch dependency issues
      const head = await axios.head(zipUrl).catch((e) => ({ headers: {} }));
      const cd =
        head?.headers?.["content-disposition"] ||
        head?.headers?.["Content-Disposition"];
      const fileName =
        (cd && (cd.match(/filename="?([^"]+)"?/) || [])[1]) || `${repo}.zip`;

      reply(
        `📥 *Downloading repository...*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}\n\n> *ᴩᴏᴡᴇʀᴅ ʙʏ ᴠɪʟᴏɴ-x-ᴍᴅ*`
      );

      await conn.sendMessage(
        from,
        {
          document: { url: zipUrl },
          fileName,
          mimetype: "application/zip",
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363388320701164@newsletter",
              newsletterName: "induwara",
              serverMessageId: 143,
            },
          },
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("gitclone:", error);
      reply("*❌ Failed to download the repository. Please try again later.*");
    }
  }
);



