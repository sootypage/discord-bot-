const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show commands by category"),

  async execute(interaction) {
    const cats = Array.from(interaction.client.commandCategories.keys()).sort();

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_category_select")
      .setPlaceholder("Choose a command category…")
      .addOptions(
        cats.slice(0, 25).map((c) => ({
          label: c,
          value: c,
          description: `${(interaction.client.commandCategories.get(c) || []).length} commands`,
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription(
        "Pick a category from the dropdown to see commands.\n\n" +
        "📈 **Leveling:** You gain XP by chatting (1 XP gain per minute cooldown). Use `/rank` and `/leaderboard-level`.\n" +
        "🎫 **Tickets:** Use the ticket panel dropdown to open tickets.\n" +
        "💰 **Economy:** Use `/daily`, `/work`, `/shop`, etc."
      );

    await interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
  },
};