const responses = [
  "Yes.",
  "No.",
  "Maybe.",
  "Definitely.",
  "Absolutely not.",
  "Ask again later.",
];

module.exports = {
  name: "8ball",
  category: "Fun",
  aliases: ["eightball"],

  async execute(message, args) {
    const question = args.join(" ").trim();
    if (!question) {
      return message.reply("❌ Ask a question. Example: `!8ball Will I win?`");
    }

    const answer = responses[Math.floor(Math.random() * responses.length)];
    await message.reply(`🎱 **Question:** ${question}\n**Answer:** ${answer}`);
  },
};
