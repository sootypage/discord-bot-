const { readEcon, writeEcon, ensureUser, formatMoney } = require("../../lib/economy");
const { readPets, writePets, ensureUserPets, getPetTypes, createPet } = require("../../lib/pets");

module.exports = {
  name: "petsbuy",
  category: "Pets",
  aliases: ["petbuy", "buypet"],

  async execute(message, args) {
    const type = String(args[0] || "").toLowerCase();
    const nickname = args.slice(1).join(" ").trim();
    const petTypes = getPetTypes();

    if (!petTypes[type]) {
      return message.reply("Usage: `!petsbuy <dog|cat|dragon> [nickname]`");
    }

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const petsData = readPets(message.guild.id);
    ensureUserPets(petsData, message.author.id);

    const price = petTypes[type].price;
    if (u.wallet < price) {
      return message.reply(`❌ You need **$${formatMoney(price)}** to buy that pet.`);
    }

    u.wallet -= price;
    const pet = createPet(type, nickname);
    petsData.users[message.author.id].pets.push(pet);

    writeEcon(message.guild.id, econ);
    writePets(message.guild.id, petsData);

    return message.reply(
      `🐾 You bought a **${type}** named **${pet.nickname}** for **$${formatMoney(price)}**.`
    );
  },
};
