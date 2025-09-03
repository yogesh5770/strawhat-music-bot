const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("recommend")
    .setDescription("Get music recommendations based on current or recent songs")
    .addSubcommand(subcommand =>
      subcommand
        .setName("similar")
        .setDescription("Find similar songs to what's currently playing")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("genre")
        .setDescription("Get recommendations by genre")
        .addStringOption(option =>
          option.setName("genre")
            .setDescription("Music genre for recommendations")
            .setRequired(true)
            .addChoices(
              { name: "🎵 Pop", value: "pop" },
              { name: "🎸 Rock", value: "rock" },
              { name: "🎹 Electronic", value: "electronic" },
              { name: "🎷 Jazz", value: "jazz" },
              { name: "🎤 Hip Hop", value: "hiphop" },
              { name: "🎻 Classical", value: "classical" },
              { name: "🎺 Country", value: "country" },
              { name: "🌍 World", value: "world" }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("mood")
        .setDescription("Get recommendations by mood")
        .addStringOption(option =>
          option.setName("mood")
            .setDescription("Mood for music recommendations")
            .setRequired(true)
            .addChoices(
              { name: "😊 Happy", value: "happy" },
              { name: "😢 Sad", value: "sad" },
              { name: "🔥 Energetic", value: "energetic" },
              { name: "😴 Relaxed", value: "relaxed" },
              { name: "💕 Romantic", value: "romantic" },
              { name: "🎉 Party", value: "party" },
              { name: "🧘 Meditative", value: "meditative" },
              { name: "🏃 Workout", value: "workout" }
            )
        )
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    try {
      await interaction.deferReply();

      if (subcommand === "similar") {
        // Get current queue to find similar songs
        const queue = client.distube.getQueue(interaction.guildId);
        
        if (!queue || !queue.songs || queue.songs.length === 0) {
          const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("🎵 Music Recommendations")
            .setDescription("No music is currently playing!")
            .addFields(
              { name: "💡 Start Playing", value: "Use `/play` or `/smartplay` to add music first", inline: false },
              { name: "📖 Other Options", value: "• `/recommend genre <genre>` - By genre\n• `/recommend mood <mood>` - By mood", inline: false }
            )
            .setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        }

        const currentSong = queue.songs[0];
        const recommendations = getSimilarSongs(currentSong.name, currentSong.source);

        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle("🎵 Similar Songs")
          .setDescription(`Based on: **${currentSong.name}**`)
          .addFields(
            { name: "Current Song", value: currentSong.name, inline: true },
            { name: "Source", value: currentSong.source || "Unknown", inline: true },
            { name: "Duration", value: formatDuration(currentSong.duration), inline: true }
          )
          .setTimestamp();

        // Add recommendations
        recommendations.forEach((song, index) => {
          embed.addFields({
            name: `${index + 1}. ${song.name}`,
            value: `🎵 ${song.artist} | ⏱️ ${song.duration} | 💡 ${song.reason}`,
            inline: false
          });
        });

        // Add play buttons for top recommendations
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`play_rec_1`)
              .setLabel('▶️ Play #1')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`play_rec_2`)
              .setLabel('▶️ Play #2')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`play_rec_3`)
              .setLabel('▶️ Play #3')
              .setStyle(ButtonStyle.Success)
          );

        await interaction.editReply({ embeds: [embed], components: [row] });

      } else if (subcommand === "genre") {
        const genre = interaction.options.getString("genre");
        const recommendations = getGenreRecommendations(genre);

        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle(`🎵 ${getGenreDisplayName(genre)} Recommendations`)
          .setDescription(`Top songs in the ${getGenreDisplayName(genre)} genre`)
          .setTimestamp();

        recommendations.forEach((song, index) => {
          embed.addFields({
            name: `${index + 1}. ${song.name}`,
            value: `🎵 ${song.artist} | ⏱️ ${song.duration} | 🌟 ${song.popularity}`,
            inline: false
          });
        });

        await interaction.editReply({ embeds: [embed] });

      } else if (subcommand === "mood") {
        const mood = interaction.options.getString("mood");
        const recommendations = getMoodRecommendations(mood);

        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle(`🎵 ${getMoodDisplayName(mood)} Music`)
          .setDescription(`Perfect for when you're feeling ${getMoodDisplayName(mood).toLowerCase()}`)
          .setTimestamp();

        recommendations.forEach((song, index) => {
          embed.addFields({
            name: `${index + 1}. ${song.name}`,
            value: `🎵 ${song.artist} | ⏱️ ${song.duration} | 💫 ${song.moodMatch}% match`,
            inline: false
          });
        });

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error("Recommendations error:", error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("❌ Recommendations Error")
        .setDescription("Failed to get music recommendations.")
        .addFields(
          { name: "Error", value: error.message || "Unknown error", inline: false },
          { name: "💡 Try", value: "• Check if music is playing\n• Try different genre/mood\n• Use `/play` to add music first", inline: false }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

// Helper functions for recommendations
function getSimilarSongs(songName, source) {
  // In a real bot, you'd use AI/ML or external APIs
  // For now, return sample recommendations
  return [
    {
      name: "Similar Song 1",
      artist: "Artist A",
      duration: "3:45",
      reason: "Same genre & style"
    },
    {
      name: "Similar Song 2", 
      artist: "Artist B",
      duration: "4:12",
      reason: "Similar tempo & mood"
    },
    {
      name: "Similar Song 3",
      artist: "Artist C", 
      duration: "3:28",
      reason: "Related artist"
    }
  ];
}

function getGenreRecommendations(genre) {
  const genreSongs = {
    pop: [
      { name: "Pop Hit 1", artist: "Pop Artist A", duration: "3:30", popularity: "🔥 Hot" },
      { name: "Pop Hit 2", artist: "Pop Artist B", duration: "3:45", popularity: "⭐ Popular" },
      { name: "Pop Hit 3", artist: "Pop Artist C", duration: "4:00", popularity: "💫 Trending" }
    ],
    rock: [
      { name: "Rock Anthem 1", artist: "Rock Band A", duration: "4:15", popularity: "🤘 Classic" },
      { name: "Rock Anthem 2", artist: "Rock Band B", duration: "3:55", popularity: "🔥 Modern" },
      { name: "Rock Anthem 3", artist: "Rock Band C", duration: "5:20", popularity: "⭐ Popular" }
    ]
    // Add more genres...
  };
  
  return genreSongs[genre] || genreSongs.pop;
}

function getMoodRecommendations(mood) {
  const moodSongs = {
    happy: [
      { name: "Happy Song 1", artist: "Happy Artist A", duration: "3:20", moodMatch: 95 },
      { name: "Happy Song 2", artist: "Happy Artist B", duration: "3:45", moodMatch: 88 },
      { name: "Happy Song 3", artist: "Happy Artist C", duration: "3:15", moodMatch: 92 }
    ],
    energetic: [
      { name: "Energetic Song 1", artist: "Energetic Artist A", duration: "3:50", moodMatch: 98 },
      { name: "Energetic Song 2", artist: "Energetic Artist B", duration: "4:05", moodMatch: 91 },
      { name: "Energetic Song 3", artist: "Energetic Artist C", duration: "3:35", moodMatch: 89 }
    ]
    // Add more moods...
  };
  
  return moodSongs[mood] || moodSongs.happy;
}

function getGenreDisplayName(genre) {
  const names = {
    pop: "Pop",
    rock: "Rock", 
    electronic: "Electronic",
    jazz: "Jazz",
    hiphop: "Hip Hop",
    classical: "Classical",
    country: "Country",
    world: "World"
  };
  return names[genre] || "Unknown";
}

function getMoodDisplayName(mood) {
  const names = {
    happy: "Happy",
    sad: "Sad",
    energetic: "Energetic",
    relaxed: "Relaxed",
    romantic: "Romantic",
    party: "Party",
    meditative: "Meditative",
    workout: "Workout"
  };
  return names[mood] || "Unknown";
}

function formatDuration(seconds) {
  if (!seconds) return "Unknown";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 