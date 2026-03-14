const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  name: "help",
  category: "Basic",
  aliases: ["commands"],

  async execute(message, args, client) {
    const cats = Array.from(client.commandCategories.keys()).sort();

    if (!cats.length) {
      return message.reply("No command categories were found.");
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("help_category_select")
      .setPlaceholder("Choose a command category...")
      .addOptions(
        cats.slice(0, 25).map((c) => ({
          label: c,
          value: c,
          description: `${(client.commandCategories.get(c) || []).length} commands`,
        }))
      );

    const prefix = process.env.PREFIX || "!";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📖 Help Menu")
      .setDescription(
        `My prefix is \`${prefix}\`\n\n` +
        "Pick a category from the dropdown to see commands.\n\n" +
        "📈 **Leveling:** You gain XP by chatting.\n" +
        `Use \`${prefix}rank\` and \`${prefix}leaderboard\`.\n\n` +
        "🎫 **Tickets:** Use the ticket panel dropdown to open tickets.\n\n" +
        "💰 **Economy:** Use commands like " +
        `\`${prefix}daily\`, \`${prefix}work\`, \`${prefix}shop\`.`
      )
      .setFooter({ text: "Choose a category below" });

    await message.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });
  },
};
