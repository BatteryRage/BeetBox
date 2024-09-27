const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const { getPlaylist } = require('../models/spotify');
const { Youtube, searchYoutube } = require('../models/youtube');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Add a Spotify playlist to the queue.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The YouTube or Spotify URL or search query.')
                .setRequired(true)),

        async execute(interaction) {
            // Get the user's voice channel
            const voiceChannel = interaction.member.voice.channel;
        
            // Check if the user is in a voice channel
            if (!voiceChannel) {
                interaction.reply('You must be in a voice channel to add a playlist!');
                return;
            }

            // Join the user's voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            await interaction.deferReply();
            const query = interaction.options.getString('query') ?? 'No URL or search provided!';
            let song;

            // Check if the query is a Spotify playlist URL
            if (query.includes('open.spotify.com/playlist')) {
                // Find the song by title on youtube
                const playlistId = query.substring(query.lastIndexOf('/') + 1).split('?')[0];
                const playlists = await getPlaylist(playlistId);

                // We only allow 10 to conserve YouTube search quota
                for (let i = 0; i < 10; i++) {
                    const ytId = await searchYoutube(playlists[i].track.name);

                    if (ytId === null)
                    {
                        await interaction.editReply('An error occurred, you\'ve likely exceeded your YouTube search quota. Please try again later.');
                    }
                    else {
                        song = new Youtube(ytId);
                        song.connection = connection;
                        global.queue.push(song, interaction);
                    }
                }
            }
            else {
                interaction.editReply('Please enter a valid Spotify playlist URL.');
            }
        },
};