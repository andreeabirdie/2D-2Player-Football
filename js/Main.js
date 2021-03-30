import BootScene from './BootScene.js';
import PreloadScene from './PreloadScene.js';
import GameScene from './GameScene.js';
import EndScene from './EndScene.js';

// Load our scenes
var bootScene = new BootScene();
var preloadScene = new PreloadScene();
var gameScene = new GameScene();
var endScene = new EndScene();

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    }
};

var game = new Phaser.Game(config);

// load scenes
game.scene.add('BootScene', bootScene);
game.scene.add('PreloadScene', preloadScene);
game.scene.add("GameScene", gameScene);
game.scene.add("EndScene", endScene);

// start title
game.scene.start('BootScene');