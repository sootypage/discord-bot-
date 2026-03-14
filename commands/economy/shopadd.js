const { PermissionFlagsBits } = require("discord.js");
const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "shopadd",
  category: "Economy",

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
      return message.reply("❌ Admin only.");

    const name = args[0];
    const price = Number(args[1]);

    if (!name || !price) return message.reply("Usage: !shopadd <item> <price>");

    const data = readEconomy(message.guild.id);

    if (!data.shop) data.shop = [];

    data.shop.push({ name, price });

    writeEconomy(message.guild.id, data);

    message.reply(`✅ Added **${name}** to shop for **${price} coins**`);
  },
};
