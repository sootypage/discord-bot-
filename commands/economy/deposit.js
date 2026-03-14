const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "deposit",
  category: "Economy",
  aliases: ["dep"],

  async execute(message, args) {
    const amount = Number(args[0]);

    if (!Number.isInteger(amount) || amount < 0) {
      return message.reply("❌ Use `!deposit <amount>` or `!deposit 0` for all.");
    }

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const toDeposit = amount === 0 ? u.wallet : amount;
    if (toDeposit <= 0) return message.reply("❌ Nothing to deposit.");
    if (u.wallet < toDeposit) {
      return message.reply(`❌ Not enough wallet funds. Wallet: **$${formatMoney(u.wallet)}**`);
    }

    u.wallet = clampMoney(u.wallet - toDeposit);
    u.bank = clampMoney(u.bank + toDeposit);
    writeEcon(message.guild.id, econ);

    await message.reply(`🏦 Deposited **$${formatMoney(toDeposit)}**.\nWallet: **$${formatMoney(u.wallet)}** | Bank: **$${formatMoney(u.bank)}**`);
  },
};
