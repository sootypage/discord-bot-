const { readEcon, ensureUser, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "balance",
  category: "Economy",
  aliases: ["bal", "money"],

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, user.id);

    await message.reply(
      `💰 **${user.tag}**\n` +
      `Wallet: **$${formatMoney(u.wallet)}**\n` +
      `Bank: **$${formatMoney(u.bank)}**\n` +
      `Total: **$${formatMoney((u.wallet || 0) + (u.bank || 0))}**`
    );
  },
};
