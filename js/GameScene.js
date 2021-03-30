export default class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    init() {
        this.startGame = false;
        this.gameOver = false;
        this.scoreText = "";
        this.score = [0, 0];
        this.startRound = false;
        this.playerIndex = -1;
        this.otherPlayerIndex = -1;
        this.maxScore = 5;
    }

    create() {
        console.log("game - create")
        var self = this;
        this.socket = io();
        this.otherPlayer;
        this.socket.on('currentPlayers', function (players) {
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    self.addPlayer(self, players[id]);
                    self.playerIndex = players[id].index + 1;
                    if (self.playerIndex === 1) self.otherPlayerIndex = 2;
                    else self.otherPlayerIndex = 1;
                } else {
                    self.addOtherPlayer(self, players[id]);
                }
            });
        });

        this.socket.on('newPlayer', function (playerInfo) {
            self.addOtherPlayer(self, playerInfo);
        });

        this.socket.on('disconnect', function (playerId) {
            if (playerId === self.otherPlayer.playerId) {
                self.otherPlayer.destroy();
            }
        });

        this.socket.on('playerMoved', function (playerInfo) {
            if (playerInfo.playerId === self.otherPlayer.playerId) {
                self.otherPlayer.x = playerInfo.x;
                self.otherPlayer.y = playerInfo.y;
            }
        });

        this.socket.on('kickedBall', function (playerInfo) {
            if (playerInfo.playerId === self.otherPlayer.playerId) {
                self.ball.x = playerInfo.ballX;
                self.ball.y = playerInfo.ballY;
            }
        });

        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        this.platforms = this.physics.add.staticGroup();
        this.nets = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.nets.create(12, 394, 'net').refreshBody();
        this.nets.create(788, 394, 'net').refreshBody();


        // //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        //  The score
        this.scoreText = this.add.text(16, 16, "waiting for player...", {
            fontSize: '32px',
            fill: '#000'
        });

    }

    update() {
        if (this.player) {
            if (this.startGame) {
                this.addBall(this);
                this.scoreText.setText('Score: ' + this.score[0] + "-" + this.score[1]);
            }
            if (this.gameOver) {
                const finalScore = this.score[0] + "-" + this.score[1];
                if ((this.playerIndex === 1 && this.score[0] > this.score[1]) || (this.playerIndex === 2 && this.score[0] < this.score[1]))
                    this.scene.start("EndScene", {won: true, score: finalScore});
                else this.scene.start("EndScene", {won: false, score: finalScore});
            }
            if (this.startRound) {
                this.ball.x = 400;
                this.ball.y = 16;
                this.ball.setVelocity(0)

                this.player.y = 450;
                this.otherPlayer.y = 450;
                if (this.playerIndex == 1) {
                    this.player.x = 100;
                    this.otherPlayer.x = 700;
                } else {
                    this.player.x = 700;
                    this.otherPlayer.x = 100;
                }
                this.startRound = false;
            }

            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left' + this.playerIndex, true);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.player.anims.play('right' + this.playerIndex, true);
            } else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn' + this.playerIndex);
            }

            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-330);
            }

            if (this.otherPlayer) {
                if (this.otherPlayerIndex === 1) this.otherPlayer.anims.play('right1', true);
                else this.otherPlayer.anims.play('left2', true);
            }

            var x = this.player.x;
            var y = this.player.y;
            if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
                this.socket.emit('playerMovement', {x: x, y: y});
            }

            this.player.oldPosition = {
                x: this.player.x,
                y: this.player.y,
            };
        }
    }

    addPlayer(self, playerInfo) {
        var spriteIndex = '1';
        var x = 100;
        if (playerInfo.index === 1) {
            x = 700;
            spriteIndex = '2';
        }
        self.player = self.physics.add.sprite(x, 450, 'dude' + spriteIndex);
        self.addPlayerPhysics(self, self.player, spriteIndex);
    }

    addOtherPlayer(self, playerInfo) {
        var spriteIndex = '1';
        var x = 100;
        if (playerInfo.index === 1) {
            x = 700;
            spriteIndex = '2';
        }
        self.otherPlayer = self.physics.add.sprite(x, 450, 'dude' + spriteIndex);
        this.addPlayerPhysics(self, self.otherPlayer, spriteIndex);

        self.otherPlayer.playerId = playerInfo.playerId;
        self.startGame = true;
    }

    addPlayerPhysics(self, player, spriteIndex) {
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        self.physics.add.collider(player, self.platforms);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left' + spriteIndex,
            frames: this.anims.generateFrameNumbers('dude' + spriteIndex, {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn' + spriteIndex,
            frames: [{key: 'dude' + spriteIndex, frame: 4}],
            frameRate: 20
        });

        this.anims.create({
            key: 'right' + spriteIndex,
            frames: this.anims.generateFrameNumbers('dude' + spriteIndex, {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });
    }

    addBall(self) {
        self.startGame = false;
        self.balls = self.physics.add.group();
        self.ball = self.balls.create(400, 16, 'ball');
        self.ball.setBounce(0.6);
        self.ball.setCircle();
        self.ball.setFriction(0.005);
        self.ball.setCollideWorldBounds(true);
        self.physics.add.collider(self.ball, self.platforms);
        self.physics.add.collider(self.otherPlayer, self.ball, self.kickBall, null, self);
        self.physics.add.collider(self.player, self.ball, self.kickBall, null, self);
        self.physics.add.collider(self.balls, self.nets, self.scoreGoal, null, self)
    }

    kickBall(player, ball) {
        if (player.x < ball.x) {
            ball.setVelocityX(300);
        } else {
            ball.setVelocityX(-300);
        }
        if (player.y < ball.y) {
            ball.setVelocityY(-300);
        } else {
            ball.setVelocityY(300);
        }
        this.socket.emit('kickedBall', {ballX: ball.x, ballY: ball.y});
    }

    scoreGoal(ball, net) {
        if (ball.y > 110) {
            if (net.x < 400) {
                this.score[1] += 1
            } else this.score[0] += 1
            this.scoreText.setText('Score: ' + this.score[0] + "-" + this.score[1]);
            if (this.score[0] === this.maxScore || this.score[1] === this.maxScore) this.gameOver = true;
            else this.startRound = true;
        }
    }
}