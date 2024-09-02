let config = {
    type: Phaser.AUTO,
    width: 480,
    height: 320,
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
let froggy, deadFrog;
let mumFrog;
let downArrow, upArrow, leftArrow, rightArrow;
let quack, smash, heart;
let car=[];
let twoCar=[];
let money=[];
let score, countDown, scoreText, countDownText;
let playButtonImage;

let countDownTimer, STARTCOUNTDOWN;

let carNBinArow, rowNB;

let bestScores=[];

let playing;

//
function init() {
    carNBinArow=5;
    rowNB= 2;
    score=0;
    STARTCOUNTDOWN=60;
    bestScores= [0,0,0]
}

function preload() {
    this.load.image('background', './assets/images/new_background.jpg');
    this.load.image('titlescreen', './assets/images/dragonTitleScreen.png');

    this.load.image('frog', './assets/images/Dragon.png');

    this.load.image('mum', './assets/images/new_cave.png');

    this.load.image('heart', './assets/images/heart.png');

    this.load.image('car1', './assets/images/ugly_bird.png');

    this.load.image('car2', './assets/images/dodo.png');
    this.load.image('car3', './assets/images/blue.png');

    this.load.image('car4', './assets/images/ugly_birdVers.png');

    this.load.image('car5', './assets/images/dodoVers.png');
    this.load.image('car6', './assets/images/blueVers.png');

    this.load.image('coin', './assets/images/coin.png');

    this.load.image('playButton', './assets/images/playButton.webp');

    this.load.audio('quack', './assets/audio/coaac.wav');

    this.load.audio('smash', './assets/audio/smashed.wav');
}

function create() {
    let backImage= this.add.image(0,0, 'background');
    backImage.setOrigin(0,0);
    // backImage.setScale(5);

    froggy= this.add.image(8+Phaser.Math.Between(0, 29)*16,312, 'frog');
    // froggy.setOrigin(0,0);
    // froggy.setScale(2);

    mumFrog= this.add.image(8+Phaser.Math.Between(0, 22)*16,8, 'mum');

    deadFrog= this.add.image(froggy.x,froggy.y, 'deadfrog');
    deadFrog.setVisible(false);

    let space =config.width/ carNBinArow;

    money[0]= this.add.image(Phaser.Math.Between(12, 450),235, 'coin');

    money[1]= this.add.image(Phaser.Math.Between(12, 450),175, 'coin');

    money[2]= this.add.image(Phaser.Math.Between(12, 450),110, 'coin');

    money[3]= this.add.image(Phaser.Math.Between(12, 380),30, 'coin');

    for (let j = 0; j < rowNB; j++) {

        for (let i = 0; i < carNBinArow; i++) {
            car[i+j*carNBinArow]= this.physics.add.image(i*space + Phaser.Math.Between(-10,10),264-128*j, 'car' + Phaser.Math.Between(1,3));
            car[i+j*carNBinArow].setVelocity(70,0);
        }
    }

    for (let k = 0; k < rowNB; k++) {

        for (let i = 0; i < carNBinArow; i++) {
            twoCar[i+k*carNBinArow]= this.physics.add.image(i*space + Phaser.Math.Between(-10,10),205-128*k, 'car' + Phaser.Math.Between(4,6));
            twoCar[i+k*carNBinArow].setVelocity(-70,0);
        }
    }

    heart= this.add.image(240,180, 'heart');
    heart.setScale(0);

    heartTween = this.tweens.add({
        targets: heart,
        y: 100,
        scaleY: 2,
        scaleX: 2,
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

    scoreText= this.add.text(410, 0, 'Score: '+ score, { fontFamily: 'Arial', fontSize: 15, color: ' #FFFFFF'});

    countDownText= this.add.text(420, 30, countDown + 's', { fontFamily: 'Arial', fontSize: 15, color: ' #FFFFFF'});

    countDownTimer= this.time.addEvent({
        delay: 1000, // ms
        callback: countingDown,
        //args: [],
        callbackScope: this,
        repeat: -1,
        paused: true
    })

    titleScreenImage= this.add.image(0,0, 'titlescreen');
    titleScreenImage.setOrigin(0,0);
    titleScreenImage.setScale(0.68);

    bestScoreText1= this.add.text(190, 155, 'Premier:  '+ bestScores[0], { fontFamily: 'Arial', fontSize: 15, color: ' #ff0000'});
    bestScoreText2= this.add.text(190, 195, 'Deuxieme:  '+ bestScores[1], { fontFamily: 'Arial', fontSize: 15, color: ' #ff0000'});
    bestScoreText3= this.add.text(190, 235, 'Troisieme:  '+ bestScores[2], { fontFamily: 'Arial', fontSize: 15, color: ' #ff0000'});

    playButtonImage= this.add.image(240,290, 'playButton').setInteractive();
    playButtonImage.setScale(0.05);
    playButtonImage.on('pointerdown', startGame)
}

function update() {

    //Verifier si la voiture sort à droite de l'écran

    for (let i = 0; i < carNBinArow*rowNB; i++) {
        if(car[i].x>480) car[i].x = 0;
    }

    for (let h = 0; h < carNBinArow*rowNB; h++) {
        if(twoCar[h].x<0) twoCar[h].x = 480;
    }

    //JustDown pour verifier
    if(Phaser.Input.Keyboard.JustDown(upArrow)&& froggy.y>8){
        froggy.y-=16;
        froggy.angle= 0;
        quack.play();
    };

    if(Phaser.Input.Keyboard.JustDown(downArrow)&& froggy.y<312){
        froggy.y+=16;
        froggy.angle=180;
        quack.play();
    };

    if(Phaser.Input.Keyboard.JustDown(leftArrow)&& froggy.x>8){
        froggy.x-=16;
        froggy.angle=270;
        quack.play();
    };

    if(Phaser.Input.Keyboard.JustDown(rightArrow)&& froggy.x<472){
        froggy.x+=16;
        froggy.angle=90;
        quack.play();
    };


    if(Phaser.Geom.Intersects.RectangleToRectangle(froggy.getBounds(), mumFrog.getBounds())) {
        heartTween.play();
        froggy.x= -1000;
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
        if(Phaser.Geom.Intersects.RectangleToRectangle(froggy.getBounds(), money[m].getBounds())) {
            // smash.play();
    
            money[m].x=-1000;
            score+=1;
            scoreText.text= "Score: "+ score;
        };
    }

    for (let i = 0; i < carNBinArow*rowNB; i++) {
        
        if(Phaser.Geom.Intersects.RectangleToRectangle(froggy.getBounds(), car[i].getBounds())) {
            // heartTween.play();
    
            smash.play();
            deadFrog.setPosition(froggy.x, froggy.y);
            deadFrog.setVisible(true);

            resetFrogPosition();
            
        };

        if(Phaser.Geom.Intersects.RectangleToRectangle(froggy.getBounds(), twoCar[i].getBounds())) {
            // heartTween.play();
    
            smash.play();
            deadFrog.setPosition(froggy.x, froggy.y);
            deadFrog.setVisible(true);

            resetFrogPosition();
            
        };
        
    }
    
}

function resetFrogPosition(){

    deadFrog.setVisible(false);
    froggy.setPosition(8+Phaser.Math.Between(0, 29)*16, 312);
    froggy.angle= 0;
    
}

function resetMoneyPosition(){

    money[0].setPosition(Phaser.Math.Between(0, 450),235);

    money[1].setPosition(Phaser.Math.Between(0, 450),175);

    money[2].setPosition(Phaser.Math.Between(0, 450),110);

    money[3].setPosition(Phaser.Math.Between(0, 450),30);
    
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

        bestScoreText1.text= "Premier: "+ bestScores[0];
        bestScoreText2.text= "Deuxieme: "+ bestScores[1];
        bestScoreText3.text= "Troisième: "+ bestScores[2];

    
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

    froggy.setPosition(8+Phaser.Math.Between(0, 29)*16, 312);
    froggy.angle= 0;

    mumFrog.setPosition(Phaser.Math.Between(1, 25)*16, 8);

    playing= false;

}

function insertNewScoreInBestScores(newScore){

    bestScores.push(newScore);
    bestScores = bestScores.sort(function(a,b){return a-b}).reverse().slice(0,3);
}