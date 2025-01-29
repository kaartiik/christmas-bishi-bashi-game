class Toon extends PIXI.AnimatedSprite {
  constructor(x, y, width, height, toonTextures) {
    super(toonTextures["idle"]);
    this.toonTextures = toonTextures;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.destinationX = x;
    this.loop = true;
    this.animationSpeed = 0.04;
    this.anchor.set(0.5);
    this.play();
  }

  status() {
    return "speed of toon is " + this.animationSpeed;
  }

  idle() {
    this.textures = this.toonTextures.idle;
    this.loop = true;
    this.play();
  }

  left() {
    this.textures = this.toonTextures.left;
    this.loop = true;
    this.play();
    // this.onComplete = function () {
    //   this.idle();
    // };
  }

  right() {
    this.textures = this.toonTextures.right;
    this.loop = true;
    this.play();
    // this.onComplete = function () {
    //   this.idle();
    // };
  }

  move(removeTicker) {
    if (this.x < this.destinationX) {
      const balance = this.destinationX - this.x;

      if (balance > 3) {
        this.x += 3;
      } else {
        this.x += balance;
      }
    } else if (this.x > this.destinationX) {
      const balance = this.x - this.destinationX;

      if (balance > 3) {
        this.x -= 3;
      } else {
        this.x -= balance;
      }
    } else {
      removeTicker();
      this.idle();
    }
  }

  stun() {
    this.textures = this.toonTextures.stun;
    this.loop = true;
    this.play();

    setTimeout(() => this.idle(), 3000);
  }
}
