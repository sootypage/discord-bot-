const { readLevels } = require("../../lib/leveling");

module.exports = {
  name: "leaderboard",
  category: "Leveling",
  aliases: ["leaderboard-level", "leveltop", "xptop"],

  async execute(message) {
    const data = readLevels(message.guild.id);
    const users = data.users || {};

    const sorted = Object.entries(users)
      .sort((a, b) => {
        const levelDiff = (b[1].level || 0) - (a[1].level || 0);
        if (levelDiff !== 0) return levelDiff;
        return (b[1].xp || 0) - (a[1].xp || 0);
      })
      .slice(0, 10);

    if (sorted.length === 0) {
      return message.reply("No level data yet.");
    }

    const lines = sorted.map(([id, u], i) => `${i + 1}. <@${id}> — Level ${u.level} (${u.xp} XP)`);
    await message.reply(`🏆 **Level Leaderboard**\n\`\`\`\n${lines.join("\n")}\n\`\`\``);
  },
};
