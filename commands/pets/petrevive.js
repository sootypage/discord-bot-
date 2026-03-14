const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "petrevive",
  category: "Pets",
  aliases: ["petrelive"],

  async execute(message) {
    const data = readEconomy(message.guild.id);
    const user = data.users?.[message.author.id];

    if (!user?.pet) return message.reply("❌ You do not have a pet.");
    if (user.pet.alive) return message.reply("✅ Your pet is already alive.");

    const cost = 250;
    if ((user.balance || 0) < cost) {
      return message.reply(`❌ You need **${cost}** coins to revive your pet.`);
    }

    user.balance -= cost;
    user.pet.alive = true;
    user.pet.hp = Math.max(25, Math.floor((user.pet.maxHp || 100) / 2));
    user.pet.food = Math.max(25, user.pet.food || 0);
    user.pet.water = Math.max(25, user.pet.water || 0);

    writeEconomy(message.guild.id, data);

    return message.reply(
      `✨ Your **${user.pet.name}** has been revived for **${cost}** coins.\nHP: **${user.pet.hp}/${user.pet.maxHp}**`
    );
  },
};
