const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a number of messages from this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName("amount").setDescription("1-100").setMinValue(1).setMaxValue(100).setRequired(true)
    )
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    // must be done fast for interactions; also requires bot perms
    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);
    if (!deleted) return interaction.editReply("❌ I couldn’t delete messages (permissions or messages too old).");

    const cfg = getConfig(interaction.guildId);
    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `🧹 **Purge** — ${deleted.size} messages in #${interaction.channel.name}\nBy: ${interaction.user.tag}\nReason: ${reason}`
    });

    await interaction.editReply(`✅ Deleted **${deleted.size}** messages.`);
  },
};