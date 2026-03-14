const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "withdraw",
  category: "Economy",
  aliases: ["with"],

  async execute(message, args) {
    const amount = Number(args[0]);

    if (!Number.isInteger(amount) || amount < 0) {
      return message.reply("❌ Use `!withdraw <amount>` or `!withdraw 0` for all.");
    }

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const toWithdraw = amount === 0 ? u.bank : amount;
    if (toWithdraw <= 0) return message.reply("❌ Nothing to withdraw.");
    if (u.bank < toWithdraw) {
      return message.reply(`❌ Not enough bank funds. Bank: **$${formatMoney(u.bank)}**`);
    }

    u.bank = clampMoney(u.bank - toWithdraw);
    u.wallet = clampMoney(u.wallet + toWithdraw);
    writeEcon(message.guild.id, econ);

    await message.reply(`🏦 Withdrew **$${formatMoney(toWithdraw)}**.\nWallet: **$${formatMoney(u.wallet)}** | Bank: **$${formatMoney(u.bank)}**`);
  },
};
