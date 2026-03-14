const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney, findShopItem, removeItem } = require("../../lib/economy");

const SELL_RATE = 0.5;

module.exports = {
  name: "sell",
  category: "Economy",
  aliases: [],

  async execute(message, args) {
    const itemId = String(args[0] || "").toLowerCase();
    const qty = Number(args[1] || 1);

    if (!itemId) return message.reply("❌ Use `!sell <item_id> [qty]`.");
    if (!Number.isInteger(qty) || qty < 1) {
      return message.reply("❌ Quantity must be a whole number above 0.");
    }

    const item = findShopItem(itemId);
    if (!item) return message.reply("❌ Unknown item id.");

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    if (!removeItem(u, item.id, qty)) {
      return message.reply(`❌ You don’t have ${qty}x of that item.`);
    }

    const refund = Math.floor(item.price * qty * SELL_RATE);
    u.wallet = clampMoney(u.wallet + refund);
    writeEcon(message.guild.id, econ);

    await message.reply(`✅ Sold **${qty}x ${item.name}** for **$${formatMoney(refund)}**. Wallet: **$${formatMoney(u.wallet)}**`);
  },
};
