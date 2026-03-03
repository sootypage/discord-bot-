async function sendModLog({ guild, channelId, content, embeds }) {
  if (!channelId) return;
  const ch = guild.channels.cache.get(channelId);
  if (!ch) return;
  try {
    await ch.send({ content, embeds });
  } catch {
    // ignore logging failures
  }
}

module.exports = { sendModLog };