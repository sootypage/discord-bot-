const { readEcon, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "eco-leaderboard",
  category: "Economy",
  aliases: ["moneytop", "balance-top"],

  async execute(message) {
    const econ = readEcon(message.guild.id);

    const rows = Object.entries(econ.users || {})
      .map(([userId, u]) => ({
        userId,
        bal: (Number(u.wallet) || 0) + (Number(u.bank) || 0),
      }))
      .sort((a, b) => b.bal - a.bal)
      .slice(0, 10);

    if (rows.length === 0) {
      return message.reply("No economy data yet. Use `!daily` or `!work`.");
    }

    const lines = rows.map((r, i) => `${i + 1}. <@${r.userId}> — $${formatMoney(r.bal)}`);
    await message.reply(`🏆 **Economy Leaderboard (Top 10)**\n\`\`\`\n${lines.join("\n")}\n\`\`\``);
  },
};
