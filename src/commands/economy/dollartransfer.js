const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: '$transfer',
  aliases: ['pay$', 'give$'],
  description: 'Transfer dollars to another user',
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseFloat(args[1]);

    if (!target) return message.reply('❌ Please mention a user to transfer dollars to.');
    if (target.id === message.author.id) return message.reply('❌ You cannot transfer to yourself.');
    if (isNaN(amount) || amount <= 0) return message.reply('❌ Please provide a valid dollar amount.');

    const userDollars = client.db.getDollars(message.guild.id, message.author.id);
    if (userDollars < amount) return message.reply(`❌ You don't have enough dollars! (Balance: $${userDollars.toFixed(2)})`);

    client.db.addDollars(message.guild.id, message.author.id, -amount);
    client.db.addDollars(message.guild.id, target.id, amount);

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Dollar Transfer Complete')
      .setDescription(`Transferred **$${amount.toFixed(2)}** to ${target}`)
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
