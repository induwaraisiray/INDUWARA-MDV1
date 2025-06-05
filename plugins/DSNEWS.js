const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

let activeGroups = {};
let lastNewsTitles = {};

const gifStyleVideos = [
    "https://files.catbox.moe/405y67.mp4",
    "https://files.catbox.moe/eslg4p.mp4"
];

function getRandomGifVideo() {
    return gifStyleVideos[Math.floor(Math.random() * gifStyleVideos.length)];
}

// 🔍 Scrape latest Lankacnews post
async function getLankacNews() {
    try {
        const { data } = await axios.get("https://lankacnews.com/");
        const $ = cheerio.load(data);
        const articles = [];

        $('.jeg_postblock_12 .jeg_posts article').each((i, el) => {
            const title = $(el).find('.jeg_post_title a').text().trim();
            const link = $(el).find('.jeg_post_title a').attr('href');
            const date = $(el).find('.jeg_meta_date').text().trim();
            const excerpt = $(el).find('.jeg_post_excerpt p').text().trim();

            if (title && link) {
                articles.push({ title, link, date, content: excerpt });
            }
        });

        return articles.slice(0, 3); // return latest 3
    } catch (err) {
        console.error("❌ Error fetching Lankacnews:", err.message);
        return [];
    }
}

async function checkAndPostNews(conn, groupId) {
    const latestNews = await getLankacNews();

    for (const newsItem of latestNews) {
        if (!lastNewsTitles[groupId]) lastNewsTitles[groupId] = [];

        if (!lastNewsTitles[groupId].includes(newsItem.title)) {
            const gifVideo = getRandomGifVideo();
            const caption = `*🔴 𝐋𝐀𝐍𝐊𝐀𝐂𝐍𝐄𝐖𝐒 𝐀𝐋𝐄𝐑𝐓!*\n━━━━━━━━━━━━━━━\n\n📰 *${newsItem.title}*\n\n${newsItem.content}\n\n🗓️ ${newsItem.date}\n🔗 ${newsItem.link}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ MR DINESH OFC*`;

            try {
                await conn.sendMessage(groupId, {
                    video: { url: gifVideo },
                    caption,
                    mimetype: "video/mp4",
                    gifPlayback: true
                });

                lastNewsTitles[groupId].push(newsItem.title);
                if (lastNewsTitles[groupId].length > 100) lastNewsTitles[groupId].shift();

            } catch (e) {
                console.error(`❌ Failed to send news: ${e.message}`);
            }
        }
    }
}

cmd({
    pattern: "startnews",
    desc: "Enable Lankacnews updates in this group",
    isGroup: true,
    react: "📰",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        if (isGroup) {
            const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
            const isBotOwner = mek.sender === conn.user.jid;

            if (isAdmin || isBotOwner) {
                if (!activeGroups[from]) {
                    activeGroups[from] = true;

                    await conn.sendMessage(from, { text: "🔴 Lankacnews Auto Updates Activated.\n> Powered by MR DINESH OFC" });

                    if (!activeGroups['interval']) {
                        activeGroups['interval'] = setInterval(async () => {
                            for (const groupId in activeGroups) {
                                if (activeGroups[groupId] && groupId !== 'interval') {
                                    await checkAndPostNews(conn, groupId);
                                }
                            }
                        }, 60000);
                    }
                } else {
                    await conn.sendMessage(from, { text: "✅ News updates already active in this group." });
                }
            } else {
                await conn.sendMessage(from, { text: "🚫 Only admins or owner can activate news." });
            }
        } else {
            await conn.sendMessage(from, { text: "🔒 Group-only command." });
        }
    } catch (e) {
        console.error(`Error in startnews: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to activate news." });
    }
});

cmd({
    pattern: "stopnews",
    desc: "Disable Lankacnews updates in this group",
    isGroup: true,
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        if (isGroup) {
            const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
            const isBotOwner = mek.sender === conn.user.jid;

            if (isAdmin || isBotOwner) {
                if (activeGroups[from]) {
                    delete activeGroups[from];
                    await conn.sendMessage(from, { text: "*🛑 Lankacnews updates disabled.*" });

                    if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
                        clearInterval(activeGroups['interval']);
                        delete activeGroups['interval'];
                    }
                } else {
                    await conn.sendMessage(from, { text: "⚠️ News updates not active." });
                }
            } else {
                await conn.sendMessage(from, { text: "🚫 Only admins or owner can deactivate news." });
            }
        } else {
            await conn.sendMessage(from, { text: "🔒 Group-only command." });
        }
    } catch (e) {
        console.error(`Error in stopnews: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to stop news service." });
    }
});

cmd({
    pattern: "getnews",
    desc: "Manually get latest Lankacnews",
    react: "📰",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const news = await getLankacNews();
        if (news.length === 0) {
            await conn.sendMessage(from, { text: "😔 No news found at the moment." });
            return;
        }

        const first = news[0];
        const caption = `📰 *${first.title}*\n\n${first.content}\n\n🗓️ ${first.date}\n🔗 ${first.link}`;
        await conn.sendMessage(from, { text: caption });

    } catch (e) {
        console.error("Error in getnews:", e.message);
        await conn.sendMessage(from, { text: "❌ Couldn't fetch news." });
    }
});
