const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

module.exports = {
  name: "purge",
  category: "Moderation",
  aliases: ["clear"],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("❌ You do not have permission to purge messages.");
    }

    const amount = Number(args[0]);
    const reason = args.slice(1).join(" ").trim() || "No reason provided";

    if (!Number.isInteger(amount) || amount < 1 || amount > 100) {
      return message.reply("❌ Give an amount between 1 and 100.");
    }

    const deleted = await message.channel.bulkDelete(amount, true).catch(() => null);
    if (!deleted) {
      return message.reply("❌ I couldn’t delete messages (permissions or messages too old).");
    }

    const cfg = getConfig(message.guild.id);
    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `🧹 **Purge** — ${deleted.size} messages in #${message.channel.name}\nBy: ${message.author.tag}\nReason: ${reason}`,
    });

    const reply = await message.channel.send(`✅ Deleted **${deleted.size}** messages.`);
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  },
};
