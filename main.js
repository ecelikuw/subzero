function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 20;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "SaddleBrown";
    ctx.fillRect(0, 350, 800, 300);
    ctx.fillStyle = "darkgreen";
    ctx.fillRect(0, 400, 800, 500);
    ctx.font = "18px ariel";
    ctx.fillText("A = Move Left,    D = Move Right,     W = Kick,   Space = Jump ", 150, 90);
    ctx.fillText("~~~ Emrullah Celik ~~~", 300, 120);
    Entity.prototype.draw.call(this);
}

function Subzero(game) {
    this.animationright = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 6, 0, 46.6, 110, 0.09, 10, true, false); 
    this.animationleft = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 8, 119, 46.8, 110, 0.09, 10, true, false); 
    this.walkanimationright = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 16, 231, 50, 125, 0.19, 9, true, false); 
    this.walkanimationleft = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 16, 358, 51.6, 125, 0.19, 9, true, false); 
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 0, 473, 65, 142, 0.14, 10, false, true); 
    // this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 0, 605, 67, 142, 0.14, 10, false, true); 
    this.kickanimationright = new Animation(ASSET_MANAGER.getAsset("./img/sz1.png"), 0, 748, 71.47, 110, 0.15, 6, false, true); 

    this.right = false;
    this.left = false;
    this.kick = false;
    this.jumping = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 100, 260);

}

Subzero.prototype = new Entity();
Subzero.prototype.constructor = Subzero;


Subzero.prototype.update = function () {
// Borders
    if (this.x <= 0) {
        this.x = this.x + 5;
    }
    if (this.x >= 800 - 65) {   // frame width - sprite width
        this.x = this.x - 5;
    }

//Kick
    if (this.game.W) this.kick = true;
    if (this.kick) {
        if (this.kickanimationright.isDone()) {
            this.kickanimationright.elapsedTime = 0;
            this.kick = false;
        }
    }

//Stop Moving
    if (!this.game.D || !this.game.A) this.right = false;

//Move Right
        if (this.game.D) {
        this.left = false;
        this.right = true;
        this.x += 5;
        }
  
//Move Left
        if (this.game.A) {
        this.left = true;
        this.right = true;
        this.x -= 5;
        }

//Jump
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 250;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
        this.y = this.y - 140;
    }
    Entity.prototype.update.call(this);
}

Subzero.prototype.draw = function (ctx) {
    if (this.left) {
        if (this.jumping) {
            ctx.save();
            ctx.scale(-1, 1);
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 55, this.y);
            ctx.restore();
        }
        else if (this.right) {
            this.walkanimationleft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        else if (this.kick) {
            ctx.save();
            ctx.scale(-1, 1);
            this.kickanimationright.drawFrame(this.game.clockTick, ctx, -this.x - 40, this.y);
            ctx.restore();
        }
        else {
            this.animationleft.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    else {
        if (this.jumping) {
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 30);
        }
        else if (this.right) {
            this.walkanimationright.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        else if (this.kick) {
            this.kickanimationright.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
        else {
            this.animationright.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    Entity.prototype.draw.call(this);

}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/sz1.png");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var subzero = new Subzero(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(subzero);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
