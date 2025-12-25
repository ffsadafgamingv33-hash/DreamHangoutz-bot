const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'deposit',
  description: 'Deposit credits for LTC/Dollars',
  execute(message, args, client) {
    const type = args[0]?.toLowerCase(); // ltc or dollar
    const creditAmount = parseInt(args[1]);

    if (!type || !['ltc', '$', 'dollar'].includes(type)) {
      return message.reply('❌ Usage: `+deposit <ltc/$> <credit_amount>`\nRates: 500,000 credits = 1 Ł | 300,000 credits = $1');
    }

    if (isNaN(creditAmount) || creditAmount <= 0) return message.reply('❌ Please provide a valid credit amount.');

    const balance = client.db.getBalance(message.guild.id, message.author.id);
    if (balance < creditAmount) return message.reply("❌ You don't have enough credits!");

    let rewardAmount = 0;
    let rewardSymbol = '';
    
    if (type === 'ltc') {
      rewardAmount = creditAmount / 500000;
      rewardSymbol = 'Ł';
      client.db.addLTC(message.guild.id, message.author.id, rewardAmount);
    } else {
      rewardAmount = creditAmount / 300000;
      rewardSymbol = '$';
      client.db.addDollars(message.guild.id, message.author.id, rewardAmount);
    }

    client.db.removeCredits(message.guild.id, message.author.id, creditAmount);

    const embed = new EmbedBuilder()
      .setColor('#F1C40F')
      .setTitle('💰 Deposit Successful')
      .setDescription(`Deposited **${creditAmount.toLocaleString()}** credits for **${rewardSymbol}${rewardAmount.toFixed(rewardSymbol === '$' ? 2 : 4)}**`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
