const { cmd } = require('../command');
const Esana = require('@sl-code-lords/esana-news');
const axios = require('axios');
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

// Fetch news from your API
async function fetchNewsFromAPI() {
    try {
        console.log('Fetching news from API...');
        const response = await axios.get('https://nethu-api.vercel.app/news', {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        console.log('API Response structure:', typeof response.data, Array.isArray(response.data));
        console.log('API Response sample:', JSON.stringify(response.data, null, 2));
        
        let newsArray = [];
        
        // Handle different response structures
        if (response.data) {
            // If response.data is an array
            if (Array.isArray(response.data)) {
                response.data.forEach(item => {
                    if (item && (item.title || item.headline)) {
                        newsArray.push({
                            title: item.title || item.headline || 'No Title',
                            content: item.description || item.content || item.summary || 'No content available',
                            date: item.date || item.publishedAt || item.time || new Date().toLocaleDateString(),
                            source: 'NEWS D API',
                            url: item.url || item.link || ''
                        });
                    }
                });
            }
            // If response.data has a nested array (like .results, .data, .news, etc.)
            else if (response.data.results && Array.isArray(response.data.results)) {
                response.data.results.forEach(item => {
                    if (item && (item.title || item.headline)) {
                        newsArray.push({
                            title: item.title || item.headline || 'No Title',
                            content: item.description || item.content || item.summary || 'No content available',
                            date: item.date || item.publishedAt || item.time || new Date().toLocaleDateString(),
                            source: 'NEWS D API',
                            url: item.url || item.link || ''
                        });
                    }
                });
            }
            // If response.data.data exists
            else if (response.data.data && Array.isArray(response.data.data)) {
                response.data.data.forEach(item => {
                    if (item && (item.title || item.headline)) {
                        newsArray.push({
                            title: item.title || item.headline || 'No Title',
                            content: item.description || item.content || item.summary || 'No content available',
                            date: item.date || item.publishedAt || item.time || new Date().toLocaleDateString(),
                            source: 'NEWS D API',
                            url: item.url || item.link || ''
                        });
                    }
                });
            }
            // If it's a single news object
            else if (response.data.title || response.data.headline) {
                newsArray.push({
                    title: response.data.title || response.data.headline || 'No Title',
                    content: response.data.description || response.data.content || response.data.summary || 'No content available',
                    date: response.data.date || response.data.publishedAt || response.data.time || new Date().toLocaleDateString(),
                    source: 'NEWS D API',
                    url: response.data.url || response.data.link || ''
                });
            }
        }
        
        console.log(`API news extracted: ${newsArray.length} items`);
        return newsArray;
        
    } catch (error) {
        console.error(`API fetch error: ${error.message}`);
        return [];
    }
}

// Fetch news from Esana
async function fetchEsanaNews() {
    try {
        console.log('Fetching Esana News...');
        const esanaApi = new Esana();
        
        // Try different method names that might exist in the API
        let esanaNews = null;
        
        // Try common method names
        if (typeof esanaApi.getLatestNews === 'function') {
            esanaNews = await esanaApi.getLatestNews();
        } else if (typeof esanaApi.getNews === 'function') {
            esanaNews = await esanaApi.getNews();
        } else if (typeof esanaApi.latest === 'function') {
            esanaNews = await esanaApi.latest();
        } else if (typeof esanaApi.breakingNews === 'function') {
            esanaNews = await esanaApi.breakingNews();
        } else {
            console.log('Esana API methods:', Object.getOwnPropertyNames(esanaApi));
            console.log('Esana API available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(esanaApi)));
            throw new Error('No suitable method found in Esana API');
        }
        
        console.log('Esana API Response:', esanaNews);
        
        let newsArray = [];
        
        if (esanaNews) {
            if (Array.isArray(esanaNews)) {
                esanaNews.forEach(item => {
                    if (item && (item.title || item.headline)) {
                        newsArray.push({
                            title: item.title || item.headline,
                            content: item.description || item.content || item.summary || 'No content available',
                            date: item.publishedAt || item.date || item.time || new Date().toLocaleDateString(),
                            source: 'Esana News',
                            url: item.url || item.link || ''
                        });
                    }
                });
            } else if (esanaNews.title || esanaNews.headline) {
                newsArray.push({
                    title: esanaNews.title || esanaNews.headline,
                    content: esanaNews.description || esanaNews.content || esanaNews.summary || 'No content available',
                    date: esanaNews.publishedAt || esanaNews.date || esanaNews.time || new Date().toLocaleDateString(),
                    source: 'Esana News',
                    url: esanaNews.url || esanaNews.link || ''
                });
            } else if (esanaNews.results && Array.isArray(esanaNews.results)) {
                esanaNews.results.forEach(item => {
                    if (item && (item.title || item.headline)) {
                        newsArray.push({
                            title: item.title || item.headline,
                            content: item.description || item.content || item.summary || 'No content available',
                            date: item.publishedAt || item.date || item.time || new Date().toLocaleDateString(),
                            source: 'Esana News',
                            url: item.url || item.link || ''
                        });
                    }
                });
            }
        }
        
        console.log(`Esana news extracted: ${newsArray.length} items`);
        return newsArray;
        
    } catch (error) {
        console.error(`Esana fetch error: ${error.message}`);
        return [];
    }
}

// Get all latest news with fallback system
async function getLatestNews() {
    let allNews = [];

    // Fetch from your API first (priority)
    const apiNews = await fetchNewsFromAPI();
    console.log(`API returned: ${apiNews.length} news items`);
    allNews = [...apiNews];

    // If API didn't return any news, try Esana
    if (allNews.length === 0) {
        console.log('API returned no news, trying Esana...');
        const esanaNews = await fetchEsanaNews();
        console.log(`Esana returned: ${esanaNews.length} news items`);
        allNews = [...esanaNews];
    }

    // If still no news, create a test news item
    if (allNews.length === 0) {
        console.log('No news from any source, creating test news...');
        allNews.push({
            title: "NEWS D Service Active",
            content: "Sri Lankan news service is running. Latest news will be posted automatically when available from our sources.",
            date: new Date().toLocaleDateString(),
            source: 'NEWS D System',
            url: ''
        });
    }

    // Remove duplicates based on title
    const uniqueNews = allNews.filter((news, index, self) => 
        index === self.findIndex(n => n.title.toLowerCase().trim() === news.title.toLowerCase().trim())
    );

    console.log(`Total unique news items: ${uniqueNews.length}`);
    return uniqueNews;
}

async function checkAndPostNews(conn, groupId) {
    try {
        console.log(`🔍 Checking news for group: ${groupId}`);
        const latestNews = await getLatestNews();

        if (latestNews.length === 0) {
            console.log('❌ No news data available');
            return;
        }

        console.log(`📰 Found ${latestNews.length} news items`);

        if (!lastNewsTitles[groupId]) lastNewsTitles[groupId] = [];

        for (const newsItem of latestNews) {
            // Check if this news was already posted
            if (!lastNewsTitles[groupId].includes(newsItem.title)) {
                console.log(`📤 Posting new news: ${newsItem.title}`);
                
                const gifVideo = getRandomGifVideo();
                
                // NEWS D Caption format
                const caption = `*🔴 𝐍𝐄𝐖𝐒 𝐃*\n▁ ▂ ▄ ▅ ▆ ▇ █ [  ] █ ▇ ▆ ▅ ▄ ▂ ▁\n\n📰 *${newsItem.title}*\n\n${newsItem.content}\n\n📅 ${newsItem.date}\n🔗 ${newsItem.source}\n\n> *©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ*\n> *QUEEN-SADU-MD & D-XTRO-MD*`;

                try {
                    // Try to send with video first
                    await conn.sendMessage(groupId, {
                        video: { url: gifVideo },
                        caption,
                        mimetype: "video/mp4",
                        gifPlayback: true
                    });

                    console.log(`✅ News video sent successfully to ${groupId}`);

                } catch (videoError) {
                    console.error(`❌ Video send failed: ${videoError.message}`);
                    
                    // Fallback: Send as text message
                    try {
                        const textMessage = `*🔴 𝐍𝐄𝐖𝐒 𝐃*\n\n📰 *${newsItem.title}*\n\n${newsItem.content}\n\n📅 ${newsItem.date}\n🔗 ${newsItem.source}\n\n> *QUEEN-SADU-MD & D-XTRO-MD*`;
                        
                        await conn.sendMessage(groupId, { text: textMessage });
                        console.log(`✅ News text sent successfully to ${groupId}`);
                        
                    } catch (textError) {
                        console.error(`❌ Text send also failed: ${textError.message}`);
                        continue; // Skip this news item
                    }
                }

                // Store the title to prevent duplicates
                lastNewsTitles[groupId].push(newsItem.title);
                
                // Keep only last 30 titles to prevent memory issues
                if (lastNewsTitles[groupId].length > 30) {
                    lastNewsTitles[groupId] = lastNewsTitles[groupId].slice(-20);
                }

                // Add delay between messages to avoid spam/rate limits
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                console.log(`⏭️ Skipping duplicate news: ${newsItem.title}`);
            }
        }
    } catch (error) {
        console.error(`💥 Error in checkAndPostNews: ${error.message}`);
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
        if (!isGroup) {
            return await conn.sendMessage(from, { text: "❌ This command can only be used in groups." });
        }

        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (!isAdmin && !isBotOwner) {
            return await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can use this command." });
        }

        if (activeGroups[from]) {
            return await conn.sendMessage(from, { 
                text: "*✅ NEWS D Already Active!*\n\nAuto news updates are already running in this group.\n\n> QUEEN-SADU-MD & D-XTRO-MD" 
            });
        }

        // Activate news for this group
        activeGroups[from] = true;

        await conn.sendMessage(from, { 
            text: "🇱🇰 *NEWS D Activated!*\n\n✅ Sri Lankan news will be posted automatically\n⏱️ Check interval: Every 2 minutes\n📰 Sources: NEWS D API & Esana News\n🔴 Brand: NEWS D\n\n> QUEEN-SADU-MD & D-XTRO-MD" 
        });

        // Start the interval if it's not already running
        if (!activeGroups['interval']) {
            console.log('🚀 Starting NEWS D interval...');
            activeGroups['interval'] = setInterval(async () => {
                console.log('⏰ Running NEWS D check interval...');
                for (const groupId in activeGroups) {
                    if (activeGroups[groupId] && groupId !== 'interval') {
                        console.log(`📊 Checking news for active group: ${groupId}`);
                        await checkAndPostNews(conn, groupId);
                    }
                }
            }, 120000); // Check every 2 minutes
            
            console.log('✅ NEWS D interval started successfully');
        }

        // Send first news immediately after 5 seconds
        setTimeout(async () => {
            console.log('📤 Sending initial news...');
            await checkAndPostNews(conn, from);
        }, 5000);

    } catch (e) {
        console.error(`💥 Error in startnews command: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to activate NEWS D service. Please try again." });
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
        if (!isGroup) {
            return await conn.sendMessage(from, { text: "❌ This command can only be used in groups." });
        }

        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (!isAdmin && !isBotOwner) {
            return await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can use this command." });
        }

        if (!activeGroups[from]) {
            return await conn.sendMessage(from, { text: "⚠️ NEWS D is not active in this group." });
        }

        // Deactivate news for this group
        delete activeGroups[from];
        delete lastNewsTitles[from];
        
        await conn.sendMessage(from, { 
            text: "*🛑 NEWS D Disabled*\n\nAutomatic news updates have been stopped for this group.\n\n> QUEEN-SADU-MD & D-XTRO-MD" 
        });

        // Stop the interval if no groups are active
        const activeGroupCount = Object.keys(activeGroups).filter(key => key !== 'interval').length;
        if (activeGroupCount === 0 && activeGroups['interval']) {
            console.log('⏹️ No active groups, stopping NEWS D interval...');
            clearInterval(activeGroups['interval']);
            delete activeGroups['interval'];
            console.log('✅ NEWS D interval stopped');
        }

    } catch (e) {
        console.error(`💥 Error in stopnews command: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to deactivate NEWS D service." });
    }
});

// Manual news check command
cmd({
    pattern: "getnews",
    desc: "Manually check and post latest news",
    isGroup: true,
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, participants }) => {
    try {
        if (!isGroup) return;

        const isAdmin = participants.some(p => p.id === mek.sender && p.admin);
        const isBotOwner = mek.sender === conn.user.jid;

        if (!isAdmin && !isBotOwner) {
            return await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can use this command." });
        }

        await conn.sendMessage(from, { text: "🔍 *NEWS D* - Checking for latest news..." });
        await checkAndPostNews(conn, from);
        
    } catch (e) {
        console.error(`💥 Error in checknews command: ${e.message}`);
        await conn.sendMessage(from, { text: "❌ Failed to check NEWS D. Please try again." });
    }
});

// Status command to check active groups
cmd({
    pattern: "newsstatus",
    desc: "Check NEWS D status",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const activeCount = Object.keys(activeGroups).filter(key => key !== 'interval').length;
        const status = activeGroups['interval'] ? 'Running' : 'Stopped';
        
        const statusMsg = `*📊 NEWS D Status*\n\n🔴 Service: ${status}\n👥 Active Groups: ${activeCount}\n⏱️ Interval: 2 minutes\n📰 Sources: API + Esana\n\n> QUEEN-SADU-MD & D-XTRO-MD`;
        
        await conn.sendMessage(from, { text: statusMsg });
    } catch (e) {
        console.error(`Error in newsstatus: ${e.message}`);
    }
});

module.exports = { activeGroups, lastNewsTitles };
