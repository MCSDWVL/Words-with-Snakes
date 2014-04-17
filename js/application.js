var gNeedsRedrawn = true;
var DRAW_RATE = 1/60; // 60 fps?
var TIME_BETWEEN_SNAKE_MOVES = 1000/15;
var START_AS_LETTER_PERCENT = 0.01;
var TIME_BETWEEN_LETTERS = 2000;
var gGameBoard;
var gSnakeManager;
var NUM_ROWS = 25;
var NUM_COLS = 25;
var SPACING = 1;
var LINE_WIDTH = 1;
var BOARD_SIZE = 25 * 25;

var gGameOver = false;
var gScore = 0;
var gMultiplier = 1;
var gLetters = "";
var gStatus = "";
var gAlreadyMovedSinceLastUpdate = false;

var regOnce = false;
var gAllowForceMove = false;
var gRemoveSnakeSectionsOnSend = false;

var gTimeLimit = -1;
var gCountDownTime = -1;
var gTimerUpdateHandle;

var gSnakeLengthBasedOnLetterValue = false;

var scoreHolder = document.querySelector(".score");
var lettersHolder = document.querySelector(".letters");
var timerHolder = document.querySelector(".timer");

// Directions 
var DIRECTION =
{
	"LEFT": 37,
	"UP": 38,
	"RIGHT": 39,
	"DOWN": 40,
	"NUM_DIRECTIONS": 4
}

var LETTERS = ["A", "A", "A", "A", "A", "A", "A", "A", "A",
				"B", "B",
				"C", "C",
				"D", "D", "D", "D",
				"E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E", "E",
				"F", "F",
				"G", "G", "G",
				"H", "H",
				"I", "I", "I", "I", "I", "I", "I", "I", "I",
				"J",
				"K",
				"L", "L", "L", "L",
				"M", "M",
				"N", "N", "N", "N", "N", "N",
				"O", "O", "O", "O", "O", "O", "O", "O",
				"P", "P",
				"Q",
				"R", "R", "R", "R", "R", "R",
				"S", "S", "S", "S",
				"T", "T", "T", "T", "T", "T",
				"U", "U", "U", "U",
				"V", "V",
				"W", "W",
				"X",
				"Y", "Y",
				"Z",
// "*", "*",
				];

