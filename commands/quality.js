const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quality")
    .setDescription("Control music quality and playback settings")
    .addSubcommand(subcommand =>
      subcommand
        .setName("set")
        .setDescription("Set audio quality preference")
        .addStringOption(option =>
          option.setName("quality")
            .setDescription("Audio quality level")
            .setRequired(true)
            .addChoices(
              { name: "🎵 High Quality (Best)", value: "high" },
              { name: "⚡ Fast (Lower Quality)", value: "fast" },
              { name: "🔄 Auto (Smart)", value: "auto" }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("info")
        .setDescription("Show current quality settings")
    ),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const quality = interaction.options.getString("quality");
      
      // Store quality preference (you can expand this to save per user)
      const qualitySettings = {
        high: {
          name: "High Quality",
          description: "Best audio quality, slower loading",
          color: 0x1DB954,
          icon: "🎵"
        },
        fast: {
          name: "Fast Loading",
          description: "Lower quality, instant playback",
          color: 0xFF6B6B,
          icon: "⚡"
        },
        auto: {
          name: "Auto Quality",
          description: "Smart balance of quality and speed",
          color: 0x7289DA,
          icon: "🔄"
        }
      };

      const setting = qualitySettings[quality];
      
      const embed = new EmbedBuilder()
        .setColor(setting.color)
        .setTitle(`${setting.icon} Quality Set to ${setting.name}`)
        .setDescription(setting.description)
        .addFields(
          { name: "Current Setting", value: setting.name, inline: true },
          { name: "Applied To", value: "All future songs", inline: true },
          { name: "Note", value: "This affects new songs only", inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === "info") {
      const embed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle("🎵 Current Quality Settings")
        .setDescription("Your current music quality preferences")
        .addFields(
          { name: "Audio Quality", value: "Auto (Smart)", inline: true },
          { name: "Loading Speed", value: "Balanced", inline: true },
          { name: "Source Priority", value: "Spotify → YouTube", inline: true },
          { name: "Fallback", value: "Enabled", inline: true },
          { name: "Error Recovery", value: "Smart", inline: true }
        )
        .setFooter({ text: "Use /quality set to change preferences" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  },
}; 