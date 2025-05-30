const Esana = require('@sl-code-lords/esana-news');
const adaderana = require('adaderana-scraper');
const { getLatestNews: getBBCNews } = require('bbcsinhala-news');

const esana = new Esana();
const autoSendMap = {};

module.exports = [
  {
    name: 'news',
    description: '📢 Sinhala News Center',
    category: 'news',
    async run({ msg }) {
      msg.reply(
        `🗞️ *Sinhala News Commands:*\n\n` +
        `👉 .news esana - Esana news\n` +
        `👉 .news adaderana - Ada Derana news\n` +
        `👉 .news bbc - BBC Sinhala news\n` +
        `👉 .startnews - Start auto-send every 10 min\n` +
        `👉 .stopnews - Stop auto-send\n` +
        `👉 .getnews - Check all sources are working`
      );
    }
  },

  {
    name: 'get2news',
    description: 'Check Esana, Ada Derana, BBC availability',
    category: 'news',
    async run({ msg }) {
      try {
        await esana.getLatestNews();
        await adaderana.getLatestNews();
        await getBBCNews();
        msg.reply('✅ All news sources are working fine!');
      } catch (err) {
        msg.reply('❌ Some sources may not be working. Check console/log.');
      }
    }
  },

  {
    name: 'newson',
    description: 'Start auto-sending Esana news every 10 minutes',
    category: 'news',
    async run({ msg, sock }) {
      const jid = msg.from;
      if (autoSendMap[jid]) return msg.reply('🔁 Already running.');

      msg.reply('✅ Started auto news updates every 10 mins.');
      autoSendMap[jid] = setInterval(async () => {
        try {
          const latest = await esana.getLatestNews();
          const news = latest[0];
          const caption = `📰 *${news.title}*\n\n${news.description}\n\n🔗 ${news.url}`;
          await sock.sendMessage(jid, {
            image: { url: news.thumbnail },
            caption,
          });
        } catch {}
      }, 10 * 60 * 1000);
    }
  },

  {
    name: 'newsoff',
    description: 'Stop auto news updates',
    category: 'news',
    async run({ msg }) {
      const jid = msg.from;
      clearInterval(autoSendMap[jid]);
      delete autoSendMap[jid];
      msg.reply('🛑 Auto news stopped.');
    }
  },

  {
    name: 'news',
    alias: ['news'],
    description: 'Fetch latest Sinhala news',
    category: 'news',
    async run({ msg, sock, args }) {
      const jid = msg.from;
      const option = (args[0] || '').toLowerCase();

      if (option === 'esana') {
        const latest = await esana.getLatestNews();
        const news = latest[0];
        const caption = `📰 *${news.title}*\n\n${news.description}\n\n🔗 ${news.url}`;
        return await sock.sendMessage(jid, {
          image: { url: news.thumbnail },
          caption,
        }, { quoted: msg });
      }

      if (option === 'adaderana') {
        const newsList = await adaderana.getLatestNews();
        const news = newsList[0];
        const caption = `📰 *${news.title}*\n\n${news.summary}\n\n🔗 ${news.link}`;
        return await sock.sendMessage(jid, {
          image: { url: news.image },
          caption,
        }, { quoted: msg });
      }

      if (option === 'bbc') {
        const newsList = await getBBCNews();
        const news = newsList[0];
        const caption = `📰 *${news.title}*\n\n🔗 ${news.link}`;
        return await sock.sendMessage(jid, { text: caption }, { quoted: msg });
      }

      msg.reply('❌ Invalid option. Try `.news` to see commands.');
    }
  }
];
