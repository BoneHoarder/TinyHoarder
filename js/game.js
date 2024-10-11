let config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    physics: {
        default: 'arcade'
    },
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update
    },
    audio: {         
        disableWebAudio: true     
    },
    autoCenter: true
};

// Déclaration de nos variables globales
let game = new Phaser.Game(config);

let titleScreenImage;
let dragon, deadFrog;
let cave;
let downArrow, upArrow, leftArrow, rightArrow;
let quack, smash, heart;
let birds=[];
let otherBirds=[];
let money=[];
let score, countDown, scoreText, countDownText;
let playButtonImage;

let countDownTimer, STARTCOUNTDOWN;

let birdNBinArow, rowNB;

let bestScores=[];

let playing;

//
function init() {
    birdNBinArow=5;
    rowNB= 2;
    score=0;
    STARTCOUNTDOWN=60;
    bestScores= [0,0,0]
}

function preload() {
    this.load.image('background', './assets/images/new_background.jpg');
    this.load.image('titlescreen', './assets/images/new_titlescreen2.jpg');

    this.load.image('dragon', './assets/images/Dragon.png');

    this.load.image('cave', './assets/images/new_cave.png');

    this.load.image('heart', './assets/images/heart.png');

    this.load.image('car1', './assets/images/ugly_bird.png');

    this.load.image('car2', './assets/images/dodo.png');
    this.load.image('car3', './assets/images/blue.png');

    this.load.image('car4', './assets/images/ugly_birdVers.png');

    this.load.image('car5', './assets/images/dodoVers.png');
    this.load.image('car6', './assets/images/blueVers.png');

    this.load.image('coin', './assets/images/coin.png');

    this.load.image('playButton', './assets/images/playButtonCustom.png');

    this.load.audio('quack', './assets/audio/coaac.wav');

    this.load.audio('smash', './assets/audio/smashed.wav');
}

function create() {
    let backImage= this.add.image(0,1, 'background');
    backImage.setOrigin(0,0);
    // backImage.setScale(5);

    dragon= this.add.image(12+Phaser.Math.Between(0, 60)*16, 610, 'dragon');
    // froggy.setOrigin(0,0);
    //froggy.setScale(2);

    cave= this.add.image(8+Phaser.Math.Between(0, 55)*16,28, 'cave');

    deadFrog= this.add.image(dragon.x,dragon.y, 'deadfrog');
    deadFrog.setVisible(false);

    let space =config.width/ birdNBinArow;

    money[0]= this.add.image(Phaser.Math.Between(12, 950),60, 'coin');

    money[1]= this.add.image(Phaser.Math.Between(12, 950),195, 'coin');

    money[2]= this.add.image(Phaser.Math.Between(12, 950),320, 'coin');

    money[3]= this.add.image(Phaser.Math.Between(12, 950),445, 'coin');

    for (let j = 0; j < rowNB; j++) {

        for (let i = 0; i < birdNBinArow; i++) {
            birds[i+j*birdNBinArow]= this.physics.add.image(i*space + Phaser.Math.Between(-10,10),500-250*j, 'car' + Phaser.Math.Between(1,3));
            birds[i+j*birdNBinArow].setVelocity(70,0);
        }
    }

    for (let k = 0; k < rowNB; k++) {

        for (let i = 0; i < birdNBinArow; i++) {
            otherBirds[i+k*birdNBinArow]= this.physics.add.image(i*space + Phaser.Math.Between(-10,10),380-250*k, 'car' + Phaser.Math.Between(4,6));
            otherBirds[i+k*birdNBinArow].setVelocity(-70,0);
        }
    }

    heart= this.add.image(430,180, 'heart');
    heart.setScale(0);

    heartTween = this.tweens.add({
        targets: heart,
        y: 400,
        x: 500,
        scaleY: 4,
        scaleX: 4,
        duration: 2000,
        ease: 'linear',
        yoyo : true,
        loop: 0,
        paused: true
    });
    quack= this.sound.add('quack');
    smash= this.sound.add('smash');

    downArrow= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    upArrow= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    leftArrow= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    rightArrow= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    scoreText= this.add.text(880, 0, 'Score: '+ score, { fontFamily: 'Arial', fontSize: 20, color: ' #FFFFFF'});

    countDownText= this.add.text(920, 30, countDown + 's', { fontFamily: 'Arial', fontSize: 20, color: ' #FFFFFF'});

    countDownTimer= this.time.addEvent({
        delay: 1000, // ms
        callback: countingDown,
        //args: [],
        callbackScope: this,
        repeat: -1,
        paused: true
    })

    titleScreenImage= this.add.image(0.6,1, 'titlescreen');
    titleScreenImage.setOrigin(0,0);
    titleScreenImage.setScale(0.75);

    bestScoreText1= this.add.text(400, 325, 'First:  '+ bestScores[0], { fontFamily: 'Arial', fontSize: 30, color: ' #ff0000'});
    bestScoreText2= this.add.text(400, 385, 'Second:  '+ bestScores[1], { fontFamily: 'Arial', fontSize: 30, color: ' #ff0000'});
    bestScoreText3= this.add.text(400, 450, 'Third:  '+ bestScores[2], { fontFamily: 'Arial', fontSize: 30, color: ' #ff0000'});

    playButtonImage= this.add.image(480,550, 'playButton').setInteractive();
    playButtonImage.setScale(0.1);
    playButtonImage.on('pointerdown', startGame);


    // this.physics.add.collider(froggy, car, collisionCarPlayer, null, this);

    // this.physics.add.collider(froggy, twoCar, collisionTwoCarPlayer, null, this);

}

