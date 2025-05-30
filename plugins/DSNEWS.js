const { cmd } = require('../command');
const Esana = require('esana-node-api');

let activeGroups = {};
let lastNewsTitle = {};

async function getLatestEsanaNews(passcode) {
  try {
    const news = await Esana.latestNews(passcode);
    return news;
  } catch (error) {
    console.error('🛑 Esana API Error:', error.message);
    return null;
  }
}

// 📰 Command to manually get latest news
cmd({
  pattern: "getnews",
  desc: "Manually get latest Sinhala news from Esana",
  filename: __filename
}, async (conn, m, msg) => {
  const news = await getLatestEsanaNews("https://www.npmjs.com/package/esana-node-api");
  if (!news) return await conn.sendMessage(msg.from, { text: "😓 Unable to fetch news from Esana." });

  let text = `*🗞️ ${news.title}*\n\n${news.description}\n🗓️ ${news.date}\n🔗 ${news.url}`;
  await conn.sendMessage(msg.from, { text });
});

// 🟢 Start auto news
cmd({
  pattern: "startnews",
  desc: "Enable Sinhala news updates in this group",
  isGroup: true,
  react: "🟢",
  filename: __filename
}, async (conn, m, msg, { from, participants }) => {
  const sender = m.sender;
  const isAdmin = participants.some(p => p.id === sender && p.admin);
  const isBotOwner = sender === conn.user.jid;

  if (!isAdmin && !isBotOwner) {
    return await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can start news." });
  }

  if (activeGroups[from]) {
    return await conn.sendMessage(from, { text: "📰 News already active in this group." });
  }

  activeGroups[from] = true;
  await conn.sendMessage(from, { text: "🗞️ Esana Sinhala news started in this group!" });

  if (!activeGroups['interval']) {
    activeGroups['interval'] = setInterval(async () => {
      for (const groupId in activeGroups) {
        if (groupId !== 'interval' && activeGroups[groupId]) {
          const news = await getLatestEsanaNews("YOUR_PASSCODE_HERE");
          if (news && lastNewsTitle[groupId] !== news.title) {
            lastNewsTitle[groupId] = news.title;

            let text = `*🗞️ ${news.title}*\n\n${news.description}\n🗓️ ${news.date}\n🔗 ${news.url}`;
            await conn.sendMessage(groupId, { text });
          }
        }
      }
    }, 180000); // every 3 minutes
  }
});

// 🔴 Stop news
cmd({
  pattern: "stopnews",
  desc: "Disable Sinhala news updates in this group",
  isGroup: true,
  react: "🔴",
  filename: __filename
}, async (conn, m, msg, { from, participants }) => {
  const sender = m.sender;
  const isAdmin = participants.some(p => p.id === sender && p.admin);
  const isBotOwner = sender === conn.user.jid;

  if (!isAdmin && !isBotOwner) {
    return await conn.sendMessage(from, { text: "🚫 Only group admins or bot owner can stop news." });
  }

  if (activeGroups[from]) {
    delete activeGroups[from];
    await conn.sendMessage(from, { text: "❌ News disabled in this group." });

    if (Object.keys(activeGroups).length === 1 && activeGroups['interval']) {
      clearInterval(activeGroups['interval']);
      delete activeGroups['interval'];
    }
  } else {
    await conn.sendMessage(from, { text: "ℹ️ News was not active in this group." });
  }
});
