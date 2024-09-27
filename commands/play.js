const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const { Youtube, searchYoutube } = require('../models/youtube');
const { getTrackName } = require('../models/spotify');
const Song = require('../models/song');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays audio from YouTube or Spotify.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The YouTube or Spotify URL or search query.')
                .setRequired(true)),


    async execute(interaction) {
        // Get the user's voice channel
        const voiceChannel = interaction.member.voice.channel;

        // Check if the user is in a voice channel
        if (!voiceChannel) {
            interaction.reply('You must be in a voice channel to play music!');
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

        // Check if the query is a YouTube URL
        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            // Get the videoId from the YouTube URL
            const videoId = query.match(/v=([^&]+)/) ? query.match(/v=([^&]+)/)[1] : null;

            if (!videoId) {
                console.error(`Invalid YouTube URL: ${query}`);
                return;
            }

            song = new Youtube(videoId);
        } 
        // Check if the query is a Spotify track URL
        else if (query.includes('open.spotify.com/track')) {
            // Find the song by title on youtube
            song = new Youtube(await searchYoutube(await getTrackName(query.substring(query.lastIndexOf('/') + 1).split('?')[0])));
        }
        else {
            // Search for YouTube videos by keyword
            const ytId = await searchYoutube(query);
            if (ytId === null) {
                song = {};
                await interaction.editReply('An error occurred, you\'ve likely exceeded your YouTube search quota. Please try again later.');
            }
            else
                song = new Youtube(ytId);
        }

        if(song instanceof Song) {
            song.connection = connection;
            try {
                global.queue.push(song, interaction);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
};