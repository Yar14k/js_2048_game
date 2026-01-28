'use strict';

const tbody = document.querySelector('.game-field');

class Game {
  constructor(initalState = null) {
    this.size = 4;
    this.score = 0;
    this.status = 'idle';
    this.field = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  }

  getState() {
    return this.field;
  }

  getScore() {
    return this.score;
  }
  getStatus() {
    return this.status;
  }
  moveLeft() {
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      const row = this.field[rowIndex];
      const newRow = this.mergeLeft(row);

      this.field[rowIndex] = newRow;
    }
  }
  mergeLeft(row) {
    let newCells = row.filter((cell) => cell !== 0);

    for (let i = 0; i < newCells.length - 1; i++) {
      if (newCells[i] === newCells[i + 1]) {
        newCells[i] = newCells[i] * 2;
        newCells[i + 1] = 0;
        this.score += newCells[i];
        i++;
      }
    }

    newCells = newCells.filter((cell) => cell !== 0);

    while (newCells.length < 4) {
      newCells.push(0);
    }

    return newCells;
  }

  moveRight() {
    for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
      const row = [...this.field[rowIndex]];

      row.reverse();

      const newRow = this.mergeLeft(row);

      newRow.reverse();
      this.field[rowIndex] = newRow;
    }
  }

  moveUp() {
    for (let col = 0; col < 4; col++) {
      const column = [];

      for (let row = 0; row < 4; row++) {
        column.push(this.field[row][col]);
      }

      const newColumn = this.mergeLeft(column);

      for (let row = 0; row < 4; row++) {
        this.field[row][col] = newColumn[row];
      }
    }
  }

  moveDown() {
    for (let col = 0; col < 4; col++) {
      const column = [];

      for (let row = 0; row < 4; row++) {
        column.push(this.field[row][col]);
      }

      column.reverse();

      const newColumn = this.mergeLeft(column);

      newColumn.reverse();

      for (let row = 0; row < 4; row++) {
        this.field[row][col] = newColumn[row];
      }
    }
  }

  start() {
    if (this.status === 'idle') {
      this.status = 'playing';
      this.field = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
      this.score = 0;
      this.addRandomTile();
      this.addRandomTile();
    }
  }

  restart() {
    this.status = 'playing';
    this.field = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    this.score = 0;
    this.addRandomTile();
  }

  addRandomTile() {
    const emptyCells = [];

    for (let row = 0; row < this.field.length; row++) {
      for (let col = 0; col < this.field[row].length; col++) {
        if (this.field[row][col] === 0) {
          emptyCells.push([row, col]);
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const [randRow, randCol] = emptyCells[randomIndex];

    this.field[randRow][randCol] = Math.random() < 0.9 ? 2 : 4;
  }

  handleMove(direction) {
    const oldField = this.field.map((row) => [...row]);

    switch (direction) {
      case 'left':
        this.moveLeft();
        break;
      case 'right':
        this.moveRight();
        break;
      case 'up':
        this.moveUp();
        break;
      case 'down':
        this.moveDown();
        break;
    }

    let moved = false;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.field[row][col] !== oldField[row][col]) {
          moved = true;
          break;
        }
      }

      if (moved) {
        break;
      }
    }

    if (moved) {
      this.addRandomTile();
    }

    this.checkWin();

    return moved;
  }

  checkWin() {
    let noMoves = true;

    for (let row = 0; row < this.field.length; row++) {
      for (let col = 0; col < this.field[row].length; col++) {
        const current = this.field[row][col];

        if (current === 2048) {
          this.status = 'won';

          return;
        }

        if (this.field[row][col] === 0) {
          return;
        }

        if (
          col < this.field[row].length - 1 &&
          current === this.field[row][col + 1]
        ) {
          noMoves = false;
          break;
        }

        if (
          row < this.field.length - 1 &&
          current === this.field[row + 1][col]
        ) {
          noMoves = false;
          break;
        }
      }

      if (!noMoves) {
        break;
      }
    }

    if (noMoves) {
      this.status = 'lost';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  const start = document.querySelector('.start');

  start.addEventListener('click', () => {
    if (game.getStatus() === 'idle') {
      game.start();
    } else {
      game.restart();
    }

    renderBoard(game.getState());
    renderScore(game.getScore());
    renderStatus(game.getStatus());
  });

  document.addEventListener('keydown', (b) => {
    if (game.getStatus() !== 'playing') {
      return;
    }

    let moved = false;

    switch (b.key) {
      case 'ArrowLeft':
        moved = game.handleMove('left');
        break;
      case 'ArrowRight':
        moved = game.handleMove('right');
        break;
      case 'ArrowUp':
        moved = game.handleMove('up');
        break;
      case 'ArrowDown':
        moved = game.handleMove('down');
        break;
    }

    if (!moved) {
      return;
    }

    const gameStatus = game.getStatus();
    const state = game.getState();
    const score = game.getScore();

    renderBoard(state);
    renderScore(score);
    renderStatus(gameStatus);
  });
});

function renderScore(score) {
  const s = document.querySelector('.score');

  s.textContent = score;
}

function renderBoard(state) {
  const rows = Array.from(tbody.querySelectorAll('.field-row'));

  state.forEach((row, rowIndex) => {
    row.forEach((cellValue, colIndex) => {
      const cell = rows[rowIndex].cells[colIndex];

      cell.textContent = '';

      cell.classList.forEach((cls) => {
        if (cls.startsWith('field-cell--')) {
          cell.classList.remove(cls);
        }
      });

      if (cellValue !== 0) {
        cell.textContent = cellValue;
        cell.classList.add(`field-cell--${cellValue}`);
      }
    });
  });
}

function renderStatus(gameStatus) {
  const messageWin = document.querySelector('.message-win');
  const messageLose = document.querySelector('.message-lose');
  const messageStart = document.querySelector('.message-start');

  switch (gameStatus) {
    case 'idle':
      messageStart.classList.remove('hidden');
      break;

    case 'lost':
      messageLose.classList.remove('hidden');
      break;

    case 'won':
      messageWin.classList.remove('hidden');
      break;
  }
}
