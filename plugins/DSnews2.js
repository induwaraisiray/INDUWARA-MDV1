const { cmd, commands } = require('../command');
const Esana = require('@sl-code-lords/esana-news');
const adaderana = require('adaderana-scraper');
const config = require('../config');

const esana = new Esana();
const autoSendMap = {};

module.exports = [
  {
    name: 'news',
    description: '📢 Sinhala News Center',
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

      return msg.reply(
        `🗞️ *Sinhala News Commands:*\n\n` +
        `👉 .news esana - Esana news\n` +
        `👉 .news adaderana - Ada Derana news\n` +
        `👉 .startnews - Start auto-send (Esana)\n` +
        `👉 .stopnews - Stop auto-send\n` +
        `👉 .getnews - Test news sources`
      );
    }
  },

  {
    name: 'get2news',
    description: 'Check Esana and Ada Derana availability',
    category: 'news',
    async run({ msg }) {
      try {
        await esana.getLatestNews();
        await adaderana.getLatestNews();
        msg.reply('✅ Esana & Ada Derana working fine!');
      } catch (err) {
        msg.reply('❌ One or more news sources may be down.');
        console.error(err);
      }
    }
  },

  {
    name: 'newson',
    description: 'Start auto-sending Esana news every 10 minutes',
    category: 'news',
    async run({ msg, sock }) {
      const jid = msg.from;
      if (autoSendMap[jid]) return msg.reply('🔁 Already sending auto-news.');

      msg.reply('✅ Auto Esana news updates started every 10 mins.');
      autoSendMap[jid] = setInterval(async () => {
        try {
          const latest = await esana.getLatestNews();
          const news = latest[0];
          const caption = `📰 *${news.title}*\n\n${news.description}\n\n🔗 ${news.url}`;
          await sock.sendMessage(jid, {
            image: { url: news.thumbnail },
            caption,
          });
        } catch (err) {
          console.error('Auto-send error:', err);
        }
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
      msg.reply('🛑 Auto news updates stopped.');
    }
  }
];
