const { PermissionFlagsBits } = require("discord.js");
const { getConfig, saveConfig } = require("../../lib/config");

module.exports = {
  name: "modlog-channel",
  category: "Moderation",
  aliases: ["set-modlog"],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ You need Manage Server to use this command.");
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply("❌ Mention a channel. Example: `!modlog-channel #modlog`.");
    }

    const cfg = getConfig(message.guild.id);
    cfg.modLogChannelId = channel.id;
    saveConfig(message.guild.id, cfg);

    await message.reply(`✅ Mod log channel set to ${channel}`);
  },
};
