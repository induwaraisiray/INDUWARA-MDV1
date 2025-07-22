const { cmd } = require('../command');
const Hiru = require('hirunews-scrap');
const Esana = require('@sl-code-lords/esana-news');
const config = require('../config');

let activeGroups = {};
let lastNewsTitles = {};

// MP4 short looping videos with gif effect
const gifStyleVideos = [
    "https://files.catbox.moe/405y67.mp4",
    "https://files.catbox.moe/eslg4p.mp4"
];

function getRandomGifVideo() {
    return gifStyleVideos[Math.floor(Math.random() * gifStyleVideos.length)];
}

// Improved news fetching with better error handling
async function getLatestNews() {
    let newsData = [];

    // Fetch Hiru News
    try {
        console.log('Fetching Hiru News...');
        const hiruApi = new Hiru();
        const hiruNews = await hiruApi.BreakingNews();
        
        console.log('Hiru API Response:', hiruNews);
        
        if (hiruNews && hiruNews.results) {
            // Handle different possible response structures
            if (Array.isArray(hiruNews.results)) {
                hiruNews.results.forEach(item => {
                    if (item.title && item.news) {
                        newsData.push({
                            title: item.title,
                            content: item.news,
                            date: item.date || new Date().toLocaleDateString(),
                            source: 'Hiru News'
                        });
                    }
                });
            } else if (hiruNews.results.title && hiruNews.results.news) {
                newsData.push({
                    title: hiruNews.results.title,
                    content: hiruNews.results.news,
                    date: hiruNews.results.date || new Date().toLocaleDateString(),
                    source: 'Hiru News'
                });
            }
        }
    } catch (err) {
        console.error(`Error fetching Hiru News: ${err.message}`);
    }

    // Fetch Esana News
    try {
        console.log('Fetching Esana News...');
        const esanaApi = new Esana();
        const esanaNews = await esanaApi.getLatestNews();
        
        console.log('Esana API Response:', esanaNews);
        
        if (esanaNews) {
            // Handle different response structures
            if (Array.isArray(esanaNews)) {
                esanaNews.forEach(item => {
                    if (item.title && (item.description || item.content)) {
                        newsData.push({
                            title: item.title,
                            content: item.description || item.content,
                            date: item.publishedAt || item.date || new Date().toLocaleDateString(),
                            source: 'Esana News'
                        });
                    }
                });
            } else if (esanaNews.title && (esanaNews.description || esanaNews.content)) {
                newsData.push({
                    title: esanaNews.title,
                    content: esanaNews.description || esanaNews.content,
                    date: esanaNews.publishedAt || esanaNews.date || new Date().toLocaleDateString(),
                    source: 'Esana News'
                });
            }
        }
    } catch (err) {
        console.error(`Error fetching Esana News: ${err.message}`);
    }

    // Fallback: If no news from APIs, create a test news
    if (newsData.length === 0) {
        console.log('No news from APIs, creating test news');
        newsData.push({
            title: "News Service Active",
            content: "Sri Lankan news updates are now active in this group. Latest news will be posted automatically.",
            date: new Date().toLocaleDateString(),
            source: 'System'
        });
    }

    console.log(`Total news items fetched: ${newsData.length}`);
    return newsData;
}

