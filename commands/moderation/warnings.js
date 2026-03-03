const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName("user").setDescription("User to view").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const cfg = getConfig(interaction.guildId);

    const list = (cfg.warnings && cfg.warnings[user.id]) ? cfg.warnings[user.id] : [];
    if (list.length === 0) {
      return interaction.reply({ content: `✅ ${user.tag} has no warnings.`, ephemeral: true });
    }

    const lines = list.slice(-10).map((w, i) => {
      const d = new Date(w.at).toLocaleString();
      return `${list.length - (Math.min(10, list.length) - 1 - i)}. ${d} — ${w.reason} (by <@${w.by}>)`;
    });

    await interaction.reply({
      content: `⚠️ **Warnings for ${user.tag}** (showing last ${Math.min(10, list.length)} of ${list.length})\n` +
        "```" + lines.join("\n") + "```",
      ephemeral: true
    });
  },
};