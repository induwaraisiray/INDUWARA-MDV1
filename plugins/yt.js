const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    try {
        const cleanUrl = url.split('?')[0]; 
        const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
        const match = cleanUrl.match(regex);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

cmd({
    pattern: "play3",
    alias: ["mp3", "ytmp3"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let videoId = q.startsWith("http") ? replaceYouTubeID(q) : null;

        // 🔹 If no videoId from link → search by text
        if (!videoId) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            videoId = searchResults.results[0].videoId;
        }

        // 🔹 Fetch video info
        const data = await dy_scrap.ytsearch(videoId);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🍄 *SENU-MD SONG DL* 🍄\n\n` +
            `🎵 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `👤 *Author:* ${author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${url || "Unknown"}\n\n` +
            `🔽 *Reply with your choice:*\n` +
            `1⃣ *Audio Type* 🎵\n` +
            `2⃣ *Document Type* 📁\n\n` +
            `${config.FOOTER || "𓆩JesterTechX𓆪"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // 🔹 Wait only once for reply
        conn.ev.once('messages.upsert', async (messageUpdate) => {
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();

                if (userReply === "1" || userReply === "2") {
                    // ⏳ React processing
                    await conn.sendMessage(from, { react: { text: "⏳", key: mekInfo.key } });

                    // 🔹 Download mp3
                    const response = await dy_scrap.ytmp3(`https://youtu.be/${videoId}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");

                    let type;
                    if (userReply === "1") {
                        type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                    } else {
                        type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };
                    }

                    await conn.sendMessage(from, type, { quoted: mek });

                    // ✅ React success
                    await conn.sendMessage(from, { react: { text: "✅", key: mekInfo.key } });
                } else {
                    return await reply("❌ Invalid choice! Reply with 1 or 2.");
                }

            } catch (error) {
                console.error(error);
                await reply(`❌ *An error occurred while processing:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});          
