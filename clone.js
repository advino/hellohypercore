let hypercore = require('hypercore');
let hyperswarm = require('hyperswarm');
const pump = require('pump');

let feed = hypercore('./clone-storage', '3b34d506f871a8badf26fffd23b9aff056823934a787645d48df4b3e42e37e12', {
    valueEncoding: 'json'
});

let swarm = hyperswarm();

feed.createReadStream({live: true})
    .on('data', data => {
        console.log(data);
    });

feed.ready(() => {
    swarm.join(feed.discoveryKey, {lookup: true, announce: true});
    swarm.on('connection', (socket, detail) => {
        
        pump(socket, feed.replicate(true, {live: true}), socket);
    });
})