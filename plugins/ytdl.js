const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const { ytsearch, ytmp3 } = require('@dark-yasiya/yt-dl.js'); 

cmd({
    pattern: "song",
    alias: ["yta", "play"],
    react: "🎶",
    desc: "Download Youtube song",
    category: "main",
    use: '.song < Yt url or Name >',
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        const yt = await ytsearch(q);
        if (!yt.results || yt.results.length < 1) return reply("No results found!");

        let yts = yt.results[0];
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;

        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to fetch the audio. Please try again later.");
        }

        const { url, title, image, timestamp, ago, views, author } = yts;

        let ytmsg = `*🎵 INDUWARA-MD SONG DOWNLOADER*\n\n` +
            `╭━━━━━━━━━━━━━━━┈⊷\n` +
            `│ 🎵 *Title:* ${title || "Unknown"}\n` +
            `│ ⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `│ 👀 *Views:* ${views || "Unknown"}\n` +
            `│ 🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `│ 👤 *Author:* ${author?.name || "Unknown"}\n` +
            `│ 🖇 *Url:* ${url || "Unknown"}\n` +
            `│\n` +
            `│ 🔽 *Auto downloading....*\n` +
            `╰──────────────┈⊷\n` +
            `> *© 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙸𝙽𝙳𝚄𝚆𝙰𝚁𝙰 〽️𝙳*`;

        // Send song details as image + caption
        await conn.sendMessage(from, { image: { url: image || '' }, caption: ytmsg }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });

        // Send document version
        await conn.sendMessage(from, {
            document: { url: data.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title || "audio"}.mp3`,
            caption: `> *© 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙸𝙽𝙳𝚄𝚆𝙰𝚁𝙰 〽️𝙳*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ The misconception has been incorrect. Please try again.");
    }
});

//yt video

cmd({
    pattern: "video2",
    alias: ["mp4", "song"],
    react: "🎥",
    desc: "Download video from YouTube",
    category: "download",
    use: ".video <query or url>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a video name or YouTube URL!");

        let videoUrl, title;
        
        // Check if it's a URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const videoInfo = await yts({ videoId: q.split(/[=/]/).pop() });
            title = videoInfo.title;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("⬇️");

        // Use API to get video
        const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success) return await reply("❌ Failed to download video!");

        await conn.sendMessage(from, {
            video: { url: data.result.download_url },
            mimetype: 'video/mp4',
            caption: `*${title}*`
        }, { quoted: mek });

        await reply(`✅ *${title}* downloaded successfully!`);

    } catch (error) {
        console.error(error);
        await reply(`❌ Error: ${error.message}`);
    }
});
