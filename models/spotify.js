const SpotifyWebApi = require('spotify-web-api-node');
const dotenv = require('dotenv').config({ path: `${__dirname}/../.env` })
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://www.example.com/callback'
});

const getToken = async () => {
    return (await spotifyApi.clientCredentialsGrant()).body['access_token'];
};

const getTrackName = async (id) => {
    spotifyApi.setAccessToken(await getToken());
    const track = await spotifyApi.getTrack(id)
    return `${track.body.name} by ${track.body.artists[0].name}`;
};

const getPlaylist = async (id) => {
    spotifyApi.setAccessToken(await getToken());
    return (await spotifyApi.getPlaylist(id)).body.tracks.items;
}

module.exports = {
    getTrackName,
    getPlaylist
};