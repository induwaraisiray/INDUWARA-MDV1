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
    react: "🎁",
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

/* ======================= GOOGLE IMAGE SEARCH ======================= */
cmd(
  {
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🏜️",
    desc: "Search and download Google images",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename,
  },
  async (conn, mek, m, { reply, args, from }) => {
    try {
      const query = args?.join(" ")?.trim();
      if (!query) {
        return reply("*🖼️ Please provide a search query\nExample: .img cute cats*");
      }

      await reply(`🔍 Searching images for "${query}"...`);

      const { data } = await axios.get(
        `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(
          query
        )}`
      );

      const results = data?.results;
      if (!data?.success || !Array.isArray(results) || results.length === 0) {
        return reply("*❌ No images found. Try different keywords*");
      }

      const selectedImages = [...results].sort(() => Math.random() - 0.5).slice(0, 5);

      for (const imageUrl of selectedImages) {
        if (!isHttpUrl(imageUrl)) continue;
        await conn.sendMessage(
          from,
          {
            image: { url: imageUrl },
            caption: `📷 Result for: ${query}\n> *© ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ*`,
          },
          { quoted: mek }
        );
        await new Promise((r) => setTimeout(r, 900));
      }
    } catch (error) {
      console.error("img:", error);
      reply(`❌ Error: ${error?.message || "Failed to fetch images"}`);
    }
  }
);

