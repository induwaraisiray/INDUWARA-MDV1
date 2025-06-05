const { cmd } = require('../command');
const Esana = require('@sl-code-lords/esana-news');
const { getLatestAdaNews } = require('../lib/adaderanaScraper');
const { getLatestLankaCNews } = require('../lib/lankacnewsScraper');

let activeGroups = {};
let lastNewsTitles = {};

const gifStyleVideos = [
    "https://files.catbox.moe/405y67.mp4",
    "https://files.catbox.moe/eslg4p.mp4"
];

function getRandomGifVideo() {
    return gifStyleVideos[Math.floor(Math.random() * gifStyleVideos.length)];
}

async function getLatestNews() {
    let newsData = [];

    try {
        const esanaApi = new Esana();
        const esanaNews = await esanaApi.getLatestNews();
        if (esanaNews?.title && esanaNews?.description) {
            newsData.push({
                title: esanaNews.title,
                content: esanaNews.description,
                date: esanaNews.publishedAt || new Date().toLocaleString()
            });
        }
    } catch (err) {
        console.error(`Error fetching Esana: ${err.message}`);
    }

    try {
        const adaNews = await getLatestAdaNews();
        if (adaNews) newsData.push(adaNews);
    } catch (err) {
        console.error(`Error fetching Adaderana: ${err.message}`);
    }

    try {
        const lankaC = await getLatestLankaCNews();
        if (lankaC) newsData.push(lankaC);
    } catch (err) {
        console.error(`Error fetching LankaCNews: ${err.message}`);
    }

    return newsData;
}

async function checkAndPostNews(conn, groupId) {
    const latestNews = await getLatestNews();

    for (const newsItem of latestNews) {
        if (!lastNewsTitles[groupId]) lastNewsTitles[groupId] = [];
        if (!lastNewsTitles[groupId].includes(newsItem.title)) {
            const gifVideo = getRandomGifVideo();
            const caption = `*🔵 𝐍𝐄𝐖𝐒 𝐀𝐋𝐄𝐑𝐓!*\n▁ ▂ ▄ ▅ ▆ ▇ █ [  ] █ ▇ ▆ ▅ ▄ ▂ ▁\n\n📰 *${newsItem.title}*\n\n${newsItem.content}\n\n🕒 ${newsItem.date}\n\n> *© Powered by MR Dinesh OFC*`;

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
                console.error(`Send error: ${e.message}`);
            }
        }
    }
}

cmd({
    pattern: "startnews",
    desc: "Enable auto Sri Lankan news updates",
    isGroup: true,
    react: "📰",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
    const isOwner = mek.sender === conn.user.jid;

    if (!isGroup) return await conn.sendMessage(from, { text: "Use this in a group." });
    if (!(isAdmin || isOwner)) return await conn.sendMessage(from, { text: "Admins or bot owner only." });

    if (!activeGroups[from]) {
        activeGroups[from] = true;
        await conn.sendMessage(from, { text: "✅ 24/7 Auto News Activated." });

        if (!activeGroups['interval']) {
            activeGroups['interval'] = setInterval(async () => {
                for (const groupId in activeGroups) {
                    if (activeGroups[groupId] && groupId !== 'interval') {
                        await checkAndPostNews(conn, groupId);
                    }
                }
            }, 60000); // every 1 min
        }
    } else {
        await conn.sendMessage(from, { text: "🟢 Already active." });
    }
});

cmd({
    pattern: "stopnews",
    desc: "Disable auto news updates",
    isGroup: true,
    react: "🛑",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
    const isOwner = mek.sender === conn.user.jid;

    if (!isGroup) return await conn.sendMessage(from, { text: "Use this in a group." });
    if (!(isAdmin || isOwner)) return await conn.sendMessage(from, { text: "Admins or bot owner only." });

    if (activeGroups[from]) {
        delete activeGroups[from];
        await conn.sendMessage(from, { text: "🛑 Auto News Disabled." });

        if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
            clearInterval(activeGroups['interval']);
            delete activeGroups['interval'];
        }
    } else {
        await conn.sendMessage(from, { text: "⚠️ Not active." });
    }
});

cmd({
    pattern: "getnews",
    desc: "Manually fetch the latest news",
    react: "📰",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    const latestNews = await getLatestNews();
    if (!latestNews.length) return await conn.sendMessage(from, { text: "😔 Couldn't fetch news." });

    const newsItem = latestNews[0];
    const gifVideo = getRandomGifVideo();
    const caption = `*🟣 𝐋𝐀𝐓𝐄𝐒𝐓 𝐍𝐄𝐖𝐒*\n\n📰 *${newsItem.title}*\n\n${newsItem.content}\n\n🕒 ${newsItem.date}\n\n> *By MR Dinesh OFC*`;

    try {
        await conn.sendMessage(from, {
            video: { url: gifVideo },
            caption,
            mimetype: "video/mp4",
            gifPlayback: true
        });
    } catch (err) {
        await conn.sendMessage(from, { text: `Error: ${err.message}` });
    }
});
