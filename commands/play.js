const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube, Spotify, or SoundCloud")
    .addStringOption(option =>
      option.setName("query")
        .setDescription("Song name or URL")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const query = interaction.options.getString("query");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      // Show loading embed
      const loadingEmbed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle("🔍 Searching...")
        .setDescription(`Looking for: **${query}**`)
        .setTimestamp();

      await interaction.editReply({ embeds: [loadingEmbed] });

      try {
        // Try to play the song
        await client.distube.play(voiceChannel, query, {
          member: interaction.member,
          textChannel: interaction.channel,
        });

        // Success - song found and added
        const successEmbed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle("✅ Song Added!")
          .setDescription(`**${query}** has been added to the queue!`)
          .addFields(
            { name: "Source", value: "🎵 Music Platform", inline: true },
            { name: "Requested by", value: interaction.user.toString(), inline: true }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

      } catch (error) {
        console.error("Play command error:", error);
        
        // If the first attempt fails, try with YouTube fallback
        if (error.errorCode === 'NO_RESULT' || 
            error.errorCode === 'SPOTIFY_PLUGIN_API' ||
            error.errorCode === 'NOT_SUPPORTED_URL') {
          
          const fallbackEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("🔄 Primary Source Failed")
            .setDescription(`**${query}** couldn't be loaded from the primary source.`)
            .addFields(
              { name: "Error Type", value: getErrorDescription(error.errorCode), inline: true },
              { name: "Next Step", value: "Trying YouTube fallback...", inline: true }
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [fallbackEmbed] });

          try {
            // Try with YouTube search
            const youtubeQuery = `ytsearch:${query}`;
            await client.distube.play(voiceChannel, youtubeQuery, {
              member: interaction.member,
              textChannel: interaction.channel,
            });

            const fallbackSuccessEmbed = new EmbedBuilder()
              .setColor(0x1DB954)
              .setTitle("✅ Song Found via YouTube!")
              .setDescription(`**${query}** has been added to the queue via YouTube!`)
              .addFields(
                { name: "Primary Source", value: "🎵 Spotify/Platform", inline: true },
                { name: "Fallback Source", value: "📺 YouTube", inline: true },
                { name: "Requested by", value: interaction.user.toString(), inline: true }
              )
              .setTimestamp();

            await interaction.editReply({ embeds: [fallbackSuccessEmbed] });

          } catch (fallbackError) {
            console.error("YouTube fallback error:", fallbackError);
            
            const finalErrorEmbed = new EmbedBuilder()
              .setColor(0xFF0000)
              .setTitle("❌ Song Not Found Anywhere")
              .setDescription(`Could not find **${query}** on any platform.`)
              .addFields(
                { name: "What Happened", value: "Both primary source and YouTube fallback failed", inline: false },
                { name: "💡 Solutions", value: "• Try different song name\n• Use YouTube URL directly\n• Check if song exists\n• Try `/retry <song>` command", inline: false }
              )
              .setTimestamp();

            await interaction.editReply({ embeds: [finalErrorEmbed] });
          }
        } else {
          // Other types of errors
          const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Error")
            .setDescription(`Failed to play **${query}**.\n\nError: ${error.message || 'Unknown error'}`)
            .setTimestamp();

          await interaction.editReply({ embeds: [errorEmbed] });
        }
      }

    } catch (error) {
      console.error("Play command error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("An error occurred while processing your request.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

function getErrorDescription(errorCode) {
  switch (errorCode) {
    case 'NO_RESULT':
      return 'Song not found';
    case 'SPOTIFY_PLUGIN_API':
      return 'Spotify API limit';
    case 'NOT_SUPPORTED_URL':
      return 'URL not supported';
    default:
      return 'Unknown error';
  }
} 