const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("saveplaylist")
    .setDescription("Save a playlist from URL or current queue")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Name for your playlist")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("url")
        .setDescription("Playlist URL (Spotify, YouTube, etc.) or leave empty to save current queue")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const playlistName = interaction.options.getString("name");
    const playlistUrl = interaction.options.getString("url");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      // Create playlists directory if it doesn't exist
      const playlistsDir = path.join(__dirname, '..', 'playlists');
      try {
        await fs.access(playlistsDir);
      } catch {
        await fs.mkdir(playlistsDir, { recursive: true });
      }

      // Load existing playlists
      const playlistsFile = path.join(playlistsDir, 'user_playlists.json');
      let playlists = {};
      
      try {
        const data = await fs.readFile(playlistsFile, 'utf8');
        playlists = JSON.parse(data);
      } catch (error) {
        // File doesn't exist or is empty, start with empty object
        playlists = {};
      }

      // Initialize user's playlists if they don't exist
      if (!playlists[interaction.user.id]) {
        playlists[interaction.user.id] = {};
      }

      // Check if playlist name already exists
      if (playlists[interaction.user.id][playlistName]) {
        return interaction.editReply({
          content: `❌ You already have a playlist named **${playlistName}**. Please choose a different name or use \`/deleteplaylist ${playlistName}\` first.`,
          ephemeral: true
        });
      }

      let songs = [];
      let totalDuration = 0;
      let source = "";

      if (playlistUrl) {
        // Save playlist from URL
        source = "URL";
        
        // Show loading embed
        const loadingEmbed = new EmbedBuilder()
          .setColor(0x7289DA)
          .setTitle("🔍 Loading Playlist from URL...")
          .setDescription(`Loading songs from: **${playlistUrl}**`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loadingEmbed] });

        try {
          // Get current queue to restore later
          const currentQueue = client.distube.getQueue(voiceChannel);
          const currentSongs = currentQueue ? [...currentQueue.songs] : [];
          
          // Temporarily add playlist to get song info
          await client.distube.play(voiceChannel, playlistUrl, {
            member: interaction.member,
            textChannel: interaction.channel,
          });

          // Wait a moment for the playlist to be processed
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Get the updated queue with the new songs
          const updatedQueue = client.distube.getQueue(voiceChannel);
          
          if (updatedQueue && updatedQueue.songs.length > 1) {
            // Extract the new songs (skip the first one which is currently playing)
            const newSongs = updatedQueue.songs.slice(1);
            songs = newSongs.map(song => ({
              name: song.name,
              url: song.url,
              duration: song.duration,
              formattedDuration: song.formattedDuration,
              thumbnail: song.thumbnail,
              user: { tag: interaction.user.tag }
            }));
            
            totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
            
            // Remove the temporarily added songs to restore original queue
            if (currentSongs.length > 0) {
              // Restore original queue
              updatedQueue.songs = currentSongs;
            } else {
              // If there was no original queue, stop and clear
              client.distube.stop(voiceChannel);
            }
          } else {
            throw new Error("Failed to extract playlist information");
          }
          
        } catch (error) {
          console.error("Error loading playlist from URL:", error);
          return interaction.editReply({
            content: `❌ Failed to load playlist from URL: **${playlistUrl}**\n\nPlease check if the URL is valid and try again.`,
            ephemeral: true
          });
        }
      } else {
        // Save current queue
        source = "Current Queue";
        const queue = client.distube.getQueue(voiceChannel);
        
        if (!queue || queue.songs.length <= 1) {
          return interaction.editReply({
            content: "❌ There's no music playing or queue is empty!\n\nUse `/playlist <url>` first to add songs, or provide a URL with this command.",
            ephemeral: true
          });
        }

        songs = queue.songs.slice(1); // Remove the first song (currently playing)
        totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
      }

      // Save the playlist
      playlists[interaction.user.id][playlistName] = {
        name: playlistName,
        songs: songs.map(song => ({
          name: song.name,
          url: song.url,
          duration: song.duration,
          formattedDuration: song.formattedDuration,
          thumbnail: song.thumbnail,
          user: song.user.tag
        })),
        totalDuration: totalDuration,
        songCount: songs.length,
        source: source,
        createdAt: new Date().toISOString(),
        createdBy: interaction.user.tag
      };

      // Save to file
      await fs.writeFile(playlistsFile, JSON.stringify(playlists, null, 2));

      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle("💾 Playlist Saved!")
        .setDescription(`**${playlistName}** has been saved successfully!`)
        .addFields(
          { name: "Source", value: source, inline: true },
          { name: "Songs Saved", value: `${songs.length} songs`, inline: true },
          { name: "Total Duration", value: formatDuration(totalDuration), inline: true },
          { name: "Saved By", value: interaction.user.toString(), inline: true }
        )
        .setTimestamp();

      if (playlistUrl) {
        embed.addFields({
          name: "Original URL",
          value: playlistUrl,
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error("Save playlist error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Error")
        .setDescription("Failed to save the playlist. Please try again.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

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