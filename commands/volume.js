const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the music volume (0-100)')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Volume level (0-100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)),
  
  async execute(interaction, client) {
    const volume = interaction.options.getInteger('level');
    const queue = client.distube.getQueue(interaction.guildId);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ You need to be in a voice channel to use this command!',
        ephemeral: true
      });
    }

    if (!queue) {
      return interaction.reply({
        content: '❌ There is nothing playing right now!',
        ephemeral: true
      });
    }

    try {
      queue.setVolume(volume);
      
      const embed = new EmbedBuilder()
        .setColor(0x4ECDC4)
        .setTitle('🔊 Volume Changed')
        .setDescription(`Volume has been set to **${volume}%**`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Volume command error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('❌ Error')
        .setDescription('Failed to change the volume.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
}; 