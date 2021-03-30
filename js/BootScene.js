export default class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene")
    }

    create() {
        console.log('boot - create');
        this.scene.start("PreloadScene");
    }
}
