const { PermissionFlagsBits } = require("discord.js");
const { readLevels, writeLevels } = require("../../lib/leveling");

module.exports = {
  name: "set-level-channel",
  category: "Leveling",
  aliases: ["level-channel"],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ You need Manage Server to use this command.");
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply("❌ Mention a channel. Example: `!set-level-channel #levels`.");
    }

    const data = readLevels(message.guild.id);
    data.settings ||= {};
    data.settings.levelChannelId = channel.id;
    writeLevels(message.guild.id, data);

    await message.reply(`✅ Level up messages will go to ${channel}`);
  },
};
