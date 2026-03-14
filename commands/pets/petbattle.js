const { readEcon, writeEcon, ensureUser } = require("../../lib/economy");

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
  aliases: ["petfight", "petbuttle"],

  async execute(message) {
    const opponent = message.mentions.users.first();
    if (!opponent) return message.reply("Usage: !petbattle @user");
    if (opponent.id === message.author.id) return message.reply("❌ You cannot battle yourself.");

    const data = readEcon(message.guild.id);
    const u1 = ensureUser(data, message.author.id);
    const u2 = ensureUser(data, opponent.id);

    if (!u1.pet) return message.reply("❌ You do not have a pet.");
    if (!u2.pet) return message.reply("❌ That user does not have a pet.");
    if (!u1.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");
    if (!u2.pet.alive) return message.reply("💀 That user's pet is dead.");

    const p1Power =
      (u1.pet.level || 1) * 10 +
      (u1.pet.hp || 0) +
      Math.floor(Math.random() * 30);

    const p2Power =
      (u2.pet.level || 1) * 10 +
      (u2.pet.hp || 0) +
      Math.floor(Math.random() * 30);

    let result = "";

    if (p1Power >= p2Power) {
      u1.pet.wins = (u1.pet.wins || 0) + 1;
      u2.pet.losses = (u2.pet.losses || 0) + 1;
      u1.pet.xp = (u1.pet.xp || 0) + 25;
      u2.pet.hp = Math.max(0, (u2.pet.hp || 0) - 20);
      if (u2.pet.hp <= 0) u2.pet.alive = false;

      levelUpPet(u1.pet);

      result =
        `🏆 **${message.author.username}'s ${u1.pet.type}** won!\n` +
        `${opponent.username}'s pet HP: **${u2.pet.hp}/${u2.pet.maxHp}**`;
    } else {
      u2.pet.wins = (u2.pet.wins || 0) + 1;
      u1.pet.losses = (u1.pet.losses || 0) + 1;
      u2.pet.xp = (u2.pet.xp || 0) + 25;
      u1.pet.hp = Math.max(0, (u1.pet.hp || 0) - 20);
      if (u1.pet.hp <= 0) u1.pet.alive = false;

      levelUpPet(u2.pet);

      result =
        `💀 **${opponent.username}'s ${u2.pet.type}** won!\n` +
        `Your pet HP: **${u1.pet.hp}/${u1.pet.maxHp}**`;
    }

    writeEcon(message.guild.id, data);
    return message.reply(result);
  },
};
