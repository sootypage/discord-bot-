const { PermissionFlagsBits } = require("discord.js");
const {
  readEcon,
  writeEcon,
  addShopItem,
  formatMoney,
} = require("../../lib/economy");

module.exports = {
  name: "shopadd",
  category: "Economy",
  aliases: [],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ Admin only.");
    }

    const id = String(args[0] || "").toLowerCase();
    const price = Number(args[1]);
    const name = args.slice(2).join(" ").trim();

    if (!id || !price || !name) {
      return message.reply("Usage: !shopadd <id> <price> <name>");
    }

    const data = readEcon(message.guild.id);

    const result = addShopItem(data, {
      id,
      name,
      price,
      description: "Custom shop item",
    });

    if (!result.ok) {
      return message.reply(`❌ ${result.error}`);
    }

    writeEcon(message.guild.id, data);

    return message.reply(
      `✅ Added **${name}** (\`${id}\`) to the shop for **${formatMoney(price)}** coins.`
    );
  },
};
