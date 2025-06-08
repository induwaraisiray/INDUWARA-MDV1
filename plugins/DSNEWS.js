const esana = require('@sl-code-lords/esana-news');
let activeGroups = [];
let lastSentTitle = "";

module.exports = {
  name: 'autonews',
  command: ['startnews', 'stopnews'],
  desc: 'Enable or disable auto news for groups',
  react: "📰",

  start: async (m, { sock }) => {
    const groupId = m.chat;

    if (!groupId.endsWith('@g.us')) {
      return await sock.sendMessage(groupId, { text: "⛔ මෙම command එක group එකකට පමණක්!" });
    }

    if (m.command === 'startnews') {
      if (!activeGroups.includes(groupId)) {
        activeGroups.push(groupId);
        await sock.sendMessage(groupId, { text: "🟢 Auto news service සක්‍රීයයි!" });
      } else {
        await sock.sendMessage(groupId, { text: "🔁 Auto news දැනටමත් ක්‍රියාත්මකයි." });
      }
    }

    if (m.command === 'stopnews') {
      activeGroups = activeGroups.filter(g => g !== groupId);
      await sock.sendMessage(groupId, { text: "🔴 Auto news service නවතා ඇත." });
    }
  },

  // auto loop
  cron: "*/5 * * * *", // every 5 minutes
  job: async (m, { sock }) => {
    try {
      const data = await esana.getLatestNews();
      const latestNews = data[0];
      if (latestNews.title !== lastSentTitle) {
        const message = `📰 *${latestNews.title}*\n\n${latestNews.description}\n\n🕒 ${latestNews.date}`;
        lastSentTitle = latestNews.title;

        for (const groupId of activeGroups) {
          await sock.sendMessage(groupId, { text: message });
        }
      }
    } catch (err) {
      console.log("❌ News Fetch Error:", err.message);
    }
  }
};