//-----------------------------------------------------------------------------
function getUrlVars()
{
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++)
	{
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

//-----------------------------------------------------------------------------
function Init()
{
	// get url vals
	var urlVars = getUrlVars();

	// check word?
	if (urlVars["word"])
	{
		var wordOk = checkDictionary(urlVars["word"]);
		alert(urlVars["word"] + " " + wordOk + " " + getScore(urlVars["word"]));
	}

	// allow instant update on direction change
	if (urlVars["forcemove"])
	{
		gAllowForceMove = true;
	}

	// size of board
	if (urlVars["size"])
	{
		NUM_ROWS = NUM_COLS = parseInt(urlVars["size"]);
	}

	// speed of snake
	if (urlVars["speed"])
	{
		var asInt = parseInt(urlVars["speed"]);
		if (!isNaN(asInt))
			TIME_BETWEEN_SNAKE_MOVES = 1000 / asInt;
	}

	// starting letter percent
	if (urlVars["pct"])
	{
		var asInt = parseInt(urlVars["pct"]);
		if (!isNaN(asInt))
			START_AS_LETTER_PERCENT = asInt / 100.0;
	}

	// time limit
	if (urlVars["limit"])
	{
		var asInt = parseInt(urlVars["limit"]);
		if(!isNaN(asInt))
			gTimeLimit = asInt;
	}

	// reset game state
	gGameOver = false;
	gScore = 0;
	gMultiplier = 1;
	gLetters = "";

	// get the canvas
	var drawingCanvas = document.getElementById('myDrawing');

	// create the game board
	gGameBoard = new GameBoard();
	gGameBoard.InitEmptyGrid();

	// create the snake manager
	gSnakeManager = new SnakeManager();

	// push starting index
	gSnakeManager.m_snakePieces.push(0);

	// init X% of the board to letters
	for (var i = 0; i < NUM_ROWS * NUM_COLS * START_AS_LETTER_PERCENT; ++i)
	{
		AddLetter(true);
	}

	// schedule drawing
	Draw();

	// capture mouse events
	if (regOnce == false)
	{
		// don't do this again or everything will go twice as fast
		regOnce = true;

		// schedule snake updating
		setInterval(MoveSnake, TIME_BETWEEN_SNAKE_MOVES);

		// schedule drawing
		setInterval(Draw, DRAW_RATE);

		// schedule letter adding
		setInterval(AddLetter, TIME_BETWEEN_LETTERS);

		// hook up events
		window.addEventListener('keydown', ev_keydown, false);
		window.addEventListener('mousedown', ev_mousedown, false);
	}

	// is there a timer?!
	if (gTimeLimit > 0)
	{
		setTimeout(function () { gGameOver = true; gCountDownTime = -1; clearInterval(gTimerUpdateHandle); ActuateTimer(); analytics.trackEvent("game", "over", "time", gScore); }, gTimeLimit * 1000);
		gCountDownTime = gTimeLimit;
		gTimerUpdateHandle = setInterval(function () { gCountDownTime -= 1; }, 1000);
	}

	// is it too big
	if (gGameBoard.BoardSideSize() > drawingCanvas.height)
		alert("oops canvas isn't tall enough");
	if (gGameBoard.BoardSideSize() > drawingCanvas.width)
		alert("oops canvas isn't wide enough");
}

//-----------------------------------------------------------------------------
function MoveSnake(force)
{
	// head can move "on demand" or on the timer
	var moveHead = force || !gAlreadyMovedSinceLastUpdate;

	// tail always ticks on the timer
	var moveTail = !force;

	// do the move
	gSnakeManager.MoveSnake(moveHead, moveTail);

	// clear state flags
	gAlreadyMovedSinceLastUpdate = false;

	// we need to redraw after a move (everyone is setting this everywhere!)
	gNeedsRedrawn = true;
}

//-----------------------------------------------------------------------------
// draw everything if state has changed
function Draw()
{
	// don't do anything if state hasn't changed
	if (gNeedsRedrawn == false)
		return;

	// get the drawing canvas and draw
	var drawingCanvas = document.getElementById('myDrawing');
	if (drawingCanvas.getContext)
	{
		// we need to redraw only once per state change
		gNeedsRedrawn = false;

		// get the context
		var context = drawingCanvas.getContext('2d');
		var fontSize = 25 * .6;

		if (gGameOver == false)
		{
			// draw game objects
			gGameBoard.Draw(context);

			var textX = 50;
			var textY = gGameBoard.BoardSideSize() + 50;
			
			context.clearRect(textX, textY - (fontSize * 2), drawingCanvas.width, drawingCanvas.height);
			context.font = fontSize + "pt arial";
			context.fillStyle = '#000';
			context.fillText("LETTERS: " + gLetters, textX, textY);
			context.fillText("SCORE: " + Math.round(gScore * 100) / 100, textX, textY + fontSize);
			ActuateScore();
			ActuateLetters();
			ActuateTimer();

			context.fillText("MULTIPLIER: " + Math.round(gMultiplier * 100) / 100, textX, textY + 2 * fontSize);
			context.fillText(gStatus, textX, textY + 3 * fontSize);
		}
		else
		{
			context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
			ActuateLetters("GAME OVER \n CLICK TO RETRY");
		}
	}
}

//-----------------------------------------------------------------------------
function ActuateTimer()
{
	if (gCountDownTime > 0)
		timerHolder.innerText = Math.round(gCountDownTime);
	else
		timerHolder.innerText = "";
}

//-----------------------------------------------------------------------------
function ActuateScore()
{
	scoreHolder.innerText = Math.round(gScore);
}

//-----------------------------------------------------------------------------
function ActuateLetters(forceText)
{
	if(!forceText)
		lettersHolder.innerText = gLetters;
	else
		lettersHolder.innerText = forceText;
}

//-----------------------------------------------------------------------------
function CleanScoreClasses()
{
	scoreHolder.className = scoreHolder.className.replace(" badword", "");
	scoreHolder.className = scoreHolder.className.replace(" goodword", "");
}

//-----------------------------------------------------------------------------
function ActuateInvalidWord()
{
	scoreHolder.className += " badword";
	setTimeout(CleanScoreClasses, 500);
}

//-----------------------------------------------------------------------------
function ActuateValidWord()
{
	scoreHolder.className += " goodword";
	setTimeout(CleanScoreClasses, 500);
}

//-----------------------------------------------------------------------------
function NeedToRedraw()
{
	gNeedsRedrawn = true;
}

//-----------------------------------------------------------------------------
function ev_keydown(ev)
{
	if (ev.keyCode >= DIRECTION.LEFT && ev.keyCode <= DIRECTION.DOWN)
	{
		ev.preventDefault();
		gSnakeManager.ChangeDirection(ev.keyCode);
		if (gSnakeManager.m_lastDirectionMoved != ev.keyCode)
		{
			if (gAllowForceMove && !gAlreadyMovedSinceLastUpdate)
			{
				MoveSnake(true);
				gAlreadyMovedSinceLastUpdate = true;
			}
			//gNeedsRedrawn = true;
		}
	}
	else if (ev.keyCode == 88 || ev.keyCode == 8) // x or backspace
	{
		ev.preventDefault();
		gLetters = gLetters.substring(0, gLetters.length - 1);
		gMultiplier = 1;
		gNeedsRedrawn = true;
	}
	else if (ev.keyCode == 32) // space
	{
		ev.preventDefault();
		var wordOk = checkDictionary(gLetters);
		var validWord = checkDictionary(gLetters);
		if (validWord)
		{
			var basescore = getScore(gLetters);
			var lengthMultiplier = (gLetters.length > 5) ? 2 : 1;
			var score = basescore * lengthMultiplier * gMultiplier;
			var multiplierString = Math.round(gMultiplier * 100) / 100;
			if (lengthMultiplier > 1)
				multiplierString += " * " + lengthMultiplier + " length multiplier";

			gStatus = gLetters + " scores " + (Math.round(score * 100) / 100) + "(" + basescore + " * " + multiplierString + ") !!";

			gMultiplier += .1;
			gSnakeManager.ScoredWord(gLetters, basescore, gRemoveSnakeSectionsOnSend);
			analytics.trackEvent("score", "success", gLetters, score);
			gScore += score;
			ActuateValidWord();
		}
		else
		{
			analytics.trackEvent("score", "failure", gLetters);
			gStatus = gLetters + " is not a word !!";
			ActuateInvalidWord();
		}
		
		//gScore += (validWord) ? score : -score;
		gLetters = "";
		gNeedsRedrawn = true;
	}
}

//-----------------------------------------------------------------------------
function ev_mousedown(ev)
{
	if (gGameOver)
	{
		analytics.trackEvent("game", "start", "restart");
		Init();
	}
}

//-----------------------------------------------------------------------------
var gGhostLetter;
function AddLetter(init)
{
	if (gGhostLetter)
	{
		gGhostLetter.isGhostPiece = false;
		gGhostLetter.needsRedraw = true;
		gGhostLetter = null;
	}

	var randomletter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
	var randompiece = gGameBoard.m_GamePieces[Math.floor(Math.random() * gGameBoard.m_GamePieces.length)];
	if (randompiece.m_letter != '.')
		return;
	randompiece.m_letter = randomletter;
	if (!init)
	{
		randompiece.isGhostPiece = true;
		gGhostLetter = randompiece;
	}
	randompiece.needsRedraw = true;
	
}



