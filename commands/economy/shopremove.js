const { PermissionFlagsBits } = require("discord.js");
const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "shopremove",
  category: "Economy",

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
      return message.reply("❌ Admin only.");

    const item = args[0];
    if (!item) return message.reply("Usage: !shopremove <item>");

    const data = readEconomy(message.guild.id);

    data.shop = data.shop.filter(i => i.name !== item);

    writeEconomy(message.guild.id, data);

    message.reply(`🗑 Removed **${item}** from the shop`);
  },
};
