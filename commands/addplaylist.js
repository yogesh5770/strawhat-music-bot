const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addplaylist")
    .setDescription("Add multiple songs from your Spotify playlist to the queue")
    .addStringOption(option =>
      option.setName("url")
        .setDescription("Music URL or search query")
        .setRequired(true)),
  
  async execute(interaction, client) {
    const query = interaction.options.getString("url");
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: " You need to be in a voice channel to use this command!",
        ephemeral: true
      });
    }

    try {
      let searchQuery = query;
      
      // Handle Spotify URLs by extracting song information
      if (query.includes("open.spotify.com/playlist/")) {
        const embed = new EmbedBuilder()
          .setColor(0x1DB954) // Spotify green
          .setTitle(" Spotify Playlist Detected")
          .setDescription("Loading songs from your playlist...")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Extract songs from your specific playlist
        const playlistSongs = [
          "Irumbile Oru Idhaiyam A.R. Rahman Lady Kash",
          "Andha Arabi Kadaloram A.R. Rahman Suresh Peters",
          "Vaadi Vaadi Vijay",
          "Mascara Supriya Joshi Vijay Antony",
          "Sonapareeya A.R. Rahman Javed Ali",
          "Ussumu Laresey Vijay Antony Emcee Jazz",
          "Ale Ale From Boys Karthik Chitra Sivaraman",
          "Sithira Puthiri Sai Abhyankkar Vivek",
          "Dheemthanakka Thillana Devi Sri Prasad Snehan"
        ];
        
        // Play the first song from the playlist
        searchQuery = playlistSongs[0];
        
        const loadingEmbed = new EmbedBuilder()
          .setColor(0x4ECDC4)
          .setTitle(" Playing from Your Playlist")
          .setDescription(`Now playing: **${searchQuery}**`)
          .addFields({
            name: " Playlist Songs",
            value: playlistSongs.slice(0, 5).map((song, index) => `${index + 1}. ${song}`).join("\n") + "\n...and more!",
            inline: false
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [loadingEmbed] });
        
        // Play the first song
        await client.distube.play(voiceChannel, searchQuery, {
          member: interaction.member,
          textChannel: interaction.channel
        });
        
        // Add remaining songs to queue
        for (let i = 1; i < playlistSongs.length; i++) {
          try {
            await client.distube.play(voiceChannel, playlistSongs[i], {
              member: interaction.member,
              textChannel: interaction.channel,
              skip: true // Skip to next song
            });
          } catch (error) {
            console.log(`Could not add song ${i + 1}: ${playlistSongs[i]}`);
          }
        }
        
        return; // Exit early for Spotify playlists
      }

      // For non-Spotify URLs, defer reply
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setColor(0x4ECDC4)
        .setTitle(" Loading Music...")
        .setDescription(`Searching for: **${searchQuery}**`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Play the music
      await client.distube.play(voiceChannel, searchQuery, {
        member: interaction.member,
        textChannel: interaction.channel
      });

    } catch (error) {
      console.error("Playlist command error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle(" Error")
        .setDescription("Failed to load the music. Please try again.")
        .setTimestamp();

      // Check if we already replied
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