async function checkAndPostNews(conn, groupId) {
    try {
        console.log(`Checking news for group: ${groupId}`);
        const latestNews = await getLatestNews();

        if (latestNews.length === 0) {
            console.log('No news data available');
            return;
        }

        for (const newsItem of latestNews) {
            if (!lastNewsTitles[groupId]) lastNewsTitles[groupId] = [];

            // Check if this news was already posted
            if (!lastNewsTitles[groupId].includes(newsItem.title)) {
                console.log(`Posting new news: ${newsItem.title}`);
                
                const gifVideo = getRandomGifVideo();
                const caption = `*🔵 𝐍𝐄𝐖𝐒 𝐀𝐋𝐄𝐑𝐓!*\n▁ ▂ ▄ ▅ ▆ ▇ █ [  ] █ ▇ ▆ ▅ ▄ ▂ ▁\n\n📰 *${newsItem.title}*\n\n${newsItem.content}\n\n📅 ${newsItem.date}\n🔗 Source: ${newsItem.source}\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*\n> *QUEEN-SADU-MD & D-XTRO-MD*`;

                try {
                    await conn.sendMessage(groupId, {
                        video: { url: gifVideo },
                        caption,
                        mimetype: "video/mp4",
                        gifPlayback: true
                    });

                    console.log(`News sent successfully to ${groupId}`);

                    // Store the title to prevent duplicates
                    lastNewsTitles[groupId].push(newsItem.title);
                    if (lastNewsTitles[groupId].length > 50) {
                        lastNewsTitles[groupId] = lastNewsTitles[groupId].slice(-25); // Keep only last 25
                    }

                } catch (e) {
                    console.error(`Failed to send video message: ${e.message}`);
                    
                    // Fallback: Send as text message if video fails
                    try {
                        await conn.sendMessage(groupId, { 
                            text: `📰 *NEWS ALERT*\n\n*${newsItem.title}*\n\n${newsItem.content}\n\n📅 ${newsItem.date}\n🔗 ${newsItem.source}`
                        });
                        
                        lastNewsTitles[groupId].push(newsItem.title);
                        console.log(`News sent as text to ${groupId}`);
                    } catch (textError) {
                        console.error(`Failed to send text message: ${textError.message}`);
                    }
                }

                // Add delay between messages to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    } catch (error) {
        console.error(`Error in checkAndPostNews: ${error.message}`);
    }
}

// Start news command
cmd({
    pattern: "startnews",
    desc: "Enable Sri Lankan news updates in this group",
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

                    await conn.sendMessage(from, { 
                        text: "🇱🇰 *Auto 24/7 News Activated!*\n\n✅ Sri Lankan news will be posted automatically\n⏱️ Check interval: Every 1 minute\n📰 Sources: Hiru News & Esana News\n\n> QUEEN-SADU-MD & D-XTRO-MD" 
                    });

                    // Start the interval if it's not already running
                    if (!activeGroups['interval']) {
                        console.log('Starting news interval...');
                        activeGroups['interval'] = setInterval(async () => {
                            console.log('Running news check interval...');
                            for (const groupId in activeGroups) {
                                if (activeGroups[groupId] && groupId !== 'interval') {
                                    console.log(`Checking news for active group: ${groupId}`);
                                    await checkAndPostNews(conn, groupId);
                                }
                            }
                        }, 60000); // Check every minute
                        
                        console.log('News interval started successfully');
                    }

                    // Send a test news immediately
                    setTimeout(async () => {
                        await checkAndPostNews(conn, from);
                    }, 3000);

                } else {
                    await conn.sendMessage(from, { 
                        text: "*✅ 24/7 News Already Activated.*\n\nNews updates are already running in this group.\n\n> QUEEN-SADU-MD & D-XTRO-MD" 
                    });
                }
            } else {
                await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can use this command." });
            }
        } else {
            await conn.sendMessage(from, { text: "❌ This command can only be used in groups." });
        }
    } catch (e) {
        console.error(`Error in startnews command: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to activate news service. Please try again." });
    }
});

// Stop news command
cmd({
    pattern: "stopnews",
    desc: "Disable Sri Lankan news updates in this group",
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
                    delete lastNewsTitles[from]; // Clear stored titles for this group
                    
                    await conn.sendMessage(from, { 
                        text: "*🛑 News Updates Disabled*\n\nAutomatic news updates have been stopped for this group.\n\n> QUEEN-SADU-MD & D-XTRO-MD" 
                    });

                    // Stop the interval if no groups are active
                    const activeGroupCount = Object.keys(activeGroups).filter(key => key !== 'interval').length;
                    if (activeGroupCount === 0 && activeGroups['interval']) {
                        console.log('No active groups, stopping news interval...');
                        clearInterval(activeGroups['interval']);
                        delete activeGroups['interval'];
                        console.log('News interval stopped');
                    }
                } else {
                    await conn.sendMessage(from, { text: "⚠️ News updates are not active in this group." });
                }
            } else {
                await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can use this command." });
            }
        } else {
            await conn.sendMessage(from, { text: "❌ This command can only be used in groups." });
        }
    } catch (e) {
        console.error(`Error in stopnews command: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to deactivate news service. Please try again." });
    }
});

// Manual news check command for testing
cmd({
    pattern: "getnews",
    desc: "Manually check and post latest news (for testing)",
    isGroup: true,
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        if (isGroup) {
            const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
            const isBotOwner = mek.sender === conn.user.jid;

            if (isAdmin || isBotOwner) {
                await conn.sendMessage(from, { text: "🔍 Checking for latest news..." });
                await checkAndPostNews(conn, from);
            } else {
                await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can use this command." });
            }
        }
    } catch (e) {
        console.error(`Error in checknews command: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to check news. Please try again." });
    }
});

// Export active groups for debugging
module.exports = { activeGroups, lastNewsTitles };
