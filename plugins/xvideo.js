const config = require('../config');
const {cmd , commands} = require('../command');
const { fetchJson } = require('../lib/functions')

cmd({
    pattern: "xvid",
    alias: ["xvideo"],
    use: '.xvid <query>',
    react: "🔞",
    desc: "xnxx video search & download",
    category: "download",
    filename: __filename
}, async (messageHandler, context, quotedMessage, { from, q, reply }) => {
    try {
        if (!q) return reply('⭕ *Please Provide Search Terms.*');

        // SEARCH API
        let res = await fetchJson(`https://api.vreden.my.id/api/xnxxsearch?query=${q}`);
        console.log(res); // Debugging (structure balanna)

        if (!res || !res.result || res.result.length === 0) {
            return reply("⭕ *I Couldn't Find Anything 🙄*");
        }

        const data = res.result.slice(0, 10);

        let message = `*🔞 QUEEN NETHU MD XNXX DOWNLOADER 🔞*\n\n`;
        let options = '';

        data.forEach((v, index) => {
            options += `${index + 1}. *${v.title}*\n\n`;
        });

        message += options;
        message += `> ⚜️ _𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝_ *- :* *_SL NETHU MAX_ ᵀᴹ*\n\n`;

        const sentMessage = await messageHandler.sendMessage(from, {
            image: { url: `https://i.ibb.co/ntvzPr8/s-Wuxk4b-KHr.jpg` },
            caption: message
        }, { quoted: quotedMessage });

        session[from] = {
            searchResults: data,
            messageId: sentMessage.key.id,
        };

        const handleUserReply = async (update) => {
            const userMessage = update.messages[0];

            if (!userMessage.message.extendedTextMessage ||
                userMessage.message.extendedTextMessage.contextInfo.stanzaId !== sentMessage.key.id) {
                return;
            }

            const userReply = userMessage.message.extendedTextMessage.text.trim();
            const videoIndexes = userReply.split(',').map(x => parseInt(x.trim()) - 1);

            for (let index of videoIndexes) {
                if (isNaN(index) || index < 0 || index >= data.length) {
                    return reply("⭕ *Please Enter Valid Numbers From The List.*");
                }
            }

            for (let index of videoIndexes) {
                const selectedVideo = data[index];

                try {
                    // DOWNLOAD API
                    let downloadRes = await fetchJson(`https://api.vreden.my.id/api/xnxxdl?query=${selectedVideo.link}`);
                    let videoUrl = downloadRes.result?.files?.high || downloadRes.result?.files?.low;

                    if (!videoUrl) {
                        return reply(`⭕ *Failed To Fetch Video* for "${selectedVideo.title}".`);
                    }

                    await messageHandler.sendMessage(from, {
                        video: { url: videoUrl },
                        caption: `${selectedVideo.title}\n\n> ⚜️ _𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝_ *- :* *_SL NETHU MAX_ ᵀᴹ*`
                    });

                } catch (err) {
                    console.error(err);
                    return reply(`⭕ *An Error Occurred While Downloading "${selectedVideo.title}".*`);
                }
            }

            delete session[from];
        };

        messageHandler.ev.on("messages.upsert", handleUserReply);

    } catch (error) {
        console.error(error);
        await messageHandler.sendMessage(from, { text: '⭕ *Error Occurred During The Process!*' }, { quoted: quotedMessage });
    }
});
