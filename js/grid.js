class Grid {
  constructor(
    gridWidth = 0,
    gridHeight = 0,
    columns = 0,
    tilewidth = 0,
    tileheight = 0,
    startX = 0,
    startY = 0,
    createRect
  ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.columns = columns;
    this.tilewidth = tilewidth;
    this.tileheight = tileheight;
    this.startX = startX;
    this.startY = startY;
    this.createRect = createRect;
    //Each array within represents a row. Items within an array represents a column
    this.matrix = []; //{ type, colour, blockObject, isBomb, shift row, col, x, y};

    this.init();
  }

  init() {
    let yOffset = this.startY;

    let xOffset = this.startX;
    for (var col = 0; col < this.columns; col++) {
      if (col > 0) {
        xOffset += this.tilewidth;
      }
      // Define a tile type and a shift parameter for animation
      this.matrix[col] = {
        type: -1,
        blockObject: null,
        col,
        x: xOffset + this.tilewidth / 2,
      };

      // this.createRect(xOffset, yOffset, this.tilewidth, this.tileheight);
    }
  }

  getMatrix() {
    return this.matrix;
  }

  getColumnCoordinates(column) {
    return this.matrix[column];
  }

  printMatrix() {
    console.log("PRINT MATRIX");
    for (let row = 0; row < this.rows; row++) {
      let r = "";
      for (let col = 0; col < this.columns; col++) {
        r += ` ${this.matrix[row][col].type} `;
      }
      console.log(r);
      r = "";
    }
  }
}

// export default Grid;