/* ======================= RINGTONE DOWNLOADER ======================= */
cmd(
  {
    pattern: "ringtone",
    alias: ["ringtones", "ring"],
    desc: "Get a random ringtone from the API.",
    react: "🎵",
    category: "fun",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, args }) => {
    try {
      const query = args?.join(" ")?.trim();
      if (!query) {
        return reply("Please provide a search query! Example: .ringtone Suna");
      }

      const { data } = await axios.get(
        `https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(
          query
        )}`
      );

      const arr = data?.result;
      if (!data?.status || !Array.isArray(arr) || arr.length === 0) {
        return reply(
          "No ringtones found for your query. Please try a different keyword."
        );
      }

      const pick = arr[Math.floor(Math.random() * arr.length)];
      if (!isHttpUrl(pick?.dl_link)) return reply("File not available.");

      await conn.sendMessage(
        from,
        {
          audio: {
            url: pick.dl_link,
            mimetype: "audio/mpeg",
            fileName: `${safe(pick.title, "ringtone")}.mp3`,
          },
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("ringtone:", error);
      reply(
        "Sorry, something went wrong while fetching the ringtone. Please try again later."
      );
    }
  }
);

/* ======================= TIKTOK DOWNLOADER ======================= */
cmd(
  {
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("Please provide a TikTok video link.");
      if (!/tiktok\.com/i.test(q)) return reply("Invalid TikTok link.");

      reply("*Downloading video, please wait...⬇️*");

      const { data } = await axios.get(
        `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(
          q
        )}`
      );

      if (!data?.status || !data?.data) return reply("Failed to fetch TikTok video.");

      const { title, like, comment, share, author, meta } = data.data || {};
      const media = Array.isArray(meta?.media) ? meta.media : [];
      const videoObj = media.find((v) => v?.type === "video");
      const videoUrl = videoObj?.org;

      if (!isHttpUrl(videoUrl)) return reply("No downloadable video found.");

      const caption =
        `🎵 *TikTok Video* 🎵\n\n` +
        `👤 *User:* ${safe(author?.nickname, "-")} (@${safe(author?.username, "-")})\n` +
        `📖 *Title:* ${safe(title, "-")}\n` +
        `👍 *Likes:* ${safe(like, 0)}\n💬 *Comments:* ${safe(comment, 0)}\n🔁 *Shares:* ${safe(share, 0)}`;

      await conn.sendMessage(
        from,
        {
          video: { url: videoUrl },
          caption,
          contextInfo: { mentionedJid: [m.sender] },
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("tiktok:", e);
      reply(`An error occurred: ${e?.message || e}`);
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
    react: "📝",
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

/* ======================= INSTAGRAM DOWNLOADER ======================= */
cmd(
  {
    pattern: "ig2",
    alias: ["insta2", "Instagram2"],
    desc: "To download Instagram videos.",
    react: "🎥",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q)) {
        return reply("❌ Please provide a valid Instagram link.");
      }

      await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      const { data } = await axios.get(
        `https://api.davidcyriltech.my.id/instagram?url=${encodeURIComponent(q)}`
      );

      // Some APIs return {status:200, downloadUrl} or {status:true, result:[...]}
      const downloadUrl =
        data?.downloadUrl ||
        (Array.isArray(data?.result) ? data.result[0]?.url : null);

      if (!(data?.status && isHttpUrl(downloadUrl))) {
        return reply(
          "⚠️ Failed to fetch Instagram video. Please check the link and try again."
        );
      }

      await conn.sendMessage(
        from,
        {
          video: { url: downloadUrl },
          mimetype: "video/mp4",
          caption: "📥 *Instagram Video Downloaded Successfully!*",
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("ig2:", error);
      reply("❌ An error occurred while processing your request. Please try again.");
    }
  }
);

/* ======================= TWITTER DOWNLOADER (X) ======================= */
cmd(
  {
    pattern: "twitter",
    alias: ["tweet", "twdl"],
    desc: "Download Twitter videos",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q)) {
        return conn.sendMessage(
          from,
          { text: "❌ Please provide a valid Twitter URL." },
          { quoted: mek }
        );
      }

      await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      const { data } = await axios.get(
        `https://www.dark-yasiya-api.site/download/twitter?url=${encodeURIComponent(
          q
        )}`
      );

      const result = data?.result || {};
      if (!data?.status || (!result?.video_sd && !result?.video_hd)) {
        return reply(
          "⚠️ Failed to retrieve Twitter video. Please check the link and try again."
        );
      }

      const { desc, thumb, video_sd, video_hd } = result;

      const caption =
        `╭━━━〔 *TWITTER DOWNLOADER* 〕━━━⊷\n` +
        `┃▸ *Description:* ${safe(desc, "No description")}\n` +
        `╰━━━⪼\n\n` +
        `📹 *Download Options:*\n` +
        `1️⃣  *SD Quality*\n` +
        `2️⃣  *HD Quality*\n` +
        `🎵 *Audio Options:*\n` +
        `3️⃣  *Audio*\n` +
        `4️⃣  *Document*\n` +
        `5️⃣  *Voice*\n\n` +
        `📌 *Reply with the number to download your choice.*`;

      const sentMsg = await conn.sendMessage(
        from,
        {
          image: isHttpUrl(thumb) ? { url: thumb } : undefined,
          caption,
        },
        { quoted: mek }
      );

      const messageID = sentMsg?.key?.id;
      if (!messageID) return; // safety

      // reply handler
      const handleTwitterReply = async (msgData) => {
        try {
          const receivedMsg = msgData?.messages?.[0];
          if (!receivedMsg?.message) return;

          const senderID = receivedMsg.key?.remoteJid;
          const ext = receivedMsg.message.extendedTextMessage;
          const text =
            receivedMsg.message.conversation || ext?.text || "".trim();

          const isReplyToBot = ext?.contextInfo?.stanzaId === messageID;
          if (!(isReplyToBot && senderID === from)) return;

          await conn.sendMessage(senderID, {
            react: { text: "⬇️", key: receivedMsg.key },
          });

          // stop listening right after handling one reply
          conn.ev.off("messages.upsert", handleTwitterReply);

          switch (text) {
            case "1":
              if (!isHttpUrl(video_sd)) return reply("SD not available.");
              await conn.sendMessage(
                senderID,
                {
                  video: { url: video_sd },
                  caption: "📥 *Downloaded in SD Quality*",
                },
                { quoted: receivedMsg }
              );
              break;
            case "2":
              if (!isHttpUrl(video_hd)) return reply("HD not available.");
              await conn.sendMessage(
                senderID,
                {
                  video: { url: video_hd },
                  caption: "📥 *Downloaded in HD Quality*",
                },
                { quoted: receivedMsg }
              );
              break;
            case "3":
              if (!isHttpUrl(video_sd)) return reply("Audio not available.");
              await conn.sendMessage(
                senderID,
                {
                  audio: { url: video_sd, mimetype: "audio/mpeg" },
                },
                { quoted: receivedMsg }
              );
              break;
            case "4":
              if (!isHttpUrl(video_sd)) return reply("Audio not available.");
              await conn.sendMessage(
                senderID,
                {
                  document: {
                    url: video_sd,
                    mimetype: "audio/mpeg",
                    fileName: "Twitter_Audio.mp3",
                  },
                  caption: "📥 *Audio Downloaded as Document*",
                },
                { quoted: receivedMsg }
              );
              break;
            case "5":
              if (!isHttpUrl(video_sd)) return reply("Voice not available.");
              await conn.sendMessage(
                senderID,
                {
                  audio: { url: video_sd, mimetype: "audio/mp4", ptt: true },
                },
                { quoted: receivedMsg }
              );
              break;
            default:
              reply("❌ Invalid option! Please reply with 1, 2, 3, 4, or 5.");
          }
        } catch (err) {
          console.error("twitter handle:", err);
        }
      };

      // Avoid multiple parallel listeners by using once + fallback timeout cleanup
      conn.ev.on("messages.upsert", handleTwitterReply);
      setTimeout(() => {
        try {
          conn.ev.off("messages.upsert", handleTwitterReply);
        } catch {}
      }, 120_000); // auto cleanup after 2 minutes
    } catch (error) {
      console.error("twitter:", error);
      reply("❌ An error occurred while processing your request. Please try again.");
    }
  }
);

/* ======================= MEDIAFIRE DOWNLOADER ======================= */
cmd(
  {
    pattern: "mediafire",
    alias: ["mfire"],
    desc: "To download MediaFire files.",
    react: "Ⓜ️",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!isHttpUrl(q)) {
        return reply("*❌ Please provide a valid MediaFire link.*");
      }

      await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

      const { data } = await axios.get(
        `https://supun-md-api-xmjh.vercel.app/api/mfire2?url=${encodeURIComponent(
          q
        )}`
      );

      const r = data?.result || {};
      if (!data?.status || !isHttpUrl(r?.dl_link)) {
        return reply(
          "*⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.*"
        );
      }

      const file_name = r.fileName || "mediafire_download";
      const mime_type = r.fileType || "application/octet-stream";

      await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

      const caption =
        `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n` +
        `┃▸ *File Name:* ${file_name}\n` +
        `┃▸ *File Type:* ${mime_type}\n` +
        `╰━━━⪼\n\n` +
        `📥 *Downloading your file...*`;

      await conn.sendMessage(
        from,
        {
          document: { url: r.dl_link, mimetype: mime_type, fileName: file_name },
          caption,
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("mediafire:", error);
      reply("❌ An error occurred while processing your request. Please try again.");
    }
  }
);

/* ======================= APK DOWNLOADER ======================= */
cmd(
  {
  pattern: "apk",
  desc: "Download APK from Aptoide.",
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
      return reply("❌ Please provide an app name to search.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      return reply("⚠️ No results found for the given app name.");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // Bytes → MB
    const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${app.name}
┃ 🏋 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 📅 *Updated On:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰━━━━━━━━━━━━━━━┈⊷
> *ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ*`;

    // Send App Icon + Details first
    await conn.sendMessage(from, {
      image: { url: app.icon },
      caption: caption
    }, { quoted: m });

    // Then send APK file
    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });
    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the APK. Please try again.");
  }
});
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
          caption: "*© Powered By JesterTechX*",
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
        `📥 *Downloading repository...*\n\n*Repository:* ${username}/${repo}\n*Filename:* ${fileName}\n\n> *ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ*`
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
              newsletterJid: "120363388390701164@newsletter",
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

/* ======================= XVideos DOWNLOADER ======================= */

cmd(
  {
    pattern: "xv",
    desc: "Xv Search & Download Menu",
    category: "download",
    use: ".xv <query>",
    react: "🔞",
  },
  async (darknero, match, m, { text }) => {
    if (!text) return match.reply("🔍 Enter a search term!\n\n*Example:* `.xv hot`");

    try {
      // Search API
      const searchRes = await axios.get(
        `https://api.vreden.my.id/api/xnxxsearch?query=${encodeURIComponent(text)}`
      );
      const results = searchRes.data?.result;
      if (!results || !results.length) {
        return match.reply("❌ No results found.");
      }

      const top10 = results.slice(0, 10);

      // Save results for later download selection
      xvSearchCache[m.sender] = top10;

      // Build menu text
      let menuText = `🔞 *Top XV Search Results for:* _${text}_\n\n`;
      top10.forEach((vid, index) => {
        menuText += `*${index + 1}.* ${vid.title}\n🕒 ${vid.duration}\n\n`;
      });
      menuText += `\n💬 *Reply with the number (1-${top10.length}) to download the video.*`;

      await darknero.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (err) {
      console.error(err);
      match.reply("❌ Error occurred while searching.");
    }
  }
);

// Handle number reply
cmd(
  {
    on: "text"
  },
  async (darknero, match, m, { text }) => {
    if (!xvSearchCache[m.sender]) return; // No active search

    const choice = parseInt(text.trim());
    const results = xvSearchCache[m.sender];

    if (isNaN(choice) || choice < 1 || choice > results.length) {
      return match.reply(`⚠️ Please enter a number between 1 and ${results.length}`);
    }

    const selectedVid = results[choice - 1];

    try {
      // Download API
      const dlRes = await axios.get(
        `https://api.vreden.my.id/api/xnxxdl?query=${encodeURIComponent(selectedVid.link)}`
      );
      const videoData = dlRes.data?.result?.files;
      if (!videoData?.high) {
        return match.reply("⚠️ Could not get download link.");
      }

      await darknero.sendMessage(m.chat, {
        video: { url: videoData.high },
        caption: `✅ *${selectedVid.title}*\n\n🕒 ${selectedVid.duration}`
      }, { quoted: m });

      delete xvSearchCache[m.sender]; // Clear cache after download

    } catch (err) {
      console.error(err);
      match.reply("❌ Error occurred while downloading.");
    }
  }
);
            
/* ======================= MOVIE INFO ======================= */
cmd(
  {
    pattern: 'movie',
    react: '🎬',
    category: 'download'
}, async (darknero, match, me, { text }) => {
    try {
        if (!text) return match.reply('Please provide a movie name to search')
        
        match.reply('*🔍 Searching for movies...*')
        
        const { data } = await axios.get(`https://sadiya-tech-apis.vercel.app/movie/sinhalasub-search?text=${encodeURIComponent(text)}&apikey=sadiya`)
        
        if (!data.status || !data.result || data.result.length === 0) {
            return match.reply('❌ No movies found for your search query')
        }
        
        global.movieResults = data.result;
        
        let resultMessage = '🎬 *Movie Search Results* 🎬\n\n';
        
        for (let i = 0; i < Math.min(data.result.length, 5); i++) {
            const movie = data.result[i];
            resultMessage += `*${i+1}.* ${movie.title}\n`;
        }
        
        resultMessage += '\n*Reply with the number to download the movie*';
        
        const message = await darknero.sendMessage(match.chat, { text: resultMessage }, { quoted: match });
        const messageId = message.key.id;
        
        darknero.nonSender(messageId, async (receivedMsg, receivedText, senderID) => {
            if (global.movieResults) {
                await darknero.sendMessage(senderID, {
                    react: { text: '⬇️', key: receivedMsg.key }
                });
                
                const choice = parseInt(receivedText);
                
                if (isNaN(choice) || choice < 1 || choice > Math.min(global.movieResults.length, 5)) {
                    return darknero.sendMessage(senderID, { 
                        text: "❌ Invalid option! Please reply with a number between 1 and " + 
                              Math.min(global.movieResults.length, 5)
                    }, { quoted: receivedMsg });
                }
                
                const selectedMovie = global.movieResults[choice - 1];
                
                if (!selectedMovie || !selectedMovie.link) {
                    return darknero.sendMessage(senderID, { 
                        text: "❌ Movie link not available" 
                    }, { quoted: receivedMsg });
                }
                
//                 await darknero.sendMessage(senderID, { 
//                     text: `📥 Getting download links for: ${selectedMovie.title}` 
//                 }, { quoted: receivedMsg });
                
                try {
                    const downloadData = await axios.get(`https://sadiya-tech-apis.vercel.app/movie/sinhalasub-dl?url=${encodeURIComponent(selectedMovie.link)}&apikey=sadiya`);
                    
                    if (!downloadData.data.status || !downloadData.data.result || !downloadData.data.result.pixeldrain_dl_link) {
                        return darknero.sendMessage(senderID, { 
                            text: "❌ Download links not available for this movie" 
                        }, { quoted: receivedMsg });
                    }
                    
                    const downloadLinks = downloadData.data.result.pixeldrain_dl_link;
                    const movieInfo = downloadData.data.result;
                    
                    const sd480Link = downloadLinks.find(link => link.quality === "HD 720p");
                    
                    if (!sd480Link) {
                        return darknero.sendMessage(senderID, { 
                            text: "❌ 720p quality not available for this movie" 
                        }, { quoted: receivedMsg });
                    }
                    
                    let movieInfoMessage = `🎬 *${movieInfo.title || selectedMovie.title}*\n\n`;
                    if (movieInfo.date) movieInfoMessage += `📅 *Date:* ${movieInfo.date}\n`;
                    if (movieInfo.tmdbRate) movieInfoMessage += `⭐ *TMDB Rate:* ${movieInfo.tmdbRate}/10\n`;
                    if (movieInfo.sinhalasubVote) movieInfoMessage += `🗳️ *SinhalaSub Vote:* ${movieInfo.sinhalasubVote}/10\n`;
                    if (movieInfo.director) movieInfoMessage += `🎭 *Director:* ${movieInfo.director}\n`;
                    if (movieInfo.subtitle_author) movieInfoMessage += `📝 *Subtitle by:* ${movieInfo.subtitle_author}\n`;
                    if (movieInfo.category && movieInfo.category.length > 0) {
                        movieInfoMessage += `🏷️ *Category:* ${movieInfo.category.join(', ')}\n`;
                    }
                    
                    movieInfoMessage += `\n📱 *Quality:* ${sd480Link.quality}\n`;
                    movieInfoMessage += `📦 *Size:* ${sd480Link.size}\n\n`;
                    movieInfoMessage += `⬇️ *Downloading...*`;
                    
                    if (movieInfo.image) {
                        try {
                            await darknero.sendMessage(senderID, { 
                                image: { url: movieInfo.image },
                                caption: movieInfoMessage
                            }, { quoted: receivedMsg });
                        } catch (imgError) {
                            console.log('Error sending image:', imgError);
                            await darknero.sendMessage(senderID, { 
                                text: movieInfoMessage 
                            }, { quoted: receivedMsg });
                        }
                    } else {
                        await darknero.sendMessage(senderID, { 
                            text: movieInfoMessage 
                        }, { quoted: receivedMsg });
                    }
                    
                    await darknero.sendMessage(senderID, { 
                        document: { url: sd480Link.link },
                        fileName: `${movieInfo.title || selectedMovie.title} - 720p.mp4`,
                        mimetype: 'video/mp4'
                    }, { quoted: receivedMsg });
                    
                    delete global.movieResults;
                    
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    return darknero.sendMessage(senderID, { 
                        text: "❌ Error occurred while getting download links" 
                    }, { quoted: receivedMsg });
                }
            }
        });
        
    } catch (error) {
        console.error(error)
        match.reply('❌ Error occurred while searching movies')
    }
});


