const { cmd } = require('../command'); const { Esana } = require('esana-node-api');

let activeGroups = {}; let lastNewsId = {};

// Fetch latest Esana news async function fetchLatestNews() { try { await Esana.verify('your_passcode_here'); // Replace with your real passcode const news = await Esana.fetch_news_data(); return news?.esana || null; } catch (err) { console.error('Error fetching Esana news:', err); return null; } }

// Broadcast new news to group async function checkAndSendNews(conn, groupId) { const news = await fetchLatestNews(); if (news && (!lastNewsId[groupId] || news.news_id !== lastNewsId[groupId])) { const message = `📰 Esana News

${news.title} ${news.description} 🗓️ ${news.date} 🔗 ${news.url}`;

await conn.sendMessage(groupId, { text: message });
lastNewsId[groupId] = news.news_id;

} }

// /startnews command cmd({ pattern: 'startnews', desc: 'Start Sinhala news updates from Esana', isGroup: true, react: '🗞️', filename: __filename }, async (conn, mek, m, { from, isGroup, participants }) => { if (!isGroup) return await conn.sendMessage(from, { text: 'Group command only.' });

const isAdmin = participants.some(p => p.id === mek.sender && p.admin); const isOwner = mek.sender === conn.user.jid; if (!isAdmin && !isOwner) return await conn.sendMessage(from, { text: 'Admins only.' });

if (!activeGroups[from]) { activeGroups[from] = true; await conn.sendMessage(from, { text: '✅ Sinhala news auto-updates started.' });

if (!activeGroups['interval']) {
  activeGroups['interval'] = setInterval(async () => {
    for (const groupId in activeGroups) {
      if (groupId !== 'interval') await checkAndSendNews(conn, groupId);
    }
  }, 60000); // 1 min
}

} else { await conn.sendMessage(from, { text: 'Already activated.' }); } });

// /stopnews command cmd({ pattern: 'stopnews', desc: 'Stop Sinhala news updates', isGroup: true, react: '❌', filename: __filename }, async (conn, mek, m, { from, isGroup, participants }) => { if (!isGroup) return await conn.sendMessage(from, { text: 'Group command only.' });

const isAdmin = participants.some(p => p.id === mek.sender && p.admin); const isOwner = mek.sender === conn.user.jid; if (!isAdmin && !isOwner) return await conn.sendMessage(from, { text: 'Admins only.' });

if (activeGroups[from]) { delete activeGroups[from]; await conn.sendMessage(from, { text: '🛑 Sinhala news auto-updates stopped.' });

if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
  clearInterval(activeGroups['interval']);
  delete activeGroups['interval'];
}

} else { await conn.sendMessage(from, { text: 'Not activated yet.' }); } });

// /getnews command cmd({ pattern: 'getnews', desc: 'Get the latest Sinhala Esana news manually', react: '📰', filename: __filename }, async (conn, mek, m, { from }) => { const news = await fetchLatestNews(); if (news) { const message = `📰 Esana News

${news.title} ${news.description} 🗓️ ${news.date} 🔗 ${news.url}`; await conn.sendMessage(from, { text: message }); } else { await conn.sendMessage(from, { text: '❌ Unable to fetch news.' }); } });

