const fs = require("fs");

let settings = {
  SESSION_ID: process.env.SESSION_ID || "default-session",
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
  AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || ".✓",
  PREFIX: process.env.PREFIX || ".",
  CUSTOM_REACT: process.env.CUSTOM_REACT || "true",
  DELETE_LINKS: process.env.DELETE_LINKS || "false",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "94740544995",
  READ_MESSAGE: process.env.READ_MESSAGE || "true",
  AUTO_REACT: process.env.AUTO_REACT || "false",
  ANTI_BAD: process.env.ANTI_BAD || "true",
  MODE: process.env.MODE || "public",
  ANTI_LINK: process.env.ANTI_LINK || "false",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
  PUBLIC_MODE: process.env.PUBLIC_MODE || "true",
  AUTO_TYPING: process.env.AUTO_TYPING || "true",
  READ_CMD: process.env.READ_CMD || "false",
  DEV: process.env.DEV || "923427582273",
  ANTI_VV: process.env.ANTI_VV || "true",
  ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log", 
  AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
};

// Save settings to config.env
function saveConfig() {
  let content = "";
  for (let key in settings) {
    content += `${key}=${settings[key]}\n`;
  }
  fs.writeFileSync("config.env", content);
}

module.exports = {
  settings,
  saveConfig
};
