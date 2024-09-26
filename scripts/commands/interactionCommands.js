require('dotenv').config({ path: '../../dev.env' });

const { REST, Routes } = require('discord.js');
const jsonCommands = require('./commands.json');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function commands(guild_id){
    try {
        console.log('Iniciando o registro de comandos de barra...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, guild_id),
            { body: jsonCommands }
        );

        console.log('Comandos registrados com sucesso!');
    } catch (error) {
        console.error(error);
    }
}

exports.commands = commands;