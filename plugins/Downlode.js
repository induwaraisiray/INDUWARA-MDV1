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

/* ======================= GOOGLE IMAGE SEARCH ======================= */
cmd(
  {
    pattern: "img",
    alias: ["image", "googleimage", "searchimg"],
    react: "🦋",
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
            caption: `📷 Result for: ${query}\n> © Powered by JesterTechX`,
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

      if (!isHttpUrl(apkUrl)) return reply("⚠️ APK file not available.");

      const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${safe(app?.name, "-")}
┃ 🏋️ *Size:* ${appSize} MB
┃ 📦 *Package:* ${safe(app?.package, "-")}
┃ 📅 *Updated On:* ${safe(app?.updated, "-")}
┃ 👨‍💻 *Developer:* ${safe(app?.developer?.name, "-")}
╰━━━━━━━━━━━━━━━┈⊷
🔗 *Powered By JesterX-AI*`;

      await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

      await conn.sendMessage(
        from,
        {
          document: {
            url: apkUrl,
            fileName: `${safe(app?.name, "app")}.apk`,
            mimetype: "application/vnd.android.package-archive",
          },
          caption,
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

/* ======================= XVideos DOWNLOADER ======================= */
cmd(
  {
    pattern: "xv",
    alias: ["xvideo"],
    use: ".xv <query>",
    react: "🔞",
    desc: "xvideo download",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("⭕ *Please Provide Search Terms.*");

      const res = await fetchJson(
        `https://raganork-network.vercel.app/api/xvideos/search?query=${encodeURIComponent(
          q
        )}`
      ).catch(() => null);

      const results = res?.result;
      if (!Array.isArray(results) || results.length === 0)
        return reply("⭕ *I Couldn't Find Anything 🙄*");

      const data = results.slice(0, 10);

      let message = `*🔞 INDUWARA MD XVIDEO DOWNLOADER 🔞*\n\n`;
      data.forEach((v, idx) => {
        message += `${idx + 1}. *${safe(v?.title, "-")}*\n\n`;
      });
      message += `> ⚜️ _𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝙳_ *- :* *_INDUWARA-MD_ ᵀᴹ*\n\n`;

      const sentMessage = await conn.sendMessage(
        from,
        {
          image: { url: `https://i.ibb.co/ntvzPr8/s-Wuxk4b-KHr.jpg` },
          caption: message,
        },
        { quoted: mek }
      );

      session[from] = {
        searchResults: data,
        messageId: sentMessage?.key?.id,
      };

      const handleUserReply = async (msgData) => {
        try {
          const userMessage = msgData?.messages?.[0];
          if (!userMessage?.message || userMessage.key?.remoteJid !== from) return;

          const userSession = session[from];
          if (!userSession) return;

          const ext = userMessage.message.extendedTextMessage;
          const userReplyText =
            ext?.text?.trim() || userMessage.message.conversation?.trim() || "";
          const isReplyToBot = ext?.contextInfo?.stanzaId === userSession.messageId;

          if (!isReplyToBot) return;

          const videoIndexes = userReplyText
            .split(",")
            .map((x) => parseInt(x.trim(), 10) - 1)
            .filter((n) => Number.isInteger(n));

          if (videoIndexes.length === 0) {
            return reply("⭕ *Please Enter Valid Numbers From The List.*");
          }

          for (let index of videoIndexes) {
            if (index < 0 || index >= userSession.searchResults.length) {
              return reply("⭕ *Please Enter Valid Numbers From The List.*");
            }
          }

          for (let index of videoIndexes) {
            const selectedVideo = userSession.searchResults[index];
            try {
              const dl = await fetchJson(
                `https://raganork-network.vercel.app/api/xvideos/download?url=${encodeURIComponent(
                  selectedVideo.url
                )}`
              ).catch(() => null);

              const videoUrl = dl?.url || dl?.result?.url;
              if (!isHttpUrl(videoUrl)) {
                await reply(
                  `⭕ *Failed To Fetch Video* for "${safe(selectedVideo.title, "-")}".`
                );
                continue;
              }

              await conn.sendMessage(
                from,
                {
                  video: { url: videoUrl },
                  caption: `${safe(
                    selectedVideo.title,
                    "-"
                  )}\n\n> ⚜️ _𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝙳_ *- :* *_INDUWARA-MD_ ᵀᴹ*`,
                },
                { quoted: userMessage }
              );
            } catch (err) {
              console.error("xv download:", err);
              await reply(
                `⭕ *An Error Occurred While Downloading "${safe(
                  selectedVideo.title,
                  "-"
                )}".*`
              );
            }
          }

          delete session[from];
        } catch (err) {
          console.error("xv handler:", err);
        }
      };

      conn.ev.once("messages.upsert", handleUserReply);
      // Auto-clean session after 2 minutes
      setTimeout(() => {
        delete session[from];
      }, 120_000);
    } catch (error) {
      console.error("xv:", error);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      reply("⭕ *Error Occurred During The Process!*");
    }
  }
);

