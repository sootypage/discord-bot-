const { readEconomy, writeEconomy } = require("../../lib/economy");

function draw() {
  return Math.floor(Math.random() * 11) + 1;
}

module.exports = {
  name: "blackjack",
  category: "Economy",

  async execute(message, args) {
    const bet = Number(args[0]);

    if (!bet) return message.reply("Usage: !blackjack <bet>");

    const data = readEconomy(message.guild.id);

    const user = data.users[message.author.id];

    if (!user || user.balance < bet)
      return message.reply("Not enough coins.");

    const player = draw() + draw();
    const dealer = draw() + draw();

    if (player > dealer) {
      user.balance += bet;
      message.reply(`🃏 You win! (${player} vs ${dealer})`);
    } else {
      user.balance -= bet;
      message.reply(`💀 You lose! (${player} vs ${dealer})`);
    }

    writeEconomy(message.guild.id, data);
  },
};
