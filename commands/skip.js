const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song"),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ 
        content: " You need to be in a voice channel to use this command!", 
        ephemeral: true 
      });
    }

    try {
      const connection = client.musicQueues.get(interaction.guild.id);
      
      if (!connection) {
        return interaction.reply({ 
          content: " No music is currently playing!", 
          ephemeral: true 
        });
      }

      const player = connection.state.subscription?.player;
      if (player) {
        player.stop();
        
        const embed = new EmbedBuilder()
          .setColor(0x00BFFF)
          .setTitle(" Song Skipped")
          .setDescription("Current song has been skipped.")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({ 
          content: " No music is currently playing!", 
          ephemeral: true 
        });
      }

    } catch (error) {
      console.error("Skip command error:", error);
      await interaction.reply({ 
        content: " An error occurred while skipping the song!" 
      });
    }
  },
};
