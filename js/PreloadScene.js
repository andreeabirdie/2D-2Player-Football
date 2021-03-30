export default class PreloadScene extends Phaser.Scene{
    constructor() {
        super("PreloadScene");
    }

    preload(){
        console.log('preload - preload');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('ball', 'assets/pangball.png');
        this.load.image('net', 'assets/net.png');
        this.load.spritesheet('dude1', 'assets/dude1.png', {frameWidth: 32, frameHeight: 48});
        this.load.spritesheet('dude2', 'assets/dude2.png', {frameWidth: 32, frameHeight: 48});
    }

    create() {
        console.log('preload - create');
        this.scene.start("GameScene")
    }
}