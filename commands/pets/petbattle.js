const { readEconomy, writeEconomy } = require("../../lib/economy");

function levelUpPet(pet) {
  let needed = (pet.level || 1) * 50;
  while ((pet.xp || 0) >= needed) {
    pet.xp -= needed;
    pet.level += 1;
    pet.maxHp += 15;
    pet.hp = pet.maxHp;
    needed = pet.level * 50;
  }
}

module.exports = {
  name: "petbattle",
  category: "Pets",
  aliases: ["petfight"],

  async execute(message) {
    const opponent = message.mentions.users.first();
    if (!opponent) return message.reply("Usage: !petbattle @user");

    if (opponent.id === message.author.id) {
      return message.reply("❌ You cannot battle yourself.");
    }

    const data = readEconomy(message.guild.id);
    const user1 = data.users?.[message.author.id];
    const user2 = data.users?.[opponent.id];

    if (!user1?.pet) return message.reply("❌ You do not have a pet.");
    if (!user2?.pet) return message.reply("❌ That user does not have a pet.");

    if (!user1.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");
    if (!user2.pet.alive) return message.reply("💀 That user's pet is dead.");

    const p1Power =
      (user1.pet.level || 1) * 10 +
      (user1.pet.hp || 0) +
      Math.floor(Math.random() * 30);

    const p2Power =
      (user2.pet.level || 1) * 10 +
      (user2.pet.hp || 0) +
      Math.floor(Math.random() * 30);

    let result = "";

    if (p1Power >= p2Power) {
      user1.pet.wins = (user1.pet.wins || 0) + 1;
      user2.pet.losses = (user2.pet.losses || 0) + 1;

      user1.pet.xp = (user1.pet.xp || 0) + 25;
      user2.pet.hp = Math.max(0, (user2.pet.hp || 0) - 20);
      if (user2.pet.hp <= 0) user2.pet.alive = false;

      levelUpPet(user1.pet);

      result =
        `🏆 **${message.author.username}'s ${user1.pet.name}** won!\n` +
        `Loser HP: **${user2.pet.hp}/${user2.pet.maxHp}**`;
    } else {
      user2.pet.wins = (user2.pet.wins || 0) + 1;
      user1.pet.losses = (user1.pet.losses || 0) + 1;

      user2.pet.xp = (user2.pet.xp || 0) + 25;
      user1.pet.hp = Math.max(0, (user1.pet.hp || 0) - 20);
      if (user1.pet.hp <= 0) user1.pet.alive = false;

      levelUpPet(user2.pet);

      result =
        `💀 **${opponent.username}'s ${user2.pet.name}** won!\n` +
        `Your pet HP: **${user1.pet.hp}/${user1.pet.maxHp}**`;
    }

    writeEconomy(message.guild.id, data);
    return message.reply(result);
  },
};
