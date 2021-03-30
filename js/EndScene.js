export default class EndScene extends Phaser.Scene{
    constructor() {
        super("EndScene");
    }

    create(data){
        this.won = data.won;
        this.score = data.score;
        console.log("end - create");
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        if(this.won) {
            const text = this.add.text(screenCenterX, screenCenterY - 30, 'You won!', {
                fontSize: '60px',
                fill: '#0f0'
            }).setOrigin(0.5);
        }
        else {
            const text = this.add.text(screenCenterX, screenCenterY - 30, 'You lost!', {
                fontSize: '60px',
                fill: '#f00'
            }).setOrigin(0.5);
        }
        const scoreText = this.add.text(screenCenterX, screenCenterY + 40, this.score, {
            fontSize: '60px',
            fill: '#fff'
        }).setOrigin(0.5);
    }
}