const { readLevels, ensureUser } = require("../../lib/leveling");

module.exports = {
  name: "rank",
  category: "Leveling",
  aliases: ["level"],

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const data = readLevels(message.guild.id);
    const u = ensureUser(data, user.id);

    await message.reply(
      `📊 **${user.tag}**\n` +
      `Level: **${u.level}**\n` +
      `XP: **${u.xp}**`
    );
  },
};
