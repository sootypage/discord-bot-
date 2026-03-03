const { SlashCommandBuilder } = require("discord.js");
const { readEcon, ensureUser, getShopItems } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your inventory")
    .addUserOption((o) => o.setName("user").setDescription("User to view").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, user.id);

    const inv = u.inventory || {};
    const entries = Object.entries(inv);

    if (entries.length === 0) {
      return interaction.reply({ content: `🎒 **${user.tag}** has nothing in their inventory.`, ephemeral: true });
    }

    const shop = getShopItems();
    const nameOf = (id) => shop.find((x) => x.id === id)?.name ?? id;

    const lines = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([id, qty]) => `${nameOf(id)} (${id}) — x${qty}`);

    await interaction.reply({ content: `🎒 **${user.tag} Inventory**\n\`\`\`\n${lines.join("\n")}\n\`\`\``, ephemeral: true });
  },
};