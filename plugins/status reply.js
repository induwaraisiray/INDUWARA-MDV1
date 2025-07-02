import translate from "@vitalets/google-translate-api";
import fetch from "node-fetch";

let handler = async (m, { conn }) => {
  try {
    const caption =
      m.message?.ephemeralMessage?.message?.imageMessage?.caption ||
      m.message?.ephemeralMessage?.message?.videoMessage?.caption;

    if (caption) {
      // call your GPT API
      let res = await fetch(`https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(caption)}`);
      let json = await res.json();

      console.log("API English reply:", json.reply);

      // translate to Sinhala
      let translated = await translate(json.reply, { to: "si" });

      console.log("Sinhala reply:", translated.text);

      // send reply
      await conn.sendMessage(m.key.remoteJid, { text: translated.text });
    }
  } catch (e) {
    console.error("ai-status plugin error", e);
  }
};

handler.command = []; // no command
handler.customPrefix = /.*/; // match everything
handler.before = async function (m) {
  const isStatus =
    m.message?.ephemeralMessage?.message?.imageMessage?.caption ||
    m.message?.ephemeralMessage?.message?.videoMessage?.caption;

  if (isStatus) {
    await handler(m, { conn: this });
  }
};
handler.tags = ["ai"];
handler.disabled = false;

export default handler;
