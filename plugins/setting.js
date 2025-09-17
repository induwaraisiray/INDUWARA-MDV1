const { settings, saveConfig } = require("../config");

module.exports = {
  command: "config",
  info: "Change bot configuration dynamically",
  async run(m, { args }) {
    if (!args[0]) {
      return m.reply(
        `⚙️ Current Config:\n\n${Object.entries(settings)
          .map(([k, v]) => `${k} = ${v}`)
          .join("\n")}\n\nUsage: .config OPTION VALUE`
      );
    }

    const option = args[0].toUpperCase();
    const value = args[1] ? args[1].toLowerCase() : null;

    if (!settings.hasOwnProperty(option)) {
      return m.reply("❌ Invalid option!");
    }

    if (!value) {
      return m.reply(`ℹ️ Current value of ${option} = ${settings[option]}`);
    }

    settings[option] = value;
    saveConfig();

    return m.reply(`✅ Config Updated:\n${option} = ${value}`);
  }
};
