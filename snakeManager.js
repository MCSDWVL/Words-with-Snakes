//-----------------------------------------------------------------------------
// 
//-----------------------------------------------------------------------------
function SnakeManager()
{
	this.m_maxLength = 5;
	this.m_currentLength = 1;
	this.m_snakePieces = new Array();

	this.m_direction = DIRECTION.RIGHT;
	this.m_lastDirectionMoved = this.m_direction;
	this.m_lastIntendedDirection = this.m_direction;
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.MoveSnake = function()
	{
		var headIndex = this.m_snakePieces[0];
		var tailIndex = this.m_snakePieces[this.m_snakePieces.length - 1];

		var newHeadIdx = this.GetIndexOfNextInDirection();

		// game over if you collide with yourself
		if (gGameBoard.m_GamePieces[newHeadIdx].m_isSnakePiece)
		{
			gGameOver = true;
		}

		// add letter to our list if we eat it!
		if (gGameBoard.m_GamePieces[newHeadIdx].m_letter != '.')
		{
			gLetters += gGameBoard.m_GamePieces[newHeadIdx].m_letter;
			this.m_maxLength += tileScore[gGameBoard.m_GamePieces[newHeadIdx].m_letter];
			gGameBoard.m_GamePieces[newHeadIdx].m_letter = '.';
		}

		gGameBoard.m_GamePieces[newHeadIdx].m_isSnakePiece = true;
		this.m_snakePieces.unshift(newHeadIdx);

		while (this.m_snakePieces.length > this.m_maxLength)
		{
			gGameBoard.m_GamePieces[tailIndex].m_isSnakePiece = false;
			this.m_snakePieces.pop();
			tailIndex = this.m_snakePieces[this.m_snakePieces.length - 1];
		}

		this.m_lastDirectionMoved = this.m_direction;
		if (this.m_lastIntendedDirection != this.m_lastDirectionMoved)
			this.ChangeDirection(this.m_lastIntendedDirection);

		// need to redraw
		gNeedsRedrawn = true;
	}

	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.ScoredWord = function(letters, score)
	{
		var diff = score - letters.length;
		console.log(letters + " " + score + " " + diff);
		if (diff > 0)
		{
			this.m_maxLength -= 2 * diff;
			console.log("Getting rid of " + 2 * diff + " pieces " + this.m_maxLength);
			if (this.m_maxLength < 1)
				this.m_maxLength = 1;
		}
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.GetIndexOfNextInDirection = function()
	{
		var headIndex = this.m_snakePieces[0];
		var curRow = gGameBoard.m_GamePieces[headIndex].GetRow();
		var curCol = gGameBoard.m_GamePieces[headIndex].GetColumn();
		switch (this.m_direction)
		{
			case DIRECTION.UP:
				curRow -= 1;
				break;
			case DIRECTION.DOWN:
				curRow += 1;
				break;
			case DIRECTION.LEFT:
				curCol -= 1;
				break;
			case DIRECTION.RIGHT:
				curCol += 1;
				break;
		}

		return gGameBoard.GamePieceIndexPieceAtRowCol(curRow, curCol);
	}
	
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	this.ChangeDirection = function(dir)
	{
		this.m_lastIntendedDirection = dir;
		// only allow orthogonal direction change
		if (dir == this.m_lastDirectionMoved || dir % 2 == this.m_lastDirectionMoved % 2)
			return;
		this.m_direction = dir;
	}	
}
