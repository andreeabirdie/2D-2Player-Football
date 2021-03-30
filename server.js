var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};
var playerIndex = [];

app.use(express.static(__dirname));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    // create a new player and add it to our players object
    if(playerIndex.length < 2) {
        var x = 100;
        var index = 0;
        if (playerIndex.length == 1 && playerIndex.includes(0)) {
            x = 700;
            index = 1;
        }
        playerIndex.push(index)
        console.log('adding player ' + index);
        players[socket.id] = {
            x: x,
            y: 450,
            playerId: socket.id,
            index: index
        };
        // send the players object to the new player
        socket.emit('currentPlayers', players);
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
        socket.on('disconnect', function () {
            console.log('user ' + players[socket.id].index + ' disconnected');
            // remove this player from our players object
            playerIndex.splice(playerIndex.indexOf(players[socket.id].index));
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnect', socket.id);
        });

        // when a player moves, update the player data
        socket.on('playerMovement', function (movementData) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerMoved', players[socket.id]);
        });
        socket.on('kickedBall', function (ballData) {
            players[socket.id].ballX = ballData.ballX;
            players[socket.id].ballY = ballData.ballY;
            // emit a message to all players about the ball being kicked
            socket.broadcast.emit('kickedBall', players[socket.id]);
        });
    }
    else console.log("there are already 2 players in this game")
});

server.listen(8080, function () {
    console.log(`Listening on ${server.address().port}`);
});