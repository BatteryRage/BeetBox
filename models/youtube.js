const ytdl = require('ytdl-core');
const { google } = require('googleapis');
var Meta = require('html-metadata-parser');
const dotenv = require('dotenv').config({ path: `${__dirname}/../.env` })
const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
});

const Song = require('./song');

const searchYoutube = async (query) => {
    // Search for YouTube videos
    try {
        const response = await youtube.search.list({
            part: 'id',
            type: 'video',
            q: query,
        });

        // Get the first result
        return response.data.items[0].id.videoId;
    }
    catch (e) {
        console.log(`Failed to search YouTube: ${e}`);
        return null;
    }
};

class Youtube extends Song {
    constructor (videoId) {
        super();
        this.videoId = videoId;
        this.link = `https://www.youtube.com/watch?v=${videoId}`;
        this.title = "";
    }

    async play (interaction) {
        this.stream = ytdl(this.link, { 
            filter: 'audioonly',
            quality: 'lowestaudio'
        });
        await super.play(interaction);
    }

    static async getTitle(link) {
        return (await Meta.parser(link)).meta.title;
    }
}

module.exports = {
    searchYoutube,
    Youtube
};