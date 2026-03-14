const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { readEcon, writeEcon, ensureUser, formatMoney } = require("../../lib/economy");
const { readPets, writePets, getUserPets, findPet } = require("../../lib/pets");

module.exports = {
  name: "petrevive",
  category: "Pets",
  aliases: ["petrelive"],

  async execute(message, args) {
    const data = readPets(message.guild.id);
    const pets = getUserPets(data, message.author.id);
    const deadPets = pets.filter((p) => !p.alive);

    if (!deadPets.length) return message.reply("❌ You have no dead pets.");

    const petId = args[0];
    if (!petId) {
      const menu = new StringSelectMenuBuilder()
        .setCustomId(`petrevive:${message.author.id}`)
        .setPlaceholder("Choose a pet to revive")
        .addOptions(
          deadPets.slice(0, 25).map((p) => ({
            label: `${p.nickname} (${p.type})`,
            value: p.id,
            description: `Level ${p.level}`,
          }))
        );

      return message.reply({
        content: "✨ Choose a pet to revive:",
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    const pet = findPet(data, message.author.id, petId);
    if (!pet) return message.reply("❌ Pet not found.");
    if (pet.alive) return message.reply("✅ That pet is already alive.");

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const cost = 250;
    if (u.wallet < cost) {
      return message.reply(`❌ You need **$${formatMoney(cost)}** to revive that pet.`);
    }

    u.wallet -= cost;
    pet.alive = true;
    pet.deadAt = 0;
    pet.hp = Math.max(25, Math.floor(pet.maxHp / 2));
    pet.food = Math.max(25, pet.food);
    pet.water = Math.max(25, pet.water);

    writeEcon(message.guild.id, econ);
    writePets(message.guild.id, data);

    return message.reply(`✨ Revived **${pet.nickname}** for **$${formatMoney(cost)}**.`);
  },
};