/* ======================= MOVIE INFO ======================= */
cmd(
  {
    pattern: "movie",
    desc: "Fetch detailed information about a movie.",
    category: "utility",
    react: "🎬",
    filename: __filename,
  },
  async (conn, mek, m, { from, reply, sender, args }) => {
    try {
      const movieName =
        (Array.isArray(args) && args.length > 0 ? args.join(" ") : "") ||
        (m?.text || "").replace(/^[.\#\$\!]?movie\s?/i, "").trim();

      if (!movieName) {
        return reply("📽️ Please provide the name of the movie.\nExample: .movie Iron Man");
      }

      const { data } = await axios.get(
        `https://apis.davidcyriltech.my.id/imdb?query=${encodeURIComponent(
          movieName
        )}`
      );

      const movie = data?.movie;
      if (!data?.status || !movie) {
        return reply("*🚫 Movie not found. Please check the name and try again.*");
      }

      const rtRating =
        (Array.isArray(movie?.ratings)
          ? movie.ratings.find((r) =>
              /Rotten Tomatoes/i.test(String(r?.source || ""))
            )?.value
          : null) || "N/A";

      const poster =
        movie?.poster && movie.poster !== "N/A"
          ? movie.poster
          : "https://files.catbox.moe/3y5w8z.jpg";

      const dec = `
🎬 *${safe(movie.title, "-")}* (${safe(movie.year, "-")}) ${safe(
        movie.rated,
        ""
      )}

⭐ *IMDb:* ${safe(movie.imdbRating, "N/A")} | 🍅 *Rotten Tomatoes:* ${rtRating} | 💰 *Box Office:* ${safe(
        movie.boxoffice,
        "N/A"
      )}

📅 *Released:* ${movie.released ? new Date(movie.released).toLocaleDateString() : "N/A"}
⏳ *Runtime:* ${safe(movie.runtime, "N/A")}
🎭 *Genre:* ${safe(movie.genres, "N/A")}

📝 *Plot:* ${safe(movie.plot, "N/A")}

🎥 *Director:* ${safe(movie.director, "N/A")}
✍️ *Writer:* ${safe(movie.writer, "N/A")}
🌟 *Actors:* ${safe(movie.actors, "N/A")}

🌍 *Country:* ${safe(movie.country, "N/A")}
🗣️ *Language:* ${safe(movie.languages, "N/A")}
🏆 *Awards:* ${safe(movie.awards, "None")}

[View on IMDb](${safe(movie.imdbUrl, "https://imdb.com")})
`;

      await conn.sendMessage(
        from,
        {
          image: { url: poster },
          caption: dec,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363388320701164@newsletter",
              newsletterName: "JesterTechX",
              serverMessageId: 143,
            },
          },
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("movie:", e);
      reply(`❌ Error: ${e?.message || e}`);
    }
  }
);

/* ======================= PINTEREST DOWNLOADER ======================= */
cmd(
  {
    pattern: "pindl",
    alias: ["pinterestdl", "pin", "pins", "pindownload"],
    desc: "Download media from Pinterest",
    category: "download",
    filename: __filename,
  },
  async (conn, mek, m, { args, from, reply }) => {
    try {
      const pinterestUrl = args?.[0];
      if (!isHttpUrl(pinterestUrl)) {
        return reply("❎ Please provide the Pinterest URL to download from.");
      }

      const { data } = await axios.get(
        `https://api.giftedtech.web.id/api/download/pinterestdl?apikey=gifted&url=${encodeURIComponent(
          pinterestUrl
        )}`
      );

      if (!data?.success) {
        return reply("❎ Failed to fetch data from Pinterest.");
      }

      const media = Array.isArray(data?.result?.media) ? data.result.media : [];
      if (media.length === 0) return reply("❎ No media found at this URL.");

      const title = data?.result?.title || "No title available";

      const bestVideo =
        media.find((i) => /720p/i.test(String(i?.type || ""))) || media.find((i) => /video/i.test(String(i?.type || "")));
      const imageItem = media.find((i) => /thumbnail|image/i.test(String(i?.type || ""))) || media[0];

      const desc = `╭━━━〔 *INDUWARA-MD* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *PINS DOWNLOADER*
┃▸└───────────···๏
╰────────────────┈⊷
╭━━❐━⪼
┇๏ *Title* - ${title}
┇๏ *Media Type* - ${safe(media[0]?.type, "N/A")}
╰━━❑━⪼
> *© ᴩᴏᴡᴇʀᴅ ʙʏ ɪɴᴅᴜᴡᴀʀᴀ 〽️ᴅ`;

      if (bestVideo?.download_url && isHttpUrl(bestVideo.download_url)) {
        await conn.sendMessage(
          from,
          { video: { url: bestVideo.download_url }, caption: desc },
          { quoted: mek }
        );
      } else if (imageItem?.download_url && isHttpUrl(imageItem.download_url)) {
        await conn.sendMessage(
          from,
          { image: { url: imageItem.download_url }, caption: desc },
          { quoted: mek }
        );
      } else {
        return reply("❎ Media URL not available.");
      }
    } catch (e) {
      console.error("pindl:", e);
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      reply("❎ An error occurred while processing your request.");
    }
  }
);
