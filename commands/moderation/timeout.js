const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

function parseDuration(input) {
  const m = /^(\d+)\s*([smhd])$/i.exec(input || "");
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
  const ms = n * mult;
  if (ms < 1000 || ms > 28 * 86400000) return null;
  return ms;
}

module.exports = {
  name: "timeout",
  category: "Moderation",
  aliases: ["mute"],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ You do not have permission to timeout members.");
    }

    const user = message.mentions.users.first();
    const durationStr = args[1];
    const reason = args.slice(2).join(" ").trim() || "No reason provided";

    if (!user) return message.reply("❌ Mention a user to timeout.");
    if (!durationStr) return message.reply("❌ Use `!timeout @user 10m [reason]`.");

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return message.reply("❌ I can’t find that member.");
    if (!member.moderatable) return message.reply("❌ I can’t timeout that user (role hierarchy / permissions).");

    const ms = parseDuration(durationStr);
    if (!ms) {
      return message.reply("❌ Invalid duration. Use like `10m`, `2h`, `3d` (max 28d).");
    }

    await member.timeout(ms, reason);

    const cfg = getConfig(message.guild.id);
    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `⏳ **Timeout** — ${user.tag} (${user.id})\nBy: ${message.author.tag}\nDuration: ${durationStr}\nReason: ${reason}`,
    });

    await message.reply(`✅ Timed out ${user.tag} for ${durationStr}`);
  },
};
