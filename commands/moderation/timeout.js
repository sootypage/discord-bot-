const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

function parseDuration(input) {
  // supports: 10m, 2h, 3d, 30s
  const m = /^(\d+)\s*([smhd])$/i.exec(input);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  const ms = n * mult;
  // Discord max timeout is 28 days
  if (ms < 1000 || ms > 28 * 86_400_000) return null;
  return ms;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName("user").setDescription("User to timeout").setRequired(true))
    .addStringOption(opt => opt.setName("duration").setDescription("e.g. 10m, 2h, 3d").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const durationStr = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: "❌ I can’t find that member.", ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: "❌ I can’t timeout that user (role hierarchy / permissions).", ephemeral: true });

    const ms = parseDuration(durationStr);
    if (!ms) {
      return interaction.reply({ content: "❌ Invalid duration. Use like `10m`, `2h`, `3d` (max 28d).", ephemeral: true });
    }

    await member.timeout(ms, reason);

    const cfg = getConfig(interaction.guildId);
    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `⏳ **Timeout** — ${user.tag} (${user.id})\nBy: ${interaction.user.tag}\nDuration: ${durationStr}\nReason: ${reason}`
    });

    await interaction.reply({ content: `✅ Timed out ${user.tag} for ${durationStr}`, ephemeral: true });
  },
};