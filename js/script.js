window.onload = function () {
  const canvas = document.getElementById("canvas");
  const landingPage = document.getElementById("landingPage");
  const howToPage = document.getElementById("howToPage");
  const howToPlayLogo = document.getElementById("howToPlayLogo");
  const landingStartBtn = document.getElementById("landingStart");
  const landingHowToBtn = document.getElementById("landingHowTo");
  const startTextOverlay = document.getElementById("startTextOverlay");
  const timerDisplay = document.getElementById("startTimerText");
  const scoreBar = document.getElementById("scoreBar");
  const scoreDisplay = document.getElementById("score");
  const navLeftButton = document.getElementById("navLeftBtn");
  const navCenterButton = document.getElementById("navCenterBtn");
  const navRightButton = document.getElementById("navRightBtn");
  const gameOverModal = document.getElementById("gameOverOverlay");
  const innerFullscreenModal = document.getElementById("innerFullscreenModal");
  const greetingTo = document.getElementById("greetingTo");
  const greetingFrom = document.getElementById("greetingFrom");
  const greetingMessage = document.getElementById("greetingMessage");

  //How to play page carousel arrows
  const prevarrow = document.getElementById("prevarrow");
  const nextarrow = document.getElementById("nextarrow");

  howToPlayLogo.onpointerdown = goBackToLanding;

  prevarrow.onpointerdown = (event) => {
    plusSlides(-1);
  };
  nextarrow.onpointerdown = (event) => {
    plusSlides(1);
  };

  //Gameplay bgm
  const bgAudio = new Howl({
    src: ["/christmas-card/sounds/bgm.mp3"],
    loop: true,
    volume: 0.5,
  });

  //Collect gift sound effect
  const collectSound = new Howl({
    src: ["/christmas-card/sounds/collect.mp3"],
    autoplay: false,
    loop: false,
    volume: 0.7,
  });

  //Collision sound effect
  const collideSound = new Howl({
    src: ["/christmas-card/sounds/collide.mp3"],
    autoplay: false,
    loop: false,
    volume: 0.3,
  });

  //Only play audio when screen is focused
  window.addEventListener("blur", muteAudioWhenNotFocused);
  window.addEventListener("focus", unmuteWhenFocused);

  //Landing page buttons
  landingStartBtn.onpointerdown = startGame;
  landingHowToBtn.onpointerdown = howToPlay;

  //Arrow keys
  navLeftButton.onpointerdown = moveCharacterLeft;
  navCenterButton.onpointerdown = moveCharacterCenter;
  navRightButton.onpointerdown = moveCharacterRight;

  //Check if deveice is mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  //Check if device is Android
  const isAndroid = /Android/i.test(navigator.userAgent);

  const app = new PIXI.Application({
    width: isMobile ? window.innerWidth : window.innerHeight * (9 / 16),
    height: window.innerHeight,
    transparent: false,
    backgroundColor: 0x000000,
  });
  canvas.appendChild(app.view);

  //Global screen dimensions
  const SCREEN_WIDTH = app.screen.width;
  const SCREEN_HEIGHT = app.screen.height;
  const COLUMN_WIDTH = (1 / 3) * SCREEN_WIDTH;

  //Grid BG dimensions
  const GRID_WIDTH = (1 / 2) * SCREEN_WIDTH;
  const GRID_HEIGHT = (1 / 3.8) * SCREEN_HEIGHT;
  // const GRID_START_X = (SCREEN_WIDTH - GRID_WIDTH) / 2; might need
  const GRID_START_Y = SCREEN_HEIGHT - GRID_HEIGHT * 1.1;

  //Block dimension
  const portraitTileWidth = GRID_WIDTH / 3;
  const portraitTileHeight = GRID_WIDTH / 3;

  // Level object
  let level = {
    x: 0, // X position
    y: 0, // Y position
    columns: 3, // Number of tile columns
    rows: 14, // Number of tile rows
    blockwidth: portraitTileWidth, // Visual width of a tile
    blockheight: portraitTileHeight, // Visual height of a tile
  };

  //How To Play variable
  let slideIndex = 1;

  //Game Background sprite
  let bg;
  let character;
  let isCharacterStunned;

  let toonsLoaded;

  let grid;

  //Timer and score variables
  let timerCountdown;
  let intervalTimer;
  let timeleft;
  let score;

  let gameover;
  const GAMEOVER_SCORE = 20;

  //game logic tickers variables
  let tickerBlockFall;

  //Keep track of number of active tickers
  let activeTickers;

  //Character animations
  const IDLE = "idle";
  const LEFT = "left";
  const RIGHT = "right";
  const STUN = "stun";

  let presentTextures;
  let coalTextures;

  //API variables
  const API_URL = "https://backend.startsomething.sg/api/v1/greetingcard";
  let apiData;

  //Insert SS backend url here
  async function getCardMessage() {
    try {
      //Manually extract parameter
      // const url = window.location.href;
      // const id = url.substring(url.lastIndexOf("/") + 1);

      //Get just the parameter of the url
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const id = urlParams.get("id");

      //Sample id=61adbdb00b95f6bd9f86c603. Replace with id variable before deployment
      // const { data } = await axios.get(`${API_URL}/${id}`);

      //Sample data
      let variantUrl = "/card_assets/carolling.jpg";
      let nameFrom = "Kaartiik";
      let nameTo="Anyone";
      let message = "Merry Christmas"

      // if (data.variant.toLowerCase().includes("carolling")) {
      //   variantUrl = "/card_assets/carolling.jpg";
      // } else if (data.variant.toLowerCase().includes("santas")) {
      //   variantUrl = "/card_assets/santas.jpg";
      // } else if (data.variant.toLowerCase().includes("thanksgiving")) {
      //   variantUrl = "/card_assets/thanksgiving.jpg";
      // } else if (data.variant.toLowerCase().includes("sleigh-queen")) {
      //   variantUrl = "/card_assets/sleigh-queen.jpg";
      // } else if (data.variant.toLowerCase().includes("tree-decorating")) {
      //   variantUrl = "/card_assets/tree-decorating.jpg";
      // } else {
      //   variantUrl = "/card_assets/snowball-fight.jpg";
      // }

      apiData = { nameFrom, nameTo, message, variantUrl };
    } catch (error) {
      alert("Error receiving data please refresh or try again later.");
      console.error(error);
    }
  }

  //To generate random landing page images. Remove if no need
  function landingBackground() {
    const bgImages = [
      {
        bg: "/christmas-card/images/landingpage_assets/asset-3.png",
        startBtn: "/christmas-card/images/landingpage_assets/asset-2.png",
        howBtn: "/christmas-card/images/landingpage_assets/asset-1.png",
      },

      {
        bg: "/christmas-card/images/landingpage_assets/asset-6.png",
        startBtn: "/christmas-card/images/landingpage_assets/asset-8.png",
        howBtn: "/christmas-card/images/landingpage_assets/asset-7.png",
      },

      {
        bg: "/christmas-card/images/landingpage_assets/asset-9.png",
        startBtn: "/christmas-card/images/landingpage_assets/asset-5.png",
        howBtn: "/christmas-card/images/landingpage_assets/asset-4.png",
      },
    ];

    const bgChoice = Math.floor(Math.random() * bgImages.length);

    landingPage.style.backgroundImage = `url('${bgImages[bgChoice].bg}')`;
    landingStartBtn.src = bgImages[bgChoice].startBtn;
    landingHowToBtn.src = bgImages[bgChoice].howBtn;
  }

  //Load preview blocks
  function loadToons() {
    setup();

    function setup() {
      presentTextures = [];
      coalTextures = [];
      const characterTextures = {};
      characterTextures[IDLE] = [];
      characterTextures[LEFT] = [];
      characterTextures[RIGHT] = [];
      characterTextures[STUN] = [];

      //Present textures
      for (let i = 1; i <= 5; i++) {
        const texture = new PIXI.Texture.from(
          `/christmas-card/images/present_assets/Present${i}.png`
        );

        //Store preview blocks in a global array for later usage
        presentTextures.push(texture);
      }

      //Coal textures
      for (let i = 1; i <= 4; i++) {
        const texture = new PIXI.Texture.from(
          `/christmas-card/images/coal_assets/Coal${i}.png`
        );

        //Store coal blocks in a global array for later usage
        coalTextures.push(texture);
      }

      for (let i = 1; i <= 2; i++) {
        const texture = new PIXI.Texture.from(
          `/christmas-card/images/character_assets/Dice_idle${i}.png`
        );

        characterTextures[IDLE].push(texture);
      }

      for (let i = 1; i <= 3; i++) {
        const texture = new PIXI.Texture.from(
          `/christmas-card/images/character_assets/Dice_left${i}.png`
        );

        characterTextures[LEFT].push(texture);
      }

      for (let i = 1; i <= 3; i++) {
        const texture = new PIXI.Texture.from(
          `/christmas-card/images/character_assets/Dice_right${i}.png`
        );

        characterTextures[RIGHT].push(texture);
      }

      for (let i = 1; i <= 3; i++) {
        const texture = new PIXI.Texture.from(
          `/christmas-card/images/character_assets/Stun${i}.png`
        );

        characterTextures[STUN].push(texture);
      }

      const centerColumn = grid.getColumnCoordinates(1);

      //Character dimensions
      character = new Toon(
        centerColumn.x,
        GRID_START_Y,
        GRID_WIDTH,
        GRID_HEIGHT,
        characterTextures
      );

      character.idle();

      app.stage.addChild(character);

      toonsLoaded = true;
    }
  }

  function initVariables() {
    score = 0;
    // scoreDisplay.innerHTML = score;
    //game logic tickers.
    //Autostart is false and ticker is stopped initially to prevent tickers from running automatically when listener is added.
    tickerBlockFall = PIXI.Ticker.system; //system ticker is able to be stopped eventhough other shared tickers are running
    tickerBlockFall.autoStart = false;
    tickerBlockFall.stop();

    activeTickers = {
      active: 0,
    };

    presentTextures = [];

    gameover = false;

    //Used to check if all toons loaded
    toonsLoaded = false;

    //Used to check if character is stunned
    isCharacterStunned = false;
  }

  function initGrid() {
    grid = new Grid(
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      level.columns,
      COLUMN_WIDTH,
      SCREEN_HEIGHT,
      level.x,
      level.y,
      (x, y, w, h) => createRect(x, y, w, h)
    );
  }

  //load game BG
  function loadBG() {
    const bgTexture = new PIXI.Texture.from(
      "/christmas-card/images/backgrounds/bg.png"
    );

    bg = new PIXI.Sprite(bgTexture);
    bg.width = SCREEN_WIDTH;
    bg.height = SCREEN_HEIGHT;

    app.stage.addChild(bg);
  }

  //How To Play function
  showSlides(slideIndex);

  function plusSlides(n) {
    showSlides((slideIndex += n));
  }

  function currentSlide(n) {
    showSlides((slideIndex = n));
  }

  //How to play page carousel change function
  function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    if (n > slides.length) {
      goBackToLanding();
    }
    if (n < 1) {
      goBackToLanding();
    }
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }

    slides[slideIndex - 1].style.display = "block";
  }

  preloadAssetsAndVariables();

  //Check if windows is focused
  checkWindowFocus();

  function preloadAssetsAndVariables() {
    //Get random landing page background
    landingBackground();

    //Get card details from backend
    getCardMessage();

    //Init game variables
    initVariables();

    // Render assets
    render();
  }

  function startGame() {
    // landingPage.style.display = "none";
    //Hide how to page before sliding up landing page
    howToPage.style.display = "none";
    landingPage.classList.toggle("animate");

    timer();
    //Start new game after all renders complete
    newGame();

    //Start gameplay music
    startBGM();
  }

  function howToPlay() {
    landingPage.classList.toggle("animate");
  }

  function goBackToLanding() {
    landingPage.classList.toggle("animate");

    //reset to first how to play screen
    slideIndex = 1;
  }

  function newGame() {
    intervalTimer = setInterval(function () {
      checkGameOver();

      if (gameover) {
        gameOver();
      }

      //Only spawn objects when gamestart countdown has ended,
      //game is not over & score is less than max score
      if (timeleft < 0 && !gameover && score < GAMEOVER_SCORE) {
        generateNewDroppingBlockLoop();
      }
    }, 1000);
  }

  function render() {
    initGrid();
    loadBG();
    loadToons();

    // createRect(GRID_START_X, GRID_START_Y, GRID_WIDTH, GRID_HEIGHT);
  }

  //Start bgm with gameplay
  function startBGM() {
    bgAudio.play();
  }

  function muteAudioWhenNotFocused() {
    //Only mute audio on iOS when screen is not focused. Pause audio on desktop & Android
    if (isAndroid) {
      bgAudio.pause();
    } else if (isMobile) {
      bgAudio.muted = true;
    } else {
      bgAudio.pause();
    }
  }

  function unmuteWhenFocused() {
    //To prevent the bgm from playing when focusing on landing page
    if (landingPage.style.display === "none") {
      if (isAndroid) {
        bgAudio.play();
      } else if (isMobile) {
        bgAudio.muted = false;
      } else {
        bgAudio.play();
      }
    }
  }

  //Ensure window is focused. if not focused then keypress cant be detected
  function checkWindowFocus() {
    if (document.hasFocus() === false) {
      window.focus();
    }
    detectKeyPress();
  }

  function detectKeyPress() {
    document.addEventListener("keydown", function (event) {
      let key = event.key || event.keyCode;

      switch (key) {
        case "ArrowLeft":
          moveCharacterLeft();
          event.preventDefault();
          break;

        case "ArrowDown":
          moveCharacterCenter();
          event.preventDefault();
          break;

        case "ArrowRight":
          moveCharacterRight();
          event.preventDefault();
          break;
      }
    });
  }

  function timer() {
    //setInterval to countdown game time

    timeleft = 5;

    timerCountdown = new RecurringTimer(function () {
      if (timeleft === 0) {
        timerDisplay.innerHTML = "Start";
      } else if (timeleft < 0) {
        startTextOverlay.style.display = "none";
        timerCountdown.pause();
      } else {
        timerDisplay.innerHTML = timeleft;
      }
      timeleft -= 1;
    }, 1000);
  }

  function createRect(x, y, width, height) {
    var graphics = new PIXI.Graphics();

    // set the line style to have a width of 5 and set the color to red
    graphics.lineStyle(2, 0x000000);

    graphics.drawRect(x, y, width, height);

    app.stage.addChild(graphics);
  }

  function moveCharacterLeft() {
    //Dont move if character is stunned
    if (isCharacterStunned) return;

    let position = grid.getColumnCoordinates(0);

    character.x = position.x;
  }

  function moveCharacterCenter() {
    //Dont move if character is stunned
    if (isCharacterStunned) return;

    let position = grid.getColumnCoordinates(1);
    character.x = position.x;
  }

  function moveCharacterRight() {
    //Dont move if character is stunned
    if (isCharacterStunned) return;

    let position = grid.getColumnCoordinates(2);
    character.x = position.x;
  }

  function checkGameOver() {
    if (score >= GAMEOVER_SCORE) {
      gameover = true;
    }
  }

  function gameOver() {
    //Displays score modal
    gameOverModal.style.backgroundImage = `url('./images${apiData.variantUrl}')`;
    gameOverModal.style.backgorunc = "visible";
    gameOverModal.style.visibility = "visible";
    gameOverModal.style.opacity = 1;

    //Stops dropping block rendering loop
    clearInterval(intervalTimer);

    checkCardContentType();

    //Stop gameplay animation
    tickerBlockFall.stop();
  }

  //Used to delay present/coal spawn
  const delayLoop = (fn, delay) => {
    return (x, i) => {
      setTimeout(() => {
        fn(x);
      }, i * delay);
    };
  };

  //receives array of number of objects to drop per cycle
  function generateNewPresentOrCoal(arrayOfFallingObjects) {
    const arrayOfBlockMoveDownFunctions = [];

    //Render present/coal depending on type
    arrayOfFallingObjects.forEach(
      delayLoop((item) => {
        let currentDroppingObject = null;

        //get initial x coordinates
        let initialPosition = grid.getColumnCoordinates(item.columnPosition);

        if (item.isCoal) {
          //Block and bomb have same properties
          currentDroppingObject = new Block(
            initialPosition.x,
            initialPosition.y,
            level.blockwidth * 0.7,
            level.blockheight * 0.7,
            coalTextures[item.type]
          );
        } else {
          currentDroppingObject = new Block(
            initialPosition.x,
            initialPosition.y,
            level.blockwidth,
            level.blockheight,
            presentTextures[item.type]
          );
        }

        currentDroppingObject.setDestinationY(SCREEN_HEIGHT);

        app.stage.addChild(currentDroppingObject);

        activeTickers.active += 1;

        arrayOfBlockMoveDownFunctions.push((pos) => {
          currentDroppingObject.moveDown((currentDroppingObject) =>
            removeFallingObject(currentDroppingObject, pos)
          );

          //Check if gift is still dropping & check if it intersects with character
          if (
            currentDroppingObject.texture !== null &&
            currentDroppingObject.texture !== undefined
          ) {
            if (
              rectsIntersect(currentDroppingObject, character) &&
              !item.isCoal &&
              !isCharacterStunned
            ) {
              //Play sound effect
              collectSound.play();
              removeFallingObject(currentDroppingObject, pos);
              addScore();
            } else if (
              rectsIntersect(currentDroppingObject, character) &&
              item.isCoal
            ) {
              //Play sound effect
              collideSound.play();
              isCharacterStunned = true;
              character.stun();

              setTimeout(() => (isCharacterStunned = false), 3000);
            }
          }
        });
      }, 300) //Milliseconds number should not be  a factor of 1000, to not overlap with new set of spawned objects
    );

    //Only remove the ticker listener if all falling objects have been removed
    function removeFallingObject(currentDroppingObject, pos) {
      arrayOfBlockMoveDownFunctions.splice(pos, 1);
      app.stage.removeChild(currentDroppingObject);
      currentDroppingObject.destroyObject();
      activeTickers.active -= 1;

      if (arrayOfBlockMoveDownFunctions.length === 0) {
        tickerBlockFall.remove(tickerFuncFallingObject);
      }
    }

    function tickerFuncFallingObject(delta) {
      arrayOfBlockMoveDownFunctions.forEach((fn, idx) => fn(idx));
    }

    tickerBlockFall.start();
    tickerBlockFall.add(tickerFuncFallingObject);
  }

  function rectsIntersect(a, b) {
    let aBox = a.getBounds();
    let bBox = b.getBounds();

    return (
      aBox.x + aBox.width > bBox.x &&
      aBox.x < bBox.x + bBox.width &&
      aBox.y + aBox.height > bBox.y + 100 && //100 is to only consider intersection when giftbag is touched
      aBox.y < bBox.y + bBox.height - 50 //Subtract 50 to not collect gift when it exceeds the bag level eventhough it intersects with the character
    );
  }

  function generateNewDroppingBlockLoop() {
    //Only generate block when game is not paused, not over and no other block animations are running
    //One set of gifts max=3 activeTickers. 3 sets of gifts max=9 activeTickers
    if (activeTickers.active < 9 && toonsLoaded) {
      //To determine no of falling objects at a given time
      const noOfFallingObjects = generateNoOfFallingObjects();

      const arrayOfFallingObjects = new Array(noOfFallingObjects).fill(1);

      //contains position for each falling object
      const objectColumnPositions = [];

      //generate falling unique object positions
      while (objectColumnPositions.length < arrayOfFallingObjects.length) {
        let r = generateRandomInitialColumnTile();
        if (objectColumnPositions.indexOf(r) === -1)
          objectColumnPositions.push(r);
      }

      //type 0: bomb, type 1: present
      const modArrayOfFallingObjects = arrayOfFallingObjects.map(
        (item, idx) => {
          if (coalSpawn()) {
            return {
              type: generateRandomCoalType(),
              isCoal: true,
              columnPosition: objectColumnPositions[idx],
            };
          }
          return {
            type: generateRandomPresentType(),
            isCoal: false,
            columnPosition: objectColumnPositions[idx],
          };
        }
      );

      generateNewPresentOrCoal(modArrayOfFallingObjects);
    }
  }

  function coalSpawn() {
    const coalProbability = Math.random();

    if (coalProbability < 0.3) return true;
    else return false;
  }

  function generateNoOfFallingObjects() {
    return Math.ceil(Math.random() * 3);
  }

  function generateRandomInitialColumnTile() {
    return Math.ceil(Math.random() * level.columns - 1);
  }

  function generateRandomPresentType() {
    return Math.ceil(Math.random() * presentTextures.length - 1);
  }

  function generateRandomCoalType() {
    return Math.ceil(Math.random() * coalTextures.length - 1);
  }

  function addScore() {
    //To prevent from score bar exceeding max range
    if (score < GAMEOVER_SCORE) {
      score += 1;
      moveProgressBar();
    }
  }

  var width = 0;

  function moveProgressBar() {
    width += 5;

    scoreBar.style.display = "block";

    scoreBar.style.width = width + "%";
    scoreDisplay.innerHTML = `${width / 5} / ${GAMEOVER_SCORE}`;
  }

  function checkCardContentType() {
    const { nameFrom, nameTo, message, variantUrl } = apiData;

    greetingFrom.innerHTML = `FROM: ${nameFrom}`;
    greetingTo.innerHTML = `TO: ${nameTo}`;
    greetingMessage.innerHTML = message;

    let url = `/christmas-card/images${variantUrl}`;

    const element = document.createElement("img");

    element.src = url;
    element.style.width = "100%";
    element.style.height = "auto";
    element.style.marginTop = "5%";
    element.style.marginBottom = "5%";

    innerFullscreenModal.insertBefore(
      element,
      innerFullscreenModal.childNodes[2]
    );
    console.log(element);
  }
};
