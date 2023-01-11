const { Youtube } = require('./youtube');

class Queue {
    /**
     * This class represents a FIFO queue of Songs. The 0th element is the end of the queue, so the currently playing song. Songs are added to the end of the queue and move towards the front.
     */
    constructor() {
        this.songs = [];
        this.channel = {}
        this.state = 'idle';
    }

    async push(song, interaction) {
        this.channel = interaction.client.channels.cache.get(interaction.channelId);
        const title = await Youtube.getTitle(song.link);
        song.title = title;
        this.songs.push(song);

        // If this is the first song, play it
        if (song === this.getTop()) {
            await this.start(interaction);
            await interaction.editReply('.'); 
        }
        else
            await interaction.editReply(`Added ${title} to queue!`); 
    }

    pop() {
        this.songs.shift();
    }

    async start(interaction) {
        console.log(`Playing ${this.getTop().title}`);
        await this.getTop().play(interaction);
    }

    async nextSong(interaction) {
        this.pop();
        if (this.songs.length > 0)
            await this.start(interaction);
    }

    isEmpty() {
        return this.songs.length === 0;
    }

    getTop() {
        return this.songs[0];
    }

    getNext() {
        if (this.songs.length < 2)
            return null;
        return this.songs[1];
    }

    async pause() {
        this.state = 'paused';
        await this.getTop().pause();
    }

    async unpause(interction) {
        this.state = 'playing';
        await this.getTop().unpause();
    }

    async stop(interaction) {
        this.state = 'stopped';
        await this.getTop().stop();
        this.songs = [];
    }

    list() {
        return this.songs.map((s) => s.title);
    }
}

module.exports = Queue;