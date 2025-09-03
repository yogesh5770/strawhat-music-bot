const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands and how to use them"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle("🎵 STRAWHAT Music Bot - Help Guide")
      .setDescription("Your ultimate Discord music companion with smart features!")
      .addFields(
        {
          name: "🎵 **Core Music Commands**",
          value: "Essential commands for playing music:",
          inline: false
        },
        {
          name: "`/play <song>`",
          value: "Play a song by name, URL, or search term",
          inline: true
        },
        {
          name: "`/smartplay <query>`",
          value: "🧠 Smart player that auto-chooses best source",
          inline: true
        },
        {
          name: "`/playlist <url>`",
          value: "Play entire playlists from Spotify/YouTube",
          inline: true
        },
        {
          name: "`/spotify <url> <action>`",
          value: "🎵 Enhanced Spotify integration with fallback",
          inline: true
        },
        {
          name: "`/pause`",
          value: "Pause the current song",
          inline: true
        },
        {
          name: "`/resume`",
          value: "Resume paused music",
          inline: true
        },
        {
          name: "`/stop`",
          value: "Stop music and clear queue",
          inline: true
        },
        {
          name: "`/skip`",
          value: "Skip to next song",
          inline: true
        },
        {
          name: "`/volume <1-100>`",
          value: "Adjust bot volume",
          inline: true
        },
        {
          name: "`/nowplaying`",
          value: "Show currently playing song",
          inline: true
        },
        {
          name: "`/queue`",
          value: "Display current music queue",
          inline: true
        },
        {
          name: "`/retry <song>`",
          value: "🔄 Add new song or check queue status",
          inline: true
        },
        {
          name: "",
          value: "",
          inline: false
        },
        {
          name: "📚 **Playlist Management**",
          value: "Save and manage your favorite playlists:",
          inline: false
        },
        {
          name: "`/saveplaylist <name> [url]`",
          value: "💾 Save current queue or playlist from URL",
          inline: true
        },
        {
          name: "`/loadplaylist <name>`",
          value: "📖 Load and play a saved playlist",
          inline: true
        },
        {
          name: "`/myplaylists`",
          value: "📋 List all your saved playlists",
          inline: true
        },
        {
          name: "`/deleteplaylist <name>`",
          value: "🗑️ Remove a saved playlist",
          inline: true
        },
        {
          name: "",
          value: "",
          inline: false
        },
        {
          name: "🚀 **Advanced Features**",
          value: "Smart features for better music experience:",
          inline: false
        },
        {
          name: "`/quality <set/info>`",
          value: "🎵 Control audio quality and settings",
          inline: true
        },
        {
          name: "`/history <show/replay>`",
          value: "📚 View and replay recent songs",
          inline: true
        },
        {
          name: "`/recommend <similar/genre/mood>`",
          value: "💡 Get music recommendations",
          inline: true
        },
        {
          name: "",
          value: "",
          inline: false
        },
        {
          name: "🔧 **Utility Commands**",
          value: "Helpful bot management commands:",
          inline: false
        },
        {
          name: "`/ping`",
          value: "Check bot response time",
          inline: true
        },
        {
          name: "`/help`",
          value: "Show this help message",
          inline: true
        }
      )
      .addFields(
        {
          name: "💡 **Pro Tips**",
          value: "• Use `/smartplay` for best results\n• Save playlists with `/saveplaylist`\n• Get recommendations with `/recommend`\n• Use `/quality` to optimize performance",
          inline: false
        },
        {
          name: "🎵 **Supported Platforms**",
          value: "• **Spotify** - Official releases, best quality\n• **YouTube** - Maximum availability (99%)\n• **Direct URLs** - Spotify, YouTube links\n• **Text Search** - Auto-optimized for best results",
          inline: false
        },
        {
          name: "🔄 **Smart Features**",
          value: "• **Auto-fallback** - Spotify → YouTube if needed\n• **Smart source detection** - Auto-chooses best platform\n• **Error recovery** - Helpful tips and solutions\n• **Quality optimization** - Balance speed vs quality",
          inline: false
        }
      )
      .setFooter({ text: "STRAWHAT Music Bot - Powered by DisTube & Discord.js" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
}; 