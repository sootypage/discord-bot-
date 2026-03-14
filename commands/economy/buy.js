const {
  readEcon,
  writeEcon,
  ensureUser,
  clampMoney,
  formatMoney,
  findShopItem,
  addItem,
} = require("../../lib/economy");

module.exports = {
  name: "buy",
  category: "Economy",
  aliases: [],

  async execute(message, args) {
    const itemId = String(args[0] || "").toLowerCase();
    const qty = Number(args[1] || 1);

    if (!itemId) {
      return message.reply("❌ Use `!buy <item_id> [qty]`.");
    }

    if (!Number.isInteger(qty) || qty < 1) {
      return message.reply("❌ Quantity must be a whole number above 0.");
    }

    const econ = readEcon(message.guild.id);
    const item = findShopItem(econ, itemId);

    if (!item) {
      return message.reply("❌ Unknown item. Use `!shop` to see item ids.");
    }

    const u = ensureUser(econ, message.author.id);
    const cost = item.price * qty;

    if (u.wallet < cost) {
      return message.reply(
        `❌ Not enough money. Cost: **$${formatMoney(cost)}** | Wallet: **$${formatMoney(u.wallet)}**`
      );
    }

    u.wallet = clampMoney(u.wallet - cost);
    addItem(u, item.id, qty);

    writeEcon(message.guild.id, econ);

    await message.reply(
      `✅ Bought **${qty}x ${item.name}** for **$${formatMoney(cost)}**. Wallet: **$${formatMoney(u.wallet)}**`
    );
  },
};
