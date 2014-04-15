//-----------------------------------------------------------------------------
// 
//-----------------------------------------------------------------------------
function GameBoard()
{
	this.m_GamePieces = new Array();
	this.activePieceSize = Math.round(BOARD_SIZE / NUM_ROWS - SPACING - LINE_WIDTH);
	
	//-----------------------------------------------------------------------------
	// Draw - just pass on to all the game pieces?
	//-----------------------------------------------------------------------------
	this.Draw = function (context)
	{
		var drawn = 0;
		for (var i = 0; i < this.m_GamePieces.length; ++i)
		{
			if (this.m_GamePieces[i].needsRedraw)
			{
				++drawn;
				this.m_GamePieces[i].needsRedraw = false;
				var color = false;
				this.m_GamePieces[i].Draw(context, color);
			}
		}

		//console.log("drew " + drawn);
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GamePieceIndexPieceAtRowCol = function (row, col)
	{
		// wrap down to valid row and col
		if (row < 0) row = NUM_ROWS + row;
		if (col < 0) col = NUM_COLS + col;
		row = row % NUM_ROWS;
		col = col % NUM_COLS;

		// find the one that matches
		return row * NUM_COLS + col;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.BoardSideSize = function ()
	{
		return NUM_ROWS * (this.PieceTotalSize());
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.PieceTotalSize = function()
	{
		return this.activePieceSize + SPACING + LINE_WIDTH;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.InitEmptyGrid = function()
	{
		var ctr = 0;
		for (var row = 0; row < NUM_ROWS; ++row)
		{
			for (var col = 0; col < NUM_COLS; ++col)
			{
				var gp = new GridPiece(this.activePieceSize, SPACING, LINE_WIDTH);
				gp.m_Row = row;
				gp.m_Col = col;
				gp.EstablishPoints();
				this.m_GamePieces[ctr++] = gp;
			}
		}
		gNeedsRedrawn = true;
	}
}
