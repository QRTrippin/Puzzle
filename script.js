document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("image-selector");
  const gameContainer = document.getElementById("game-container");
  const moveCounter = document.getElementById("move-counter");
  const photoMetadata = document.getElementById("photo-metadata");
  const difficultySelect = document.getElementById("difficulty");
  let gridSize = 3;
  let moves = 0;
  let emptyTileIndex;

  // Ensure the start button is removed on all browsers
  document.querySelectorAll("#start-btn").forEach(btn => btn.remove());

  // Properly position the file input next to the difficulty dropdown for all browsers
  input.style.display = "inline-block";
  input.style.marginLeft = "10px";
  const fileLabel = document.createElement("span");
  fileLabel.id = "file-label";
  fileLabel.style.marginLeft = "10px";
  difficultySelect.parentNode.insertBefore(input, difficultySelect.nextSibling);
  input.insertAdjacentElement("afterend", fileLabel);

  input.addEventListener("change", function () {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        createGrid(reader.result);
        photoMetadata.textContent = "Photo loaded successfully: " + file.name;
        fileLabel.textContent = file.name;
      };
      reader.onerror = function () {
        alert("Error reading file.");
      };
      reader.readAsDataURL(file);
    }
  });

  difficultySelect.addEventListener("change", () => {
    gridSize = parseInt(difficultySelect.value, 10);
    if (gameContainer.innerHTML !== "") {
      alert("Difficulty changed. Please reload an image to apply changes.");
    }
  });

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
      } else {
        tile.classList.add("empty");
        emptyTileIndex = index;
      }

      tile.addEventListener("click", () => moveTile(index, tiles));
      gameContainer.appendChild(tile);
    });
  }

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

      emptyTile.classList.remove("empty");
      selectedTile.classList.add("empty");

      [tiles[index], tiles[emptyTileIndex]] = [tiles[emptyTileIndex], tiles[index]];

      emptyTile.style.backgroundImage = selectedTile.style.backgroundImage;
      emptyTile.style.backgroundPosition = selectedTile.style.backgroundPosition;
      emptyTile.style.backgroundSize = selectedTile.style.backgroundSize;

      selectedTile.style.backgroundImage = "";
      selectedTile.style.backgroundPosition = "";
      selectedTile.style.backgroundSize = "";

      emptyTileIndex = index;
      moves++;
      moveCounter.textContent = `Moves: ${moves}`;

      if (isSolved(tiles)) {
        setTimeout(() => {
          alert(`Puzzle solved in ${moves} moves!`);
        }, 300);
      }
    }
  }

  function isAdjacent(index1, index2) {
    const row1 = Math.floor(index1 / gridSize);
    const col1 = index1 % gridSize;
    const row2 = Math.floor(index2 / gridSize);
    const col2 = index2 % gridSize;

    return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
  }

  function isSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return true;
  }
});
