const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname, '../events');
  
  // Check if events directory exists
  if (!fs.existsSync(eventsPath)) {
    console.log('Events directory not found, creating...');
    fs.mkdirSync(eventsPath, { recursive: true });
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    
    console.log(`✅ Loaded event: ${event.name}`);
  }

  // Handle slash command interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      
      const errorMessage = {
        content: '❌ There was an error while executing this command!',
        ephemeral: true
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  });

  // Handle DisTube events
  client.distube
    .on('playSong', (queue, song) => {
      const embed = {
        color: 0xFF6B6B,
        title: '🎵 Now Playing',
        description: `**${song.name}**`,
        fields: [
          {
            name: 'Duration',
            value: song.formattedDuration,
            inline: true
          },
          {
            name: 'Requested by',
            value: song.user.tag,
            inline: true
          },
          {
            name: 'Queue Position',
            value: `${queue.songs.length - 1} songs remaining`,
            inline: true
          }
        ],
        thumbnail: {
          url: song.thumbnail
        },
        timestamp: new Date()
      };
      
      queue.textChannel?.send?.({ embeds: [embed] });
    })
    .on('addSong', (queue, song) => {
      const embed = {
        color: 0x4ECDC4,
        title: '✅ Song Added to Queue',
        description: `**${song.name}** has been added to the queue!`,
        fields: [
          {
            name: 'Position',
            value: `#${queue.songs.length}`,
            inline: true
          },
          {
            name: 'Requested by',
            value: song.user.tag,
            inline: true
          }
        ],
        timestamp: new Date()
      };
      
      queue.textChannel?.send?.({ embeds: [embed] });
    })
    .on('addList', (queue, playlist) => {
      const embed = {
        color: 0x1DB954,
        title: '🎶 Playlist Added to Queue',
        description: `**${playlist.name}** has been added to the queue!`,
        fields: [
          {
            name: 'Songs Added',
            value: `${playlist.songs.length} songs`,
            inline: true
          },
          {
            name: 'Duration',
            value: playlist.formattedDuration,
            inline: true
          },
          {
            name: 'Requested by',
            value: playlist.user.tag,
            inline: true
          }
        ],
        thumbnail: {
          url: playlist.thumbnail
        },
        timestamp: new Date()
      };
      
      queue.textChannel?.send?.({ embeds: [embed] });
    })
    .on('error', (error, queue) => {
      // DisTube v5 emits (error, queue). Guard types just in case.
      console.error('DisTube error:', error);
      const textChannel = queue?.textChannel;
      
      // Provide more specific error messages based on error type
      let errorMessage = '❌ An error occurred while playing music!';
      let showHelp = false;
      
      if (error.errorCode === 'NO_RESULT') {
        errorMessage = '🔍 Song not found. Please try a different search term.';
        showHelp = true;
      } else if (error.errorCode === 'NOT_SUPPORTED_URL') {
        errorMessage = '❌ This URL is not supported. Please use Spotify, YouTube, or direct song names.';
        showHelp = true;
      } else if (error.errorCode === 'SPOTIFY_PLUGIN_API') {
        errorMessage = '⚠️ Spotify playlist too large (100+ tracks). Try YouTube URL or get Spotify API keys.';
        showHelp = true;
      } else if (error.errorCode === 'NO_EXTRACTOR_PLUGIN') {
        errorMessage = '🔧 Bot configuration issue. Please contact bot administrator.';
        showHelp = false;
      }
      
      // Send error message
      textChannel?.send?.(errorMessage);
      
      // Show helpful tips for recoverable errors
      if (showHelp) {
        const helpEmbed = {
          color: 0xFFA500,
          title: "💡 Tips to Fix This:",
          description: "Try these solutions:",
          fields: [
            {
              name: "🎵 For Spotify Playlists",
              value: "• Use YouTube URL instead\n• Get Spotify API keys\n• Split into smaller playlists",
              inline: false
            },
            {
              name: "📺 For YouTube",
              value: "• Use direct YouTube URLs\n• Try different song names\n• Check if video is available",
              inline: false
            },
            {
              name: "🔄 Recovery Commands",
              value: "• `/retry <song>` - Add new songs\n• `/queue` - Check current queue\n• `/play <song>` - Try different song",
              inline: false
            }
          ],
          timestamp: new Date()
        };
        
        textChannel?.send?.({ embeds: [helpEmbed] });
      }
    })
    .on('finish', (queue) => {
      const embed = {
        color: 0xFF6B6B,
        title: '🏁 Queue Finished',
        description: 'All songs in the queue have been played!',
        timestamp: new Date()
      };
      
      queue.textChannel?.send?.({ embeds: [embed] });
    })
    .on('disconnect', (queue) => {
      const embed = {
        color: 0xFF6B6B,
        title: '🔌 Bot Disconnected',
        description: 'The bot has been disconnected from the voice channel.',
        timestamp: new Date()
      };
      
      queue.textChannel?.send?.({ embeds: [embed] });
    })
    .on('empty', (queue) => {
      const embed = {
        color: 0xFF6B6B,
        title: '📭 Voice Channel Empty',
        description: 'The voice channel is empty. The bot will leave in a few minutes.',
        timestamp: new Date()
      };
      
      queue.textChannel?.send?.({ embeds: [embed] });
    });
}; 