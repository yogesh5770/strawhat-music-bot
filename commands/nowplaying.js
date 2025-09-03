const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show information about the currently playing song'),
  
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        content: '❌ There is nothing playing right now!',
        ephemeral: true
      });
    }

    const song = queue.songs[0];
    const progressBar = createProgressBar(queue.currentTime, song.duration);

    const embed = new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle('🎵 Now Playing')
      .setDescription(`**${song.name}**`)
      .addFields(
        {
          name: 'Duration',
          value: `${formatTime(queue.currentTime)} / ${song.formattedDuration}`,
          inline: true
        },
        {
          name: 'Requested by',
          value: song.user.tag,
          inline: true
        },
        {
          name: 'Progress',
          value: progressBar,
          inline: false
        }
      )
      .setThumbnail(song.thumbnail)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

function createProgressBar(current, total) {
  const progress = Math.round((current / total) * 20);
  const emptyProgress = 20 - progress;
  const progressText = '▰'.repeat(progress);
  const emptyProgressText = '▱'.repeat(emptyProgress);
  return progressText + emptyProgressText;
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
} 