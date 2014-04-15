var gNeedsRedrawn = true;
var INTERVAL_TIME = 20;
var TIME_BETWEEN_SNAKE_MOVES = 100;
var START_AS_LETTER_PERCENT = 0.01;
var TIME_BETWEEN_LETTERS = 4000;
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

var scoreHolder = document.querySelector(".score");

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
//-----------------------------------------------------------------------------
function Init()
{
	// get url vals
	var urlVars = getUrlVars();

	if (urlVars["word"])
	{
		var wordOk = checkDictionary(urlVars["word"]);
		alert(urlVars["word"] + " " + wordOk + " " + getScore(urlVars["word"]));
	}

	if (urlVars["forcemove"])
	{
		gAllowForceMove = true;
	}

	if (urlVars["size"])
	{
		NUM_ROWS = NUM_COLS = parseInt(urlVars["size"]);
	}

	if (urlVars["speed"])
	{
		var asInt = parseInt(urlVars["speed"]);
		if (!isNaN(asInt))
			TIME_BETWEEN_SNAKE_MOVES = 1000 / asInt;
	}

	if (urlVars["pct"])
	{
		var asInt = parseInt(urlVars["pct"]);
		if (!isNaN(asInt))
			START_AS_LETTER_PERCENT = asInt / 100.0;
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

	// init 5% of the board to letters
	for (var i = 0; i < NUM_ROWS * NUM_COLS * START_AS_LETTER_PERCENT; ++i)
	{
		AddLetter();
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
		setInterval(Draw, INTERVAL_TIME);

		// schedule letter adding
		setInterval(AddLetter, TIME_BETWEEN_LETTERS);

		// hook up events
		window.addEventListener('keydown', ev_keydown, false);
		drawingCanvas.addEventListener('mousedown', ev_mousedown, false);
	}

	// is it too big
	if (gGameBoard.BoardSideSize() > drawingCanvas.height)
		alert("oops canvas isn't tall enough");
	if (gGameBoard.BoardSideSize() > drawingCanvas.width)
		alert("oops canvas isn't wide enough");
}

//-----------------------------------------------------------------------------
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
//-----------------------------------------------------------------------------
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
			context.fillText("MULTIPLIER: " + Math.round(gMultiplier * 100) / 100, textX, textY + 2 * fontSize);
			context.fillText(gStatus, textX, textY + 3 * fontSize);
		}
		else
		{
			context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
			var textX = 50;
			var textY = 50;
			context.font = fontSize + "pt arial";
			context.fillStyle = '#000';

			context.fillText("GAME OVER", textX, textY);
			context.fillText("SCORE: " + Math.round(gScore * 100) / 100, textX, textY + fontSize);
			context.fillText("CLICK TO START OVER", textX, textY + 2 * fontSize);
		}
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ActuateScore()
{
	scoreHolder.innerText = Math.round(gScore);
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function NeedToRedraw()
{
	gNeedsRedrawn = true;
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ev_keydown(ev)
{
	//console.log(ev.keyCode);
	if (gGameOver)
	{
		Init();
		return;
	}
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
			gSnakeManager.ScoredWord(gLetters, basescore);
			gScore += score;

		}
		else
		{
			gStatus = gLetters + " is not a word !!";
			gMultiplier = 1;
		}
		//gScore += (validWord) ? score : -score;
		gLetters = "";
		gNeedsRedrawn = true;
	}
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function ev_mousedown(ev)
{
	if (gGameOver)
		Init();
}

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function AddLetter()
{
	var randomletter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
	var randompiece = gGameBoard.m_GamePieces[Math.floor(Math.random() * gGameBoard.m_GamePieces.length)];
	if (randompiece.m_isSnakePiece || randompiece.m_letter != '.')
		return;
	randompiece.m_letter = randomletter;
	randompiece.needsRedraw = true;
}



