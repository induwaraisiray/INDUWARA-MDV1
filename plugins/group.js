const { cmd } = require('../command');

/*
 ────────────── BLOCK USER ──────────────
*/
cmd({
    pattern: "block",
    react: "⚠️",
    alias: ["banuser"], // changed to avoid conflict
    desc: "Block a user instantly.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { quoted, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");

        const target = quoted ? quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Please reply or mention the user to block!");

        await robin.updateBlockStatus(target, "block");
        return reply(`✅ Successfully blocked: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Block Error:", e);
        return reply(`❌ Failed to block the user. Error: ${e.message}`);
    }
});


/*
 ────────────── KICK USER ──────────────
*/
cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const target = quoted ? quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Please reply or mention the user to kick!");

        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);

        if (groupAdmins.includes(target)) {
            return reply("⚠️ I cannot remove another admin!");
        }

        await robin.groupParticipantsUpdate(from, [target], { action: "remove" });
        return reply(`✅ Successfully removed: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Kick Error:", e);
        reply(`❌ Failed to remove the user. Error: ${e.message}`);
    }
});


/*
 ────────────── LEAVE GROUP ──────────────
*/
cmd({
    pattern: "left",
    alias: ["leave", "exit"],
    react: "⚠️",
    desc: "Leave the current group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");

        await robin.groupLeave(from);
        console.log(`✅ Successfully left the group: ${from}`);
    } catch (e) {
        console.error("Leave Error:", e);
        reply(`❌ Failed to leave the group. Error: ${e.message}`);
    }
});


/*
 ────────────── MUTE GROUP ──────────────
*/
cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    react: "⚠️",
    desc: "Set group chat to admin-only messages.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "announcement");
        return reply("✅ Group has been muted. Only admins can send messages now!");
    } catch (e) {
        console.error("Mute Error:", e);
        reply(`❌ Failed to mute the group. Error: ${e.message}`);
    }
});


/*
 ────────────── UNMUTE GROUP ──────────────
*/
cmd({
    pattern: "unmute",
    alias: ["unlock"],
    react: "⚠️",
    desc: "Allow everyone to send messages in the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ This command is only for group admins!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "not_announcement");
        return reply("✅ Group has been unmuted. Everyone can send messages now!");
    } catch (e) {
        console.error("Unmute Error:", e);
        reply(`❌ Failed to unmute the group. Error: ${e.message}`);
    }
});


/*
 ────────────── ADD USER ──────────────
*/
cmd({
    pattern: "add",
    alias: ["invite"],
    react: "➕",
    desc: "Add a user to the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        if (!args[0]) return reply("⚠️ Please provide the phone number of the user to add!");

        const target = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;
        await robin.groupParticipantsUpdate(from, [target], { action: "add" });

        return reply(`✅ Successfully added: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Add Error:", e);
        reply(`❌ Failed to add the user. Error: ${e.message}`);
    }
});


/*
 ────────────── DEMOTE USER ──────────────
*/
cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⚠️",
    desc: "Remove admin privileges from a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const target = quoted ? quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Please reply or mention the user to demote!");

        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);

        if (!groupAdmins.includes(target)) {
            return reply("⚠️ The mentioned user is not an admin!");
        }

        await robin.groupParticipantsUpdate(from, [target], { action: "demote" });
        return reply(`✅ Successfully removed admin privileges from: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Demote Error:", e);
        reply(`❌ Failed to remove admin privileges. Error: ${e.message}`);
    }
});


/*
 ────────────── PROMOTE USER ──────────────
*/
cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    react: "⚡",
    desc: "Grant admin privileges to a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const target = quoted ? quoted.sender : m.mentionedJid[0];
        if (!target) return reply("⚠️ Please reply or mention the user to promote!");

        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(p => p.admin).map(a => a.id);

        if (groupAdmins.includes(target)) {
            return reply("⚠️ The mentioned user is already an admin!");
        }

        await robin.groupParticipantsUpdate(from, [target], { action: "promote" });
        return reply(`✅ Successfully promoted @${target.split('@')[0]} to admin!`);
    } catch (e) {
        console.error("Promote Error:", e);
        reply(`❌ Failed to promote the user. Error: ${e.message}`);
    }
});
