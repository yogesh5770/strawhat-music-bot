const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  
  async execute(interaction, client) {
    const sent = await interaction.deferReply({ fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(0x4ECDC4)
      .setTitle('🏓 Pong!')
      .addFields(
        {
          name: 'Bot Latency',
          value: `\`${latency}ms\``,
          inline: true
        },
        {
          name: 'API Latency',
          value: `\`${apiLatency}ms\``,
          inline: true
        }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
}; 