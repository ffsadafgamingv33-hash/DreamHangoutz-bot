const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ltctransfer',
  aliases: ['ltcpay', 'give_ltc'],
  description: 'Transfer LTC to another user',
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!target) return message.reply('❌ Please mention a user to transfer LTC to.');
    if (target.id === message.author.id) return message.reply('❌ You cannot transfer to yourself.');
    if (isNaN(amount) || amount <= 0) return message.reply('❌ Please provide a valid LTC amount.');

    const userLTC = client.db.getLTC(message.guild.id, message.author.id);
    if (userLTC < amount) return message.reply(`❌ You don't have enough LTC! (Balance: ${userLTC.toFixed(4)} Ł)`);

    client.db.addLTC(message.guild.id, message.author.id, -amount);
    client.db.addLTC(message.guild.id, target.id, amount);

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle('✅ LTC Transfer Complete')
      .setDescription(`Transferred **${amount.toFixed(4)} Ł** to ${target}`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
