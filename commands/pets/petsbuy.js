const { readEconomy, writeEconomy } = require("../../lib/economy");

const PETS = {
  dog: { price: 500, hp: 100, food: 100, water: 100, xp: 0, level: 1 },
  cat: { price: 450, hp: 90, food: 100, water: 100, xp: 0, level: 1 },
  dragon: { price: 5000, hp: 250, food: 100, water: 100, xp: 0, level: 1 },
};

module.exports = {
  name: "petsbuy",
  category: "Pets",
  aliases: ["buypet", "petbuy"],

  async execute(message, args) {
    const type = String(args[0] || "").toLowerCase();

    if (!type || !PETS[type]) {
      return message.reply(
        "Usage: !petsbuy <pet>\nAvailable pets: dog, cat, dragon"
      );
    }

    const data = readEconomy(message.guild.id);
    if (!data.users) data.users = {};

    if (!data.users[message.author.id]) {
      data.users[message.author.id] = {
        balance: 0,
        bank: 0,
        inventory: [],
      };
    }

    const user = data.users[message.author.id];

    if (user.pet) {
      return message.reply("❌ You already have a pet.");
    }

    const petTemplate = PETS[type];
    if ((user.balance || 0) < petTemplate.price) {
      return message.reply(
        `❌ You need **${petTemplate.price}** coins to buy a **${type}**.`
      );
    }

    user.balance -= petTemplate.price;
    user.pet = {
      name: type,
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
    };

    writeEconomy(message.guild.id, data);

    return message.reply(
      `🐾 You bought a **${type}** for **${petTemplate.price}** coins.`
    );
  },
};
