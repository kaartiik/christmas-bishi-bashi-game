class Block extends PIXI.Sprite {
  constructor(x = 0, y = 0, width = 0, height = 0, imageURL) {
    super(imageURL);
    this.anchor.set(0.5);
    this.row = 0;
    this.column = 0;
    this.x = x;
    this.y = y;
    this.destinationY = 0;
    this.width = width;
    this.height = height;
    this.speed = 5;
  }

  status() {
    return "x of tile is " + this.x;
  }

  getRowAndColumn() {
    return { row: this.row, column: this.column };
  }

  setInitialPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setDestinationX(xVal) {
    this.x = xVal;
  }

  setHeadingDestination(xVal = 0, yVal = 0, row, col) {
    //check if the dropping tile is above the other tiles in the column and proceed
    if (this.y < yVal) {
      this.setDestinationY(yVal);
      this.setDestinationX(xVal);
      this.setRowAndCol(row, col);
    }
  }

  setDestinationY(yVal) {
    this.destinationY = yVal;
  }

  setRowAndCol(row, col) {
    this.row = row;
    this.column = col;
  }

  getRowAndCol() {
    return { row: this.row, column: this.column };
  }

  //destroy object
  destroyObject() {
    super.destroy();
  }

  moveDown(
    // delta,
    removeFallingObject
    // printMatrix
  ) {
    // use delta to create frame-independent transform
    let balance = this.destinationY - this.y;

    let balanceAbs = Math.abs(balance);

    if (balanceAbs > 4) {
      this.y += (balance / balanceAbs) * this.speed;
    } else {
      this.y += balance;

      removeFallingObject(this);
    }
  }

  disappearDown() {
    this.y += 5;
  }
}
