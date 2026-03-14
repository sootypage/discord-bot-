const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");

module.exports = {
  name: "warnings",
  category: "Moderation",
  aliases: [],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ You do not have permission to view warnings.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mention a user to view warnings for.");

    const cfg = getConfig(message.guild.id);
    const list = cfg.warnings?.[user.id] || [];

    if (list.length === 0) {
      return message.reply(`✅ ${user.tag} has no warnings.`);
    }

    const lines = list.slice(-10).map((w, i) => {
      const d = new Date(w.at).toLocaleString();
      return `${list.length - (Math.min(10, list.length) - 1 - i)}. ${d} — ${w.reason} (by <@${w.by}>)`;
    });

    await message.reply(
      `⚠️ **Warnings for ${user.tag}** (showing last ${Math.min(10, list.length)} of ${list.length})\n` +
      "```" + lines.join("\n") + "```"
    );
  },
};
