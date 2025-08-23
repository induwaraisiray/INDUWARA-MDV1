const { cmd } = require('../command');
const axios = require("axios");
const mime = require("mime-types");

cmd(
  {
    pattern: "mediafire",
    alias: ["mfire"],
    desc: "To download MediaFire files.",
    react: "Ⓜ️",
    category: "download",
    filename: __filename,
  },
  async (conn, m, args) => {
    const url = args[0];
    if (!url) {
      return await conn.sendMessage(m.chat, {
        text: "🔗 Please give me a valid MediaFire URL!\n\nExample:\n.mfire https://www.mediafire.com/file/xxxx/file",
      });
    }

    try {
      // 1. Call the API
      const api = `https://supun-md-api-xmjh.vercel.app/api/mfire2?url=${encodeURIComponent(
        url
      )}`;
      const { data } = await axios.get(api, { timeout: 60000 });

      // 2. Extract info
      const fileName =
        data?.data?.filename || data?.filename || "mediafire-file";
      const fileSize =
        data?.data?.size || data?.size || "unknown";
      const directLink =
        data?.data?.link || data?.data?.direct || data?.direct || data?.url;

      if (!directLink) {
        return await conn.sendMessage(m.chat, {
          text: "❌ Couldn't fetch direct link from MediaFire API.",
        });
      }

      // 3. Convert fileSize string to bytes
      function toBytes(sizeStr) {
        if (!sizeStr) return 0;
        const match = sizeStr.match(/([\d.]+)\s*([KMG]?B)/i);
        if (!match) return 0;
        const val = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        if (unit === "KB") return val * 1024;
        if (unit === "MB") return val * 1024 * 1024;
        if (unit === "GB") return val * 1024 * 1024 * 1024;
        return val;
      }

      const sizeBytes = toBytes(fileSize);
      const MAX_BYTES = 100 * 1024 * 1024; // 100MB

      // 4. If bigger than 100MB → send link only
      if (sizeBytes > MAX_BYTES) {
        return await conn.sendMessage(m.chat, {
          text:
            `⚠️ File is too large to upload (>${100}MB).\n\n` +
            `*File:* ${fileName}\n*Size:* ${fileSize}\n\n` +
            `⬇️ Direct Download:\n${directLink}`,
        });
      }

      // 5. Download + send file as document (FIXED)
      const response = await axios.get(directLink, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data, "binary");
      const mimeType = mime.lookup(fileName) || "application/octet-stream";

      await conn.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: fileName,
          mimetype: mimeType,
          caption:
            `✅ *MediaFire Downloader*\n\n` +
            `*File:* ${fileName}\n` +
            `*Size:* ${fileSize}`,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("MediaFire error:", err.message);
      await conn.sendMessage(m.chat, {
        text: "❌ Error fetching MediaFire file.\nReason: " + err.message,
      });
    }
  }
);
