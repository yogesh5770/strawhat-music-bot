const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("smartplay")
    .setDescription("Smart music player that automatically chooses the best source")
    .addStringOption(option =>
      option.setName("query")
        .setDescription("Song name, URL, or playlist")
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

      // Determine the best source based on the query
      let source = "Auto";
      let optimizedQuery = query;
      
      if (query.includes("open.spotify.com")) {
        source = "Spotify";
        optimizedQuery = query;
      } else if (query.includes("youtube.com") || query.includes("youtu.be")) {
        source = "YouTube";
        optimizedQuery = query;
      } else if (query.includes("soundcloud.com")) {
        source = "SoundCloud";
        optimizedQuery = query;
      } else {
        // For text queries, try YouTube first (best availability)
        source = "YouTube Search";
        optimizedQuery = `ytsearch:${query}`;
      }

      // Show smart loading embed
      const loadingEmbed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle("🧠 Smart Music Player")
        .setDescription(`Analyzing: **${query}**`)
        .addFields(
          { name: "Detected Source", value: source, inline: true },
          { name: "Optimized Query", value: optimizedQuery.length > 50 ? optimizedQuery.substring(0, 50) + "..." : optimizedQuery, inline: true },
          { name: "Strategy", value: "Auto-optimizing for best results", inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [loadingEmbed] });

      try {
        // Try the optimized approach
        await client.distube.play(voiceChannel, optimizedQuery, {
          member: interaction.member,
          textChannel: interaction.channel,
        });

        const successEmbed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle("✅ Smart Play Success!")
          .setDescription(`**${query}** has been added using optimal source!`)
          .addFields(
            { name: "Source Used", value: source, inline: true },
            { name: "Strategy", value: "Auto-optimized", inline: true },
            { name: "Requested by", value: interaction.user.toString(), inline: true }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

      } catch (error) {
        console.error("Smart play error:", error);
        
        // If the smart approach fails, try fallback
        const fallbackEmbed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle("🔄 Smart Strategy Failed")
          .setDescription(`Trying alternative approach for: **${query}**`)
          .addFields(
            { name: "Error", value: getErrorDescription(error.errorCode), inline: true },
            { name: "Fallback", value: "YouTube search", inline: true }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [fallbackEmbed] });

        try {
          // Try YouTube search as fallback
          const youtubeQuery = `ytsearch:${query}`;
          await client.distube.play(voiceChannel, youtubeQuery, {
            member: interaction.member,
            textChannel: interaction.channel,
          });

          const fallbackSuccessEmbed = new EmbedBuilder()
            .setColor(0x1DB954)
            .setTitle("✅ Fallback Success!")
            .setDescription(`**${query}** found via YouTube fallback!`)
            .addFields(
              { name: "Original Strategy", value: source, inline: true },
              { name: "Fallback Source", value: "YouTube", inline: true },
              { name: "Requested by", value: interaction.user.toString(), inline: true }
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [fallbackSuccessEmbed] });

        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          
          const finalErrorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle("❌ All Strategies Failed")
            .setDescription(`Could not play **${query}** with any method.`)
            .addFields(
              { name: "What to Try", value: "• Different song name\n• Direct YouTube URL\n• Check if content exists", inline: false },
              { name: "Commands", value: "• `/play <song>` - Basic play\n• `/retry <song>` - Add to queue\n• `/queue` - Check status", inline: false }
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [finalErrorEmbed] });
        }
      }

    } catch (error) {
      console.error("Smart play command error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Smart Play Error")
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
    case 'NO_EXTRACTOR_PLUGIN':
      return 'Plugin issue';
    default:
      return 'Unknown error';
  }
} 