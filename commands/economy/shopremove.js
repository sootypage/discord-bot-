const { PermissionFlagsBits } = require("discord.js");
const { readEcon, writeEcon, removeShopItem } = require("../../lib/economy");

module.exports = {
  name: "shopremove",
  category: "Economy",
  aliases: [],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Admin only.");
    }

    const id = String(args[0] || "").toLowerCase();
    if (!id) {
      return message.reply("Usage: !shopremove <id>");
    }

    const data = readEcon(message.guild.id);
    const removed = removeShopItem(data, id);

    if (!removed) {
      return message.reply("❌ That item was not found in the shop.");
    }

    writeEcon(message.guild.id, data);

    return message.reply(`🗑 Removed \`${id}\` from the shop.`);
  },
};
