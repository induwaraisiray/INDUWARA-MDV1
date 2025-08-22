const config = require('../config');
const { cmd } = require('../command');
const yts = require('yt-search');
const { ytsearch } = require('@dark-yasiya/yt-dl.js'); 
const fetch = require("node-fetch");

// 🎵 Song Downloader
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
        if (!q) return reply("❌ Please provide a song name or YouTube URL!");

        const yt = await ytsearch(q);
        if (!yt.results || yt.results.length < 1) return reply("No results found!");

        let result = yt.results[0];
        let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(result.url)}`;

        let response = await fetch(apiUrl);
        let data = await response.json();

        if (!data.success || !data.result.download_url) {
            return reply("❌ Failed to fetch audio. Please try again later.");
        }

        let ytmsg = `*🎵 INDUWARA-MD SONG DOWNLOADER*\n\n` +
            `🎵 *Title:* ${result.title}\n` +
            `⏳ *Duration:* ${result.timestamp}\n` +
            `👀 *Views:* ${result.views}\n` +
            `🌏 *Published:* ${result.ago}\n` +
            `👤 *Author:* ${result.author?.name}\n` +
            `🖇 *Url:* ${result.url}\n\n` +
            `🔽 *Downloading your song...*`;

        // Song info
        await conn.sendMessage(from, { image: { url: result.image }, caption: ytmsg }, { quoted: mek });

        // Audio only
        await conn.sendMessage(from, {
            audio: { url: data.result.download_url },
            mimetype: "audio/mpeg",
            fileName: `${result.title}.mp3`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error while downloading song. Please try again.");
    }
});

// 🎥 Video Downloader
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
        if (!q) return await reply("*❌ Please provide a video name or YouTube URL!*");

        let videoUrl, title;
        
        // Check if it's a URL
        if (q.match(/(youtube\.com|youtu\.be)/)) {
            videoUrl = q;
            const videoInfo = await yts({ videoId: q.split(/[=/]/).pop() });
            title = videoInfo.title;
        } else {
            // Search YouTube
            const search = await yts(q);
            if (!search.videos.length) return await reply("*❌ No results found!*");
            videoUrl = search.videos[0].url;
            title = search.videos[0].title;
        }

        await reply("*⏳ Downloading video...*");

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
