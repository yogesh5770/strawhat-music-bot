const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retry")
    .setDescription("Retry the last failed song or add a song to continue the queue")
    .addStringOption(option =>
      option.setName("song")
        .setDescription("Song name or URL to add (optional - if not provided, retries last failed song)")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;
    const songQuery = interaction.options.getString("song");

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      const queue = client.distube.getQueue(voiceChannel);
      
      if (!queue) {
        return interaction.editReply({
          content: "❌ There's no music playing! Use `/play` to start playing music.",
          ephemeral: true
        });
      }

      if (songQuery) {
        // Add a new song to continue the queue
        const loadingEmbed = new EmbedBuilder()
          .setColor(0x7289DA)
          .setTitle("🔄 Adding Song...")
          .setDescription(`Adding **${songQuery}** to continue the queue`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loadingEmbed] });

        try {
          await client.distube.play(voiceChannel, songQuery, {
            member: interaction.member,
            textChannel: interaction.channel,
          });

          const successEmbed = new EmbedBuilder()
            .setColor(0x1DB954)
            .setTitle("✅ Song Added!")
            .setDescription(`**${songQuery}** has been added to continue the queue!`)
            .addFields(
              { name: "Queue Position", value: `#${queue.songs.length}`, inline: true },
              { name: "Requested by", value: interaction.user.toString(), inline: true }
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [successEmbed] });

        } catch (error) {
          console.error("Error adding song:", error);
          
          const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Failed to Add Song")
            .setDescription(`Could not add **${songQuery}** to the queue.\n\nTry using a different song or URL.`)
            .setTimestamp();

          await interaction.editReply({ embeds: [errorEmbed] });
        }

      } else {
        // Retry logic - show queue status and suggest next actions
        const currentSong = queue.songs[0];
        const remainingSongs = queue.songs.length - 1;

        const statusEmbed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle("🔄 Queue Status")
          .setDescription(`**Current Song:** ${currentSong.name}`)
          .addFields(
            { name: "Remaining Songs", value: `${remainingSongs} songs`, inline: true },
            { name: "Queue Health", value: remainingSongs > 0 ? "✅ Good" : "⚠️ Empty", inline: true }
          )
          .setTimestamp();

        if (remainingSongs === 0) {
          statusEmbed.addFields({
            name: "💡 Tip",
            value: "Use `/retry <song>` to add more songs and continue the queue!",
            inline: false
          });
        }

        await interaction.editReply({ embeds: [statusEmbed] });
      }

    } catch (error) {
      console.error("Retry command error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("An error occurred. Please try again.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
}; 