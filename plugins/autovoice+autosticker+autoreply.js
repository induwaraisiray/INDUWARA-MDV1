const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');

// Helper function to safely load JSON
function loadJSON(filePath) {
    try {
        if (!fs.existsSync(filePath)) return {}; // file not found
        const raw = fs.readFileSync(filePath, 'utf8');
        if (!raw.trim()) return {}; // empty file
        return JSON.parse(raw); // valid JSON
    } catch (e) {
        console.error(`⚠️ Invalid JSON in ${filePath}:`, e.message);
        return {}; // fallback to empty object
    }
}

// Auto Voice
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../data/autovoice.json');
    const data = loadJSON(filePath);
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_VOICE === 'true') {
                await conn.sendPresenceUpdate('recording', from);
                await conn.sendMessage(from, { audio: { url: data[text] }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
            }
        }
    }
});

// Auto Sticker
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../data/autosticker.json');
    const data = loadJSON(filePath);
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_STICKER === 'true') {
                await conn.sendMessage(from, { sticker: { url: data[text] }, package: 'TOHID_MD' }, { quoted: mek });
            }
        }
    }
});

// Auto Reply
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../data/autoreply.json');
    const data = loadJSON(filePath);
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_REPLY === 'true') {
                await m.reply(data[text]);
            }
        }
    }
});

// Fake Recording
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    if (config.FAKE_RECORDING === 'true') {
        await conn.sendPresenceUpdate('recording', from);
    }
});                 
