const config = require("../config");
const { cmd } = require("../command");
const { ytsearch } = require("@dark-yasiya/yt-dl.js");

// 🎦 YouTube Video Downloader
cmd({
    pattern: "video1",
    alias: ["video"],
    react: "🎦",
    desc: "Download YouTube video",
    category: "main",
    use: ".mp4 < Yt url or Name >",
    filename: __filename
}, async (conn, msg, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return await reply("Please provide a YouTube URL or song name.");

        const searchResult = await ytsearch(q);
        if (searchResult.results.length < 1) return reply("No results found!");

        let video = searchResult.results[0];
        let apiUrl = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(video.url);

        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.status !== 200 || !data.success || !data.result.download_url)
            return reply("Failed to fetch the video. Please try again later.");

        let caption = `*HASHAN-𝗠𝗗 𝗩𝗜𝗗𝗘𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 ✨️*\n\n`
            + `┃ 🎶 *Title:* ${video.title}\n`
            + `┃ 👤 *Author:* ${video.author.name}\n`
            + `┃ ⏳ *Duration:* ${video.timestamp}\n`
            + `┃ 👀 *Views:* ${video.views}\n`
            + `┃ 🔗 *Link:* ${video.url}\n\n`
            + `*Please Reply with ( 1 , 2 ) ❤️\n\n`
            + `1️ | 📄 Document (no preview)\n`
            + `2️ | ▶️ Normal Video (with preview)\n\n`
            + `> *© 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 HASHAN-𝗠𝗗*`;

        let contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363395674230271@newsletter",
                newsletterName: "HASHAN-𝗠𝗗-V1",
                serverMessageId: 143
            }
        };

        const sentMsg = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption,
            contextInfo
        }, { quoted: msg });

        // Handle user reply (1 or 2)
        conn.ev.on("messages.upsert", async (update) => {
            const userMsg = update.messages[0];
            if (!userMsg.message || !userMsg.message.extendedTextMessage) return;

            const userReply = userMsg.message.extendedTextMessage.text.trim();
            if (userMsg.message.extendedTextMessage.contextInfo &&
                userMsg.message.extendedTextMessage.contextInfo.stanzaId === sentMsg.key.id) {

                await conn.sendMessage(from, { react: { text: "⬇️", key: userMsg.key } });

                switch (userReply) {
                    case "1":
                        await conn.sendMessage(from, {
                            document: { url: data.result.download_url },
                            mimetype: "video/mp4",
                            fileName: video.title + ".mp4",
                            contextInfo
                        }, { quoted: userMsg });
                        break;

                    case "2":
                        await conn.sendMessage(from, {
                            video: { url: data.result.download_url },
                            mimetype: "video/mp4",
                            contextInfo
                        }, { quoted: userMsg });
                        break;

                    default:
                        await conn.sendMessage(from, { text: "*Invalid selection, please select ( 1 or 2 ) 🔴*" }, { quoted: userMsg });
                        break;
                }
            }
        });

    } catch (err) {
        console.log(err);
        reply("An error occurred. Please try again later.");
    }
});

// 🎶 YouTube Song Downloader
cmd({
    pattern: "song1",
    react: "🎶",
    desc: "Download YouTube song",
    category: "main",
    use: ".song < Yt url or Name >",
    filename: __filename
}, async (conn, msg, m, { from, prefix, quoted, q, reply }) => {
    try {
        if (!q) return await reply("Please provide a YouTube URL or song name.");

        const searchResult = await ytsearch(q);
        if (searchResult.results.length < 1) return reply("No results found!");

        let song = searchResult.results[0];
        let apiUrl = "https://apis.davidcyriltech.my.id/youtube/mp3?url=" + encodeURIComponent(song.url);

        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.status !== 200 || !data.success || !data.result.download_url)
            return reply("Failed to fetch the audio. Please try again later.");

        let caption = `*HASHAN-𝗠𝗗 𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 ✨️*\n\n`
            + `┃ 🎶 *Title:* ${song.title}\n`
            + `┃ 👤 *Author:* ${song.author.name}\n`
            + `┃ ⏳ *Duration:* ${song.timestamp}\n`
            + `┃ 👀 *Views:* ${song.views}\n`
            + `┃ 🔗 *Link:* ${song.url}\n\n`
            + `*Please Reply with ( 1 , 2 , 3 ) ❤️\n\n`
            + `1️ | 📄 MP3 as Document\n`
            + `2️ | 🎧 MP3 as Audio (Play)\n`
            + `3️ | 🎙️ MP3 as Voice Note (PTT)\n\n`
            + `> *© 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 HASHAN-𝗠𝗗*`;

        let contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363395674230271@newsletter",
                newsletterName: "HASHAN-𝗠𝗗-V1",
                serverMessageId: 143
            }
        };

        const sentMsg = await conn.sendMessage(from, {
            image: { url: song.thumbnail },
            caption,
            contextInfo
        }, { quoted: msg });

        // Handle user reply (1, 2, or 3)
        conn.ev.on("messages.upsert", async (update) => {
            const userMsg = update.messages[0];
            if (!userMsg.message || !userMsg.message.extendedTextMessage) return;

            const userReply = userMsg.message.extendedTextMessage.text.trim();
            if (userMsg.message.extendedTextMessage.contextInfo &&
                userMsg.message.extendedTextMessage.contextInfo.stanzaId === sentMsg.key.id) {

                await conn.sendMessage(from, { react: { text: "⬇️", key: userMsg.key } });

                switch (userReply) {
                    case "1":
                        await conn.sendMessage(from, {
                            document: { url: data.result.download_url },
                            mimetype: "audio/mpeg",
                            fileName: song.title + ".mp3",
                            contextInfo
                        }, { quoted: userMsg });
                        break;

                    case "2":
                        await conn.sendMessage(from, {
                            audio: { url: data.result.download_url },
                            mimetype: "audio/mpeg",
                            contextInfo
                        }, { quoted: userMsg });
                        break;

                    case "3":
                        await conn.sendMessage(from, {
                            audio: { url: data.result.download_url },
                            mimetype: "audio/mpeg",
                            ptt: true,
                            contextInfo
                        }, { quoted: userMsg });
                        break;

                    default:
                        await conn.sendMessage(from, { text: "*Invalid selection, please select ( 1, 2 or 3 ) 🔴*" }, { quoted: userMsg });
                        break;
                }
            }
        });

    } catch (err) {
        console.log(err);
        reply("An error occurred. Please try again later.");
    }
});