function update() {
    
    //Verifier si la voiture sort à droite de l'écran

    for (let i = 0; i < birdNBinArow*rowNB; i++) {
        if(birds[i].x>1000) birds[i].x = 0;
    }

    for (let h = 0; h < birdNBinArow*rowNB; h++) {
        if(otherBirds[h].x<0) otherBirds[h].x = 1000;
    }

    //JustDown pour verifier
    if(Phaser.Input.Keyboard.JustDown(upArrow)&& dragon.y>8){
        dragon.y-=26;
        dragon.angle= 0;
        quack.play();
    };

    if(Phaser.Input.Keyboard.JustDown(downArrow)&& dragon.y<630){
        dragon.y+=26;
        dragon.angle=180;
        quack.play();
    };

    if(Phaser.Input.Keyboard.JustDown(leftArrow)&& dragon.x>8){
        dragon.x-=26;
        dragon.angle=270;
        quack.play();
    };

    if(Phaser.Input.Keyboard.JustDown(rightArrow)&& dragon.x<950){
        dragon.x+=26;
        dragon.angle=90;
        quack.play();
    };


    if(Phaser.Geom.Intersects.RectangleToRectangle(dragon.getBounds(), cave.getBounds())) {
        heartTween.play();
        dragon.x= -1000;
        // score+=1;
        // scoreText.text= "Score: "+ score;

        this.time.addEvent({
            delay: 2000, // ms
            callback: resetFrogPosition,
            //args: [],
            callbackScope: this,
            repeat: 0
        })

        resetMoneyPosition();

    };

    for (let m = 0; m < 4; m++) {
        if(Phaser.Geom.Intersects.RectangleToRectangle(dragon.getBounds(), money[m].getBounds())) {
            // smash.play();
    
            money[m].x=-1000;
            score+=1;
            scoreText.text= "Score: "+ score;
        };
    }

    for (let i = 0; i < birdNBinArow*rowNB; i++) {
        
        if(Phaser.Geom.Intersects.RectangleToRectangle(dragon.getBounds(), birds[i].getBounds())) {
            // heartTween.play();
    
            smash.play();
            deadFrog.setPosition(dragon.x, dragon.y);
            deadFrog.setVisible(true);

            resetFrogPosition();
            
        };

        if(Phaser.Geom.Intersects.RectangleToRectangle(dragon.getBounds(), otherBirds[i].getBounds())) {
            // heartTween.play();
    
            smash.play();
            deadFrog.setPosition(dragon.x, dragon.y);
            deadFrog.setVisible(true);

            resetFrogPosition();
            
        };
        
    }
    
}

function resetFrogPosition(){

    deadFrog.setVisible(false);
    dragon.setPosition(12+Phaser.Math.Between(0, 55)*16, 620);
    dragon.angle= 0;
    
}

function resetMoneyPosition(){

    money[0].setPosition(Phaser.Math.Between(12, 950),60);

    money[1].setPosition(Phaser.Math.Between(12, 950),195);

    money[2].setPosition(Phaser.Math.Between(12, 950),320);

    money[3].setPosition(Phaser.Math.Between(12, 950),445);
    
}

function countingDown(){
    countDown-=1;
    countDownText.text= countDown + 's';

    if(countDown==0){
        titleScreenImage.setVisible(true);
        bestScoreText1.setVisible(true);
        bestScoreText2.setVisible(true);
        bestScoreText3.setVisible(true);
        playButtonImage.setVisible(true);

        insertNewScoreInBestScores(score);
        resetMoneyPosition();

        bestScoreText1.text= "First : "+ bestScores[0];
        bestScoreText2.text= "Second : "+ bestScores[1];
        bestScoreText3.text= "Third : "+ bestScores[2];

    
        countDownTimer.paused= false;
        playing = false;
    }
}

function startGame(){
    titleScreenImage.setVisible(false);
    bestScoreText1.setVisible(false);
    bestScoreText2.setVisible(false);
    bestScoreText3.setVisible(false);
    playButtonImage.setVisible(false);

    countDownTimer.paused= false;

    score=0;
    scoreText.text= "Score: "+ score;
    countDown= STARTCOUNTDOWN;
    countDownText.text= countDown + 's';

    dragon.setPosition(8+Phaser.Math.Between(0, 29)*16, 610);
    dragon.angle= 0;

    cave.setPosition(Phaser.Math.Between(1, 25)*16, 28);

    playing= false;

}

function insertNewScoreInBestScores(newScore){

    bestScores.push(newScore);
    bestScores = bestScores.sort(function(a,b){return a-b}).reverse().slice(0,3);
}

