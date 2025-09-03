const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue'),
  
  async execute(interaction, client) {
    const queue = client.distube.getQueue(interaction.guildId);

    if (!queue) {
      return interaction.reply({
        content: '❌ There is nothing playing right now!',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x4ECDC4)
      .setTitle('🎵 Music Queue')
      .setDescription(`**Now Playing:** ${queue.songs[0].name}`)
      .addFields(
        {
          name: 'Duration',
          value: queue.songs[0].formattedDuration,
          inline: true
        },
        {
          name: 'Requested by',
          value: queue.songs[0].user.tag,
          inline: true
        }
      )
      .setThumbnail(queue.songs[0].thumbnail)
      .setTimestamp();

    if (queue.songs.length > 1) {
      const queueList = queue.songs.slice(1, 11).map((song, index) => {
        return `${index + 1}. **${song.name}** - ${song.formattedDuration} (${song.user.tag})`;
      }).join('\n');

      embed.addFields({
        name: `Up Next (${queue.songs.length - 1} songs)`,
        value: queueList + (queue.songs.length > 11 ? '\n...and more!' : ''),
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
}; 