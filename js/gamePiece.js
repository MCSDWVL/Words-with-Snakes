//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
function GridPiece(pieceActiveWidth, spacing, lineWidth)
{
	this.lineLength = pieceActiveWidth;
	this.lineWidth = lineWidth;
	this.fontSize = this.lineLength * .6;
	this.needsRedraw = true;
	this.spacing = spacing;

	//
	this.m_Row = -1;
	this.m_Col = -1;
	this.m_isSnakePiece = false;
	this.m_letter = '.';
	this.isGhostPiece = false;
	
	// define some of the positions around the hex that we'll need later
	var x0, x1;
	var y0, y1;

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.EstablishPoints = function ()
	{
		// all the vertices
		var upperLeftOfTotalSpaceX = this.GetX();
		var upperLeftOfTotalSpaceY = this.GetY();

		x0 = upperLeftOfTotalSpaceX + this.spacing/2;
		x1 = x0 + this.lineLength;
		y0 = upperLeftOfTotalSpaceY + this.spacing/2;
		y1 = y0 + this.lineLength;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetHeight = function () { return this.lineLength + this.spacing + this.lineWidth; }
	this.GetWidth = function () { return this.lineLength + this.spacing + this.lineWidth; }

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
	this.Draw = function (context, colorIt)
	{
		// Set the style properties
		if (this.m_isSnakePiece)
			context.fillStyle = '#F11';
		else if (this.m_letter != "." && this.isGhostPiece)
			context.fillStyle = '#aaa';
		else if (this.m_letter != '.')
			context.fillStyle = '#FF0';
		else
			context.fillStyle = '#fff';

		context.clearRect(this.GetX(), this.GetY(), this.GetWidth(), this.GetHeight());
		context.strokeStyle = '#aaa';
		context.lineWidth = this.lineWidth;

		context.beginPath();

		// Start from the top-left point.
		context.moveTo(x0, y0);
		context.lineTo(x1, y0); // lower
		context.lineTo(x1, y1); // right
		context.lineTo(x0, y1); // upper
		context.lineTo(x0, y0);// - this.lineWidth / 2); // left

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

			var scoreX = textX + this.fontSize / 1.2;
			var scoreY = textY + this.lineLength / 6;
			context.font = (this.fontSize / 2.0) + "pt arial";
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