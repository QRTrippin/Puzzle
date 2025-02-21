document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const gameContainer = document.getElementById("game-container");
  const moveCounter = document.getElementById("move-counter");
  const photoMetadata = document.getElementById("photo-metadata");
  const currentYear = document.getElementById("current-year");
  currentYear.textContent = new Date().getFullYear();

  let gridSize = 3;
  let moves = 0;
  let emptyTileIndex;

  // Create the puzzle grid
  function createGrid(imageURL) {
    gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameContainer.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    gameContainer.innerHTML = "";

    const totalTiles = gridSize * gridSize;
    const tiles = Array.from({ length: totalTiles }, (_, i) => (i === totalTiles - 1 ? null : i));
    shuffle(tiles);

    tiles.forEach((tileIndex, index) => {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.index = index;

      if (tileIndex !== null) {
        tile.style.backgroundImage = `url(${imageURL})`;
        tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
        const row = Math.floor(tileIndex / gridSize);
        const col = tileIndex % gridSize;
        tile.style.backgroundPosition = `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`;
        tile.textContent = ""; // Remove text numbers if showing the image
      } else {
        tile.classList.add("empty");
        emptyTileIndex = index;
      }

      tile.addEventListener("click", () => moveTile(index, tiles));
      gameContainer.appendChild(tile);
    });
  }

  // Shuffle tiles (Fisher-Yates Shuffle)
  function shuffle(array) {
    for (let i = array.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

 function moveTile(index, tiles) {
  if (isAdjacent(index, emptyTileIndex)) {
    const tilesArray = Array.from(gameContainer.children);
    const emptyTile = tilesArray[emptyTileIndex];
    const selectedTile = tilesArray[index];

    // Swap the empty and selected tiles in the DOM
    emptyTile.classList.remove("empty");
    selectedTile.classList.add("empty");

    // Swap the positions in the array
    [tiles[index], tiles[emptyTileIndex]] = [tiles[emptyTileIndex], tiles[index]];

    // Update the DOM for the empty tile
    emptyTile.style.backgroundImage = selectedTile.style.backgroundImage;
    emptyTile.style.backgroundPosition = selectedTile.style.backgroundPosition;
    emptyTile.style.backgroundSize = selectedTile.style.backgroundSize;

    // Clear the selected tile (which is now the empty tile)
    selectedTile.style.backgroundImage = "";
    selectedTile.style.backgroundPosition = "";
    selectedTile.style.backgroundSize = "";

    // Update the empty tile index
    emptyTileIndex = index;

    // Increment move counter
    moves++;
    moveCounter.textContent = `Moves: ${moves}`;

    // Check if the puzzle is solved
    if (isSolved(tiles)) {
      // Slight delay before declaring victory for smoother user experience
      setTimeout(() => {
        alert(`Puzzle solved in ${moves} moves!`);
        saveBestScore(moves, gridSize);
      }, 300); // Delay victory message by 300ms
    }
  }
}



  // Check if two tiles are adjacent
  function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;

    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  }

  // Check if the puzzle is solved
  function isSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return true;
  }

  // Save the best score
  function saveBestScore(score, difficulty) {
    const bestScoreKey = `bestScore_${difficulty}`;
    const bestScore = localStorage.getItem(bestScoreKey);
    if (!bestScore || score < bestScore) {
      localStorage.setItem(bestScoreKey, score);
      alert(`New best score for difficulty ${difficulty}: ${score} moves!`);
    }
  }

  // Handle image selection
  // Handle image input (ensures only one file input is created)
function selectImage(callback) {
  let input = document.getElementById("image-selector");

  if (!input) {
    input = document.createElement("input");
    input.id = "image-selector";
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem("puzzleImage", reader.result);
          callback(reader.result);
        };
        reader.readAsDataURL(file);
      }
    });

    document.body.appendChild(input);
  }
  input.click();
}
document.addEventListener("DOMContentLoaded", () => {
  const savedImage = localStorage.getItem("puzzleImage");
  if (savedImage) {
    createGrid(savedImage);
    document.getElementById("photo-metadata").textContent = "Restored last photo.";
  }
});
  
    // Start the game
  startBtn.addEventListener("click", () => {
    moves = 0;
    moveCounter.textContent = "Moves: 0";

    const difficulty = document.getElementById("difficulty").value;
    gridSize = parseInt(difficulty, 10);

    selectImage((imageURL) => {
      createGrid(imageURL);
      photoMetadata.textContent = "Photo loaded successfully.";
    });
  });
});
