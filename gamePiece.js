var LINE_LENGTH = 25;
var LINE_WIDTH = LINE_LENGTH/50.0;
var FONT_SIZE_PT = LINE_LENGTH * .6;
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function GridPiece()
{
	//
	this.m_Row = -1;
	this.m_Col = -1;
	this.m_isSnakePiece = false;
	this.m_letter = '.';
	
	// define some of the positions around the hex that we'll need later
	var x0, x1;
	var y0, y1;

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.EstablishPoints = function() 
	{
		// all the vertices of the hex
		x0 = this.GetX();
		x1 = x0 + LINE_LENGTH;
		y0 = this.GetY();
		y1 = y0 + LINE_LENGTH;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetHeight = function() { return LINE_LENGTH; }
	this.GetWidth = function() { return LINE_LENGTH; }

	//-----------------------------------------------------------------------------
	// GetX - the left of the guy
	//-----------------------------------------------------------------------------
	this.GetX = function()
	{
		var leftMost = 10;

		// special case for the active piece
		return leftMost + this.GetColumn() * (this.GetWidth());
	}

	//-----------------------------------------------------------------------------
	// GetY - top of the tile
	//-----------------------------------------------------------------------------
	this.GetY = function() 
	{
		var topMost = 10;
		return topMost + this.GetRow() * this.GetHeight();
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetColumn = function()
	{
		return this.m_Col;
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetRow = function()
	{
		return this.m_Row;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.Draw = function(context, colorIt)
	{
		// Set the style properties
		if (this.m_isSnakePiece)
		{
			context.fillStyle = '#111';
		}
		else if (this.m_letter != '.')
		{
			context.fillStyle = '#FF0';
		}
		else
			context.fillStyle = '#fff';

		context.strokeStyle = '#000';
		context.lineWidth = LINE_WIDTH;

		context.beginPath();

		// Start from the top-left point.

		context.moveTo(x0, y0);
		context.lineTo(x1, y0); // lower
		context.lineTo(x1, y1); // right
		context.lineTo(x0, y1); // upper
		context.lineTo(x0, y0); // left

		// Done! Now fill the shape, and draw the stroke.
		// Note: your shape will not be visible until you call any of the two methods.
		context.fill();
		context.stroke();
		context.closePath();

		if (this.m_letter != '.')
		{
			var textX = x0 + LINE_LENGTH / 5;
			var textY = y0 + .8 * LINE_LENGTH;
			context.font = FONT_SIZE_PT + "pt arial";
			context.fillStyle = '#000';
			context.fillText(this.m_letter, textX, textY);

			var scoreX = textX + FONT_SIZE_PT;
			var scoreY = textY + LINE_WIDTH;
			context.font = (FONT_SIZE_PT/2.5) + "pt arial";
			context.fillStyle = '#000';
			context.fillText(tileScore[this.m_letter], scoreX, scoreY);
		}
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.toString = function() 
	{
		return "GP (" + this.GetRow() + ", " + this.GetColumn() + ") IsSnake(" + this.m_isSnakePiece + ")";
	}
}