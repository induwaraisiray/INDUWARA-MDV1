const config = require('../config');
const { cmd, commands } = require('../command');

// Store user cooldowns in memory
const userCooldowns = new Map();

// Auto reply messages array
const autoReplyTexts = [
    "Hello! Thanks for your message. I'll get back to you soon! 😊",
    "Hi there! I received your message. Will respond shortly! 👋",
    "Thanks for reaching out! I'll reply as soon as possible! 💫",
    "Hello! Your message is important to me. Please wait for my response! 🌟",
    "Hi! I got your message. I'll get back to you in a moment! ✨",
    "Thank you for your message! I'll respond soon! 🙏",
    "Hey! Message received. I'll reply shortly! 🚀",
    "Hello there! Thanks for contacting me. Response coming soon! 💝"
];

// Auto reply voice messages array (you can add voice file URLs or base64 encoded audio)
const autoReplyVoices = [
    "https://files.catbox.moe/bi1p2z.mp3"
    // Add more voice messages as needed
];

// Function to check if user is in cooldown
function isInCooldown(userId) {
    const lastReply = userCooldowns.get(userId);
    if (!lastReply) return false;
    
    const now = Date.now();
    const cooldownTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    return (now - lastReply) < cooldownTime;
}

// Function to set user cooldown
function setCooldown(userId) {
    userCooldowns.set(userId, Date.now());
}

// Auto reply handler for all messages
cmd({
    on: "text", // This will trigger for all text messages
    filename: __filename
},
async (conn, mek, m, { from, sender, body, isGroup, isOwner, isMe }) => {
    try {
        // Don't reply to:
        // - Bot's own messages
        // - Owner messages (optional)
        // - Group messages (you can remove this if you want group auto replies)
        // - Command messages (starting with prefix)
        if (isMe || isOwner || isGroup || body.startsWith(config.PREFIX)) {
            return;
        }

        // Check if user is in cooldown
        if (isInCooldown(sender)) {
            return; // Don't send auto reply
        }

        // Randomly choose between text and voice (50-50 chance)
        const sendVoice = Math.random() < 0.5;
        
        if (sendVoice && autoReplyVoices.length > 0) {
            // Send random voice message
            const randomVoice = autoReplyVoices[Math.floor(Math.random() * autoReplyVoices.length)];
            
            await conn.sendMessage(from, {
                audio: { url: randomVoice },
                mimetype: 'audio/mp4',
                ptt: true // This makes it a voice note
            });
        } else {
            // Send random text message
            const randomText = autoReplyTexts[Math.floor(Math.random() * autoReplyTexts.length)];
            
            await conn.sendMessage(from, {
                text: randomText,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363354023102228@newsletter',
                        newsletterName: "ᴅ-xᴛʀᴏ ᴀᴜᴛᴏ ʀᴇᴘʟʏ",
                        serverMessageId: 143
                    }
                }
            });
        }

        // Set cooldown for this user
        setCooldown(sender);

    } catch (e) {
        console.error("Error in auto reply:", e);
    }
});

// Command to check auto reply status
cmd({
    pattern: "getreply",
    desc: "Check auto reply status and cooldown",
    category: "main",
    react: "💬",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        const isInCooldownStatus = isInCooldown(sender);
        const lastReply = userCooldowns.get(sender);
        
        let statusText = "📱 *AUTO REPLY STATUS* 📱\n\n";
        
        if (isInCooldownStatus && lastReply) {
            const now = Date.now();
            const timePassed = now - lastReply;
            const cooldownTime = 10 * 60 * 1000; // 10 minutes
            const timeLeft = cooldownTime - timePassed;
            const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
            
            statusText += `🔴 *Status:* Cooldown Active\n`;
            statusText += `⏰ *Time Left:* ${minutesLeft} minutes\n`;
            statusText += `📝 *Last Reply:* ${new Date(lastReply).toLocaleTimeString()}\n\n`;
            statusText += `ℹ️ Auto reply will work again after ${minutesLeft} minutes.`;
        } else {
            statusText += `🟢 *Status:* Ready for Auto Reply\n`;
            statusText += `✅ *Next Message:* Will get auto reply\n\n`;
            statusText += `ℹ️ Send any message to get an auto reply!`;
        }
        
        await reply(statusText);
        
    } catch (e) {
        console.error("Error in getreply command:", e);
        reply(`Error: ${e.message}`);
    }
});

// Original ping command (keeping it as requested)
cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        // Ensure reaction and text emojis are different
        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Send reaction using conn.sendMessage()
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start) / 1000;

        const text = `> *D-XTRO-MD SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

        await conn.sendMessage(from, {
            text,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363354023102228@newsletter',
                    newsletterName: "ᴍʀ ᴅɪɴᴇꜱʜ ᴏꜰᴄ",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

// ping2 command (keeping it as requested)
cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "🍂",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now()
        const message = await conn.sendMessage(from, { text: '*PINGING...*' })
        const endTime = Date.now()
        const ping = endTime - startTime
        await conn.sendMessage(from, { text: `*🔥D-XTRO-MD SPEED : ${ping}ms*` }, { quoted: message })
    } catch (e) {
        console.log(e)
        reply(`${e}`)
    }
});
