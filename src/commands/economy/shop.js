const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shop',
  description: 'Browse the credit shop',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🛒 DreamHangoutz Shop')
      .setDescription('You can browse our official shop here:\n[https://dreamhangoutz.smxx.qzz.io/]')
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
