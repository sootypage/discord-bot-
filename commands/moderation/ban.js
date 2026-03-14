const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

module.exports = {
  name: "ban",
  category: "Moderation",
  aliases: [],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ You do not have permission to ban members.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("❌ Mention a user to ban.");
    }

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    const deleteDaysRaw = args.find((a) => /^\d+$/.test(a));
    const deleteDays = Math.max(0, Math.min(7, Number(deleteDaysRaw || 0)));
    const reasonParts = args.filter((a, i) => i !== 0 && a !== deleteDaysRaw);
    const reason = reasonParts.join(" ").trim() || "No reason provided";

    if (member && !member.bannable) {
      return message.reply("❌ I can’t ban that user (role hierarchy / permissions).");
    }

    await message.guild.members.ban(user.id, {
      reason,
      deleteMessageSeconds: deleteDays * 24 * 60 * 60,
    });

    const cfg = getConfig(message.guild.id);
    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `🔨 **Ban** — ${user.tag} (${user.id})\nBy: ${message.author.tag}\nReason: ${reason}\nDelete days: ${deleteDays}`,
    });

    await message.reply(`✅ Banned ${user.tag}`);
  },
};
