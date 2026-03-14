const { readEcon, writeEcon, ensureUser, formatMoney } = require("../../lib/economy");

const PETS = {
  dog: { price: 500, hp: 100, food: 100, water: 100, xp: 0, level: 1 },
  cat: { price: 450, hp: 90, food: 100, water: 100, xp: 0, level: 1 },
  dragon: { price: 5000, hp: 250, food: 100, water: 100, xp: 0, level: 1 },
};

module.exports = {
  name: "petsbuy",
  category: "Pets",
  aliases: ["petbuy", "buypet"],

  async execute(message, args) {
    const type = String(args[0] || "").toLowerCase();

    if (!type || !PETS[type]) {
      return message.reply("Usage: !petsbuy <dog|cat|dragon>");
    }

    const data = readEcon(message.guild.id);
    const u = ensureUser(data, message.author.id);

    if (u.pet) {
      return message.reply("❌ You already have a pet.");
    }

    const petTemplate = PETS[type];

    if (u.wallet < petTemplate.price) {
      return message.reply(
        `❌ You need **${formatMoney(petTemplate.price)}** coins to buy a **${type}**.`
      );
    }

    u.wallet -= petTemplate.price;
    u.pet = {
      type,
      hp: petTemplate.hp,
      maxHp: petTemplate.hp,
      food: petTemplate.food,
      water: petTemplate.water,
      xp: petTemplate.xp,
      level: petTemplate.level,
      alive: true,
      wins: 0,
      losses: 0,
      lastSleep: 0,
      lastFeed: 0,
      lastWater: 0,
      lastBattle: 0,
    };

    writeEcon(message.guild.id, data);

    return message.reply(
      `🐾 You bought a **${type}** for **${formatMoney(petTemplate.price)}** coins.`
    );
  },
};
