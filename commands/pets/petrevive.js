const { readEcon, writeEcon, ensureUser, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "petrevive",
  category: "Pets",
  aliases: ["petrelive"],

  async execute(message) {
    const data = readEcon(message.guild.id);
    const u = ensureUser(data, message.author.id);

    if (!u.pet) return message.reply("❌ You do not have a pet.");
    if (u.pet.alive) return message.reply("✅ Your pet is already alive.");

    const cost = 250;
    if (u.wallet < cost) {
      return message.reply(`❌ You need **${formatMoney(cost)}** coins to revive your pet.`);
    }

    u.wallet -= cost;
    u.pet.alive = true;
    u.pet.hp = Math.max(25, Math.floor((u.pet.maxHp || 100) / 2));
    u.pet.food = Math.max(25, u.pet.food || 0);
    u.pet.water = Math.max(25, u.pet.water || 0);

    writeEcon(message.guild.id, data);

    return message.reply(
      `✨ Your **${u.pet.type}** has been revived for **${formatMoney(cost)}** coins.\nHP: **${u.pet.hp}/${u.pet.maxHp}**`
    );
  },
};
