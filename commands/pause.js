const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { AudioPlayerStatus } = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current music"),

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
      if (player && player.state.status === AudioPlayerStatus.Playing) {
        player.pause();
        
        const embed = new EmbedBuilder()
          .setColor(0xFFA500)
          .setTitle(" Music Paused")
          .setDescription("Music has been paused.")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({ 
          content: " No music is currently playing!", 
          ephemeral: true 
        });
      }

    } catch (error) {
      console.error("Pause command error:", error);
      await interaction.reply({ 
        content: " An error occurred while pausing the music!" 
      });
    }
  },
};
