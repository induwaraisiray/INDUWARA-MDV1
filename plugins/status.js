const { cmd } = require('../command');

// Voice links (MP3s)
const voiceLinks = [
    ''https://files.catbox.moe/4i7ccz.mp3',
    'https://files.catbox.moe/c0rswx.mp3',
    'https://files.catbox.moe/hgyeth.mp3',
    'https://files.catbox.moe/lleedr.mp3',
    'https://files.catbox.moe/5q1il0.mp3',
    'https://files.catbox.moe/is3w5r.mp3',
    'https://files.catbox.moe/rmb9hb.mp3',
    'https://files.catbox.moe/94f3ah.mp3',
    'https://files.catbox.moe/r59jbk.mp3',
    'https://files.catbox.moe/vazu0l.mp3',
    'https://files.catbox.moe/ed46vg.mp3',
    'https://files.catbox.moe/3arfe3.mp3',
    'https://files.catbox.moe/6pzpfr.mp3',
    'https://files.catbox.moe/dh3724.mp3',
    'https://files.catbox.moe/u6yge7.mp3',
    'https://files.catbox.moe/ciierd.mp3',
    'https://files.catbox.moe/b05qvd.mp3',
    'https://files.catbox.moe/w4w5y4.mp3',
    'https://files.catbox.moe/21wlvr.mp3',
    'https://files.catbox.moe/lun14u.mp3',
    'https://files.catbox.moe/7g9vsa.mp3',
    'https://files.catbox.moe/jga5ad.mp3',
    'https://files.catbox.moe/pa4760.mp3',
    'https://files.catbox.moe/5w8vn2.mp3',
    'https://files.catbox.moe/n2qj1a.mp3',
    'https://files.catbox.moe/o38jkp.mp3',
    'https://files.catbox.moe/i88eyq.mp3',
    'https://files.catbox.moe/et8fcl.mp3',
    'https://files.catbox.moe/c7lks6.mp3',
    'https://files.catbox.moe/mjq16o.mp3',
    'https://files.catbox.moe/97q2ig.mp3',
    'https://files.catbox.moe/6l9ush.mp3',
    'https://files.catbox.moe/qvxtep.mp3',
    'https://files.catbox.moe/kmoy0h.mp3'
    // අනිත් ඒවාත් එකතු කරන්න
];

// Text messages list
const textMessages = [
    "👋 හෙලෝ! කොහොමද ඉන්නෙ?",
    "🤖 මම ඔයාට උදව් කරන්න කැමතියි!",
    "🎵 මෙන්න bot එකේ random voice එකක්:",
    "🛸 අපි ගමන් කරනවා...",
    "💡 Bot එක always active!",
    "🌟 හොඳ දවසක් වේවා!",
    "🚀 හැමදාම update වෙලා තියෙනවා!"
];

// Command
cmd({
    pattern: "list",
    react: "🛸",
    alias: ["✓", "list", "music"],
    desc: "Get bot's command list with random voice + message.",
    category: "main",
    use: '.menu3',
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
    try {
        // pick a random voice
        const randomVoiceLink = voiceLinks[Math.floor(Math.random() * voiceLinks.length)];

        // pick a random text message
        const randomText = textMessages[Math.floor(Math.random() * textMessages.length)];

        // send the text message first
        await conn.sendMessage(from, { 
          text: `👨🏻‍💻 *${pushname}*\n\n${randomText}` 
        });

        // then send the PTT
        await conn.sendMessage(from, { 
            audio: { url: randomVoiceLink }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        });

    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});
