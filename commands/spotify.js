const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spotify")
    .setDescription("Play music from Spotify with enhanced features")
    .addStringOption(option =>
      option.setName("url")
        .setDescription("Spotify track, album, or playlist URL")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("action")
        .setDescription("What to do with the Spotify content")
        .addChoices(
          { name: "Play Now", value: "play" },
          { name: "Add to Queue", value: "queue" },
          { name: "Show Info Only", value: "info" }
        )
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const spotifyUrl = interaction.options.getString("url");
    const action = interaction.options.getString("action") || "play";
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    // Validate Spotify URL
    if (!spotifyUrl.includes("open.spotify.com")) {
      return interaction.reply({
        content: "❌ Please provide a valid Spotify URL (open.spotify.com/...)",
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      // Show loading embed
      const loadingEmbed = new EmbedBuilder()
        .setColor(0x1DB954) // Spotify green
        .setTitle("🎵 Loading from Spotify...")
        .setDescription(`Processing: **${spotifyUrl}**`)
        .addFields(
          { name: "Action", value: action === "play" ? "▶️ Play Now" : action === "queue" ? "📋 Add to Queue" : "ℹ️ Show Info", inline: true },
          { name: "Platform", value: "🎵 Spotify", inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [loadingEmbed] });

      try {
        // Use DisTube to handle Spotify content
        const result = await client.distube.play(voiceChannel, spotifyUrl, {
          member: interaction.member,
          textChannel: interaction.channel,
        });

        // Determine what type of content was loaded
        let contentType = "Track";
        let songCount = 1;
        let totalDuration = 0;

        if (result.songs && result.songs.length > 1) {
          contentType = "Playlist/Album";
          songCount = result.songs.length - 1; // Exclude current song
          totalDuration = result.songs.slice(1).reduce((acc, song) => acc + song.duration, 0);
        }

        // Create success embed
        const successEmbed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle("✅ Spotify Content Loaded!")
          .setDescription(`**${contentType}** from Spotify has been processed!`)
          .addFields(
            { name: "Content Type", value: contentType, inline: true },
            { name: "Songs Added", value: `${songCount} songs`, inline: true },
            { name: "Action", value: action === "play" ? "▶️ Playing Now" : "📋 Added to Queue", inline: true }
          )
          .setTimestamp();

        if (songCount > 1) {
          successEmbed.addFields({
            name: "Total Duration",
            value: formatDuration(totalDuration),
            inline: true
          });
        }

        // Add Spotify branding
        successEmbed.setFooter({
          text: "🎵 Powered by Spotify • STRAWHAT MUSIC"
        });

        await interaction.editReply({ embeds: [successEmbed] });

      } catch (error) {
        console.error("Spotify command error:", error);
        
        // Try YouTube fallback for Spotify content
        const fallbackEmbed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle("🔄 Spotify Failed, Trying YouTube...")
          .setDescription(`Spotify couldn't process this content, trying YouTube as fallback`)
          .setTimestamp();

        await interaction.editReply({ embeds: [fallbackEmbed] });

        try {
          // Extract song name from Spotify URL and search YouTube
          const songName = extractSongNameFromSpotifyUrl(spotifyUrl);
          const youtubeQuery = `ytsearch:${songName}`;
          
          await client.distube.play(voiceChannel, youtubeQuery, {
            member: interaction.member,
            textChannel: interaction.channel,
          });

          const fallbackSuccessEmbed = new EmbedBuilder()
            .setColor(0x1DB954)
            .setTitle("✅ Found via YouTube Fallback!")
            .setDescription(`**${songName}** has been added via YouTube!`)
            .addFields(
              { name: "Original Source", value: "🎵 Spotify", inline: true },
              { name: "Actual Source", value: "📺 YouTube", inline: true },
              { name: "Requested by", value: interaction.user.toString(), inline: true }
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [fallbackSuccessEmbed] });

        } catch (fallbackError) {
          console.error("YouTube fallback error:", fallbackError);
          
          const finalErrorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ Content Not Available")
            .setDescription(`Could not load this Spotify content on any platform.\n\nTry:\n• Different Spotify URL\n• Direct YouTube search\n• Check if content is region-restricted`)
            .setTimestamp();

          await interaction.editReply({ embeds: [finalErrorEmbed] });
        }
      }

    } catch (error) {
      console.error("Spotify command error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("An error occurred while processing Spotify content.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

function extractSongNameFromSpotifyUrl(url) {
  // Simple extraction - in a real bot you'd use Spotify API
  try {
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    return lastPart.split('?')[0]; // Remove query parameters
  } catch {
    return "Spotify Track";
  }
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  } else {
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
} 