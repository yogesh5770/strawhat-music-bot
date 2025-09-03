const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config.json');

module.exports = async (client) => {
  const commands = [];
  const commandsPath = path.join(__dirname, '../commands');
  
  // Check if commands directory exists
  if (!fs.existsSync(commandsPath)) {
    console.log('Commands directory not found, creating...');
    fs.mkdirSync(commandsPath, { recursive: true });
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.log(`⚠️ Command at ${filePath} is missing required properties`);
    }
  }

  // Register slash commands
  if (commands.length > 0) {
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
      console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

      if (config.guildId) {
        // Guild-specific commands (faster updates for development)
        await rest.put(
          Routes.applicationGuildCommands(config.clientId, config.guildId),
          { body: commands },
        );
        console.log(`✅ Successfully reloaded ${commands.length} guild (/) commands.`);
      } else {
        // Global commands (slower but works everywhere)
        await rest.put(
          Routes.applicationCommands(config.clientId),
          { body: commands },
        );
        console.log(`✅ Successfully reloaded ${commands.length} global (/) commands.`);
      }
    } catch (error) {
      console.error('Error refreshing commands:', error);
    }
  }
}; 