let hypercore = require('hypercore');
let hyperswarm = require('hyperswarm');
const pump = require('pump');

let feed = hypercore('./feed-storage', {
    valueEncoding: 'json'
});
let swarm = hyperswarm();

process.stdin.on('data', data => {
    feed.append({
        timestamp: new Date().toISOString(),
        string: data.toString().trim()
    });
});

feed.createReadStream({live: true})
    .on('data', data => {
        console.log(data);
    });

feed.ready(() => {
    console.log(feed.key.toString('hex'));
    swarm.join(feed.discoveryKey, {lookup: true, announce: true});
    swarm.on('connection', (socket, details) => {

        pump(socket, feed.replicate(false, {live: true}), socket);
    });
})
