const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'transfer',
  aliases: ['pay', 'give'],
  description: 'Transfer credits to another user',
  cooldown: 5,
  execute(message, args, client) {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Target')
        .setDescription('Please mention a user to transfer credits to.\n`+transfer <user> <amount>`')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    if (target.id === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Cannot Transfer to Yourself')
        .setDescription('You cannot transfer credits to yourself.')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Invalid Amount')
        .setDescription('Please provide a valid amount of credits to transfer.\n**Usage:** `+transfer @user <amount>`')
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    const result = client.db.transferCredits(message.guild.id, message.author.id, target.id, amount);

    if (!result.success) {
      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('❌ Transfer Failed')
        .setDescription(result.error)
        .setFooter({ text: `Requested by ${message.author.tag}` });
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle('✅ Transfer Complete')
      .setDescription(`You transferred **${amount.toLocaleString()}** credits to ${target}`)
      .addFields(
        { name: 'Your New Balance', value: `${client.db.getBalance(message.guild.id, message.author.id).toLocaleString()} credits`, inline: true },
        { name: `${target.username}'s New Balance`, value: `${client.db.getBalance(message.guild.id, target.id).toLocaleString()} credits`, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
