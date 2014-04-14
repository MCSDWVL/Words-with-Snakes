//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function GridPiece(boardSize)
{
	if (isNaN(boardSize))
	{
		if (!isNaN(NUM_ROWS))
			boardSize = NUM_ROWS;
		else
			boardSize = 25;
	}

	this.lineLength = 25 * (25 / boardSize);
	this.lineWidth = this.lineLength / 50.0;
	this.fontSize = this.lineLength * .6;
	this.needsRedraw = true;

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
		x1 = x0 + this.lineLength;
		y0 = this.GetY();
		y1 = y0 + this.lineLength;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetHeight = function () { return this.lineLength; }
	this.GetWidth = function () { return this.lineLength; }

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
		context.lineWidth = this.lineWidth;

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
			var textX = x0 + this.lineLength / 5;
			var textY = y0 + .8 * this.lineLength;
			context.font = this.fontSize + "pt arial";
			context.fillStyle = '#000';
			context.fillText(this.m_letter, textX, textY);

			var scoreX = textX + this.fontSize;
			var scoreY = textY + this.lineLength;
			context.font = (this.lineLength.fontSize / 2.5) + "pt arial";
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