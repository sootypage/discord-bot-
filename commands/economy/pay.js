const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const TAX_RATE = 0.05;

module.exports = {
  name: "pay",
  category: "Economy",
  aliases: [],

  async execute(message, args) {
    const toUser = message.mentions.users.first();
    const amount = Number(args[toUser ? 1 : 0]);

    if (!toUser) return message.reply("❌ Mention a user. Example: `!pay @user 100`.");
    if (toUser.bot) return message.reply("❌ You can’t pay bots.");
    if (toUser.id === message.author.id) return message.reply("❌ You can’t pay yourself.");
    if (!Number.isInteger(amount) || amount < 1) {
      return message.reply("❌ Amount must be a whole number above 0.");
    }

    const fee = Math.ceil(amount * TAX_RATE);
    const totalCost = amount + fee;

    const econ = readEcon(message.guild.id);
    const from = ensureUser(econ, message.author.id);
    const to = ensureUser(econ, toUser.id);

    if (from.wallet < totalCost) {
      return message.reply(
        `❌ Not enough funds.\nYou need **$${formatMoney(totalCost)}** (amount $${formatMoney(amount)} + tax $${formatMoney(fee)}).\nYour wallet: **$${formatMoney(from.wallet)}**`
      );
    }

    from.wallet = clampMoney(from.wallet - totalCost);
    to.wallet = clampMoney(to.wallet + amount);
    writeEcon(message.guild.id, econ);

    await message.reply(
      `✅ Sent **$${formatMoney(amount)}** to **${toUser.tag}**\n` +
      `Tax: **$${formatMoney(fee)}** | Total cost: **$${formatMoney(totalCost)}**\n` +
      `Your wallet: **$${formatMoney(from.wallet)}**`
    );
  },
};
