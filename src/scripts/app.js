import { RandomPieceGenerator } from "./figures";
import { DeepCopy, eachMatrix, formatNumber } from "./lib";
import { AI } from "./ai";

export const App = {};
App.fieldX = 10; // размер поля по горизонтали
App.fieldY = 22; // размер поля по вертикали
App.speedStart = 1000; // начальное время (скорость)
App.speedStep = 1; // процент уменьшения времени
App.speedCurrent = null; // текущее время (скорость)
App.currentFigure = null; // падующая фигура
App.nextFigure = null; // следующая фигура
App.bagFigures = [];
App.timeout = null;
App.field = null;
App.score = null; // счет (кол-во линий)
App.startTime = null; // время запуска игры
App.isPause = true;
App.turnOnAI = false;

const fillField = function () {
  const field = [];

  for (let y = 0; y < App.fieldY; y++) {
    field[y] = emptyRow();
  }

  return field;
};

export function emptyRow() {
  const row = [];
  for (let i = 0; i < App.fieldX; i++) {
    row.push([
      0, // заполнен ли блок
      0, // цвет блока
      0, // перемещаемая ли фигура
      0, // мигать ли
      0, // маркер следующией фигуры
    ]);
  }
  return row;
}

function GamePause() {
  clearTimeout(App.timeout);
  App.isPause = true;
}

function GameResume() {
  App.isPause = false;
  GameTimeout();
}

export function isPause() {
  return App.isPause === true;
}

function Start() {
  // сбрасываем значения
  App.turnOnAI = true;
  App.isPause = false;
  App.startTime = new Date();
  App.speedCurrent = App.speedStart;
  App.score = 0;
  App.field = fillField();
  App.currentFigure = null;
  App.bagFigures = [];
  App.nextFigure = GetNextFigure();

  NewCircle();
}

function GetNextFigure() {
  if (App.bagFigures.length === 0) {
    App.bagFigures = RandomPieceGenerator();
  }
  return App.bagFigures.pop();
}

function NewCircle() {
  clearTimeout(App.timeout);
  App.currentFigure = null;
  App.field = DeleteActiveMarker(App.field);

  const fn = function () {
    const nextFigure = App.nextFigure;
    const newField = PutOnField(App.field, nextFigure);

    if (newField === false) {
      GameOver();
      return false;
    }

    App.field = newField;
    App.currentFigure = nextFigure;
    App.nextFigure = GetNextFigure();
    UpdateNextFigureMarker();
    Draw();
    GameTimeout();

    if (App.turnOnAI) AI();
  };

  if (ClearLines()) {
    App.timeout = setTimeout(fn, App.turnOnAI ? 50 : 900); // кратно 300
  } else {
    fn();
  }
}

function GameTimeout() {
  const fn = function () {
    if (MoveDown() === true) {
      GameTimeout();
    } else {
      NewCircle();
    }
  };
  clearTimeout(App.timeout);
  App.timeout = setTimeout(fn, App.turnOnAI ? 100 : App.speedCurrent);
}

export function PutOnField(inField, figure) {
  let isOk = true;
  const field = DeepCopy(inField);

  eachMatrix(figure.states[figure.currentState], function (row, y, cell, x) {
    if (cell !== 1) return;

    const pos_y = y + figure.gridY;
    const pos_x = x + figure.gridX;

    if (
      typeof field[pos_y] === "undefined" ||
      typeof field[pos_y][pos_x] === "undefined"
    ) {
      // фигура вышла за рамки поля
      isOk = false;
      return false;
    }

    if (field[pos_y][pos_x][0] === 0) {
      field[pos_y][pos_x][0] = 1;
      field[pos_y][pos_x][1] = figure.color;
      field[pos_y][pos_x][2] = 1;
      field[pos_y][pos_x][3] = 0;
    } else {
      // ячейка уже занята
      isOk = false;
      return false;
    }
  });

  return isOk ? field : false;
}

function DeleteActiveMarker(inField) {
  const field = DeepCopy(inField);

  eachMatrix(field, function (row, y, cell) {
    cell[2] = 0; // освободить ячейку
  });

  return field;
}

function UpdateNextFigureMarker() {
  const field = App.field;
  const figure = App.nextFigure;

  // удаляем предыдущий маркер
  eachMatrix(field, function (row, y, cell) {
    cell[4] = 0;
  });

  // ставим новый
  eachMatrix(figure.states[figure.currentState], function (row, y, cell, x) {
    if (cell !== 1) return;

    const pos_y = y + figure.gridY;
    const pos_x = x + figure.gridX;

    if (
      typeof field[pos_y] === "undefined" ||
      typeof field[pos_y][pos_x] === "undefined"
    ) {
      return;
    }

    field[pos_y][pos_x][4] = 1;
  });
}

export function DeleteFromField(inField, inFigure) {
  const field = DeepCopy(inField);

  if (inFigure !== null) {
    eachMatrix(
      inFigure.states[inFigure.currentState],
      function (row, y, cell, x) {
        if (cell !== 1) return;

        const pos_y = y + inFigure.gridY;
        const pos_x = x + inFigure.gridX;

        if (
          typeof field[pos_y] !== "undefined" &&
          typeof field[pos_y][pos_x] !== "undefined"
        ) {
          field[pos_y][pos_x][0] = 0;
          field[pos_y][pos_x][1] = 0;
          field[pos_y][pos_x][2] = 0;
          field[pos_y][pos_x][3] = 0;
        }
      }
    );
  }

  return field;
}

function isCanMove(inField, inFigure) {
  if (isPause() || inFigure === null) return false;
  const newField = PutOnField(inField, inFigure);
  return !newField
    ? false
    : {
        field: newField,
        figure: DeepCopy(inFigure),
      };
}

function Move(moved) {
  if (moved === false) return false;

  App.field = moved.field;
  App.currentFigure = moved.figure;
  Draw();

  return true;
}

export function MoveDown() {
  if (App.currentFigure === null) return;
  const figure = DeepCopy(App.currentFigure);
  const field = DeleteFromField(App.field, figure);
  figure.gridY++;
  return Move(isCanMove(field, figure));
}

export function MoveLeft() {
  if (App.currentFigure === null) return;
  const figure = DeepCopy(App.currentFigure);
  const field = DeleteFromField(App.field, figure);
  figure.gridX--;
  return Move(isCanMove(field, figure));
}

export function MoveRight() {
  if (App.currentFigure === null) return;
  const figure = DeepCopy(App.currentFigure);
  const field = DeleteFromField(App.field, figure);
  figure.gridX++;
  return Move(isCanMove(field, figure));
}

export function Rotate() {
  if (App.currentFigure === null) return;
  const figure = DeepCopy(App.currentFigure);
  const field = DeleteFromField(App.field, figure);
  if (++figure.currentState > figure.states.length - 1) figure.currentState = 0;
  return Move(isCanMove(field, figure));
}

export function FastDown() {
  clearTimeout(App.timeout);

  if (MoveDown() === true) {
    App.timeout = setTimeout(FastDown, 7); // speed
  } else {
    GameTimeout();
  }
}

function ClearLines() {
  const toRemove = [];

  App.field.forEach(function (row, index) {
    let fullLine = true;

    row.forEach(function (cell) {
      if (cell[0] !== 1) fullLine = false;
    });

    if (fullLine) toRemove.push(index);
  });

  if (toRemove.length > 0) {
    // Добавляем параметр, чтобы мигали фигуры
    toRemove.forEach(function (index) {
      App.field[index].forEach(function (cell) {
        cell[3] = 1;
      });
    });

    // Отрисовываем
    Draw();

    toRemove.forEach(function (index) {
      // Удаляем линию
      App.field.splice(index, 1);

      // Заполняем сверху
      App.field.unshift(emptyRow());

      // Увеличиваем скорость
      App.speedCurrent -= (App.speedCurrent * App.speedStep) / 100;
      if (App.speedCurrent < 100) {
        App.speedCurrent = 300;
      }

      // Добавляем очков
      // бонус за кол-во линий
      App.score += App.fieldX * toRemove.length;
    });

    return true;
  }

  return false;
}

function TimeDiff() {
  const diff = Math.round((new Date() - App.startTime) / 1000); // seconds
  const hour = Math.floor(diff / 3600);
  const minutes = Math.floor((diff - hour * 3600) / 60);
  const seconds = Math.floor(diff - minutes * 60);
  let message;

  if (hour > 0) {
    message =
      AddTimeZero(hour) +
      ":" +
      AddTimeZero(minutes) +
      ":" +
      AddTimeZero(seconds);
  } else if (minutes > 0) {
    message = AddTimeZero(minutes) + ":" + AddTimeZero(seconds);
  } else {
    message = seconds + " sec.";
  }

  return message;
}

function AddTimeZero(num) {
  return num > 9 ? num : "0" + num;
}

function GameOver() {
  let message = '<div class="popup">';
  message += '<div class="title">Good game!</div>';
  message +=
    '<table><tr><td>Your score</td><td class="score">' +
    formatNumber(App.score) +
    "</td></tr>";
  message += "<tr><td>Time</td><td>" + TimeDiff() + "</td></tr></table>";
  message +=
    '<div class="button-box"><div class="button">Start new game</div></div>';
  message += "</div>";
  const popup = document.getElementById("popup");
  popup.innerHTML = message;
  GamePause(); // disable control

  let listener;
  listener = function (event) {
    event.stopPropagation();
    GameResume();
    Start();
    popup.removeEventListener("click", listener, false);
    popup.innerHTML = "";
  };
  popup.addEventListener("click", listener, false);
}

export function GamePausePopup() {
  GamePause();
  let message = '<div class="popup">';
  message += '<div class="title">Paused</div>';
  message +=
    '<div class="button-box"><div class="button">Resume game</div></div>';
  message += "</div>";
  const popup = document.getElementById("popup");
  popup.innerHTML = message;
  GamePause(); // disable control

  let listener;
  listener = function (event) {
    event.stopPropagation();
    GameResume();
    popup.removeEventListener("click", listener, false);
    popup.innerHTML = "";
  };
  popup.addEventListener("click", listener, false);
}

const gameWindow = document.getElementById("window");
const gameStatus = document.getElementById("status");
const colors = [
  "red", // 0
  "orange", // 1
  "yellow", // 2
  "green", // 3
  "cyan", // 4
  "blue", // 5
  "violet", // 6
];

function Draw() {
  if (App.field === null) return;

  // style.css
  const margin = 30;
  const padding = 5;
  const border = 2;

  const aspectRatio = App.fieldY / App.fieldX;
  const maxWidth = window.innerWidth - margin * 2;
  const maxHeight = window.innerHeight - margin * 2;
  let width = maxHeight / aspectRatio;
  if (width > maxWidth) width = maxWidth;

  const cellSize = Math.round((width - (padding + border) * 2) / App.fieldX);
  const cellBorderSize = Math.round(cellSize * 0.04);
  width = cellSize * App.fieldX + (padding + border) * 2;

  let html = '<div class="field-box" style="width:' + width + 'px;">';
  App.field.forEach(function (row) {
    html += '<div class="row">';
    row.forEach(function (cell) {
      html +=
        '<div style="border-width:' +
        cellBorderSize +
        "px;width:" +
        cellSize +
        "px;height:" +
        cellSize +
        'px;" class="brick ';
      html += cell[0] === 1 ? colors[cell[1]] : "empty"; // цветная клетка или пустая
      if (cell[2] === 1) html += " active"; // перемещаемая фигура
      if (cell[3] === 1) html += " blink"; // мигать ли
      if (cell[4] === 1) html += " next"; // маркер следующей фигуры
      html += '"></div>';
    });
    html += "</div>";
  });
  html += "</div>"; // field-box end

  let status = "";
  status += App.turnOnAI ? '<div class="item ai-title">AI</div>' : "";
  status +=
    App.score > 0
      ? `<div class="item score">${formatNumber(App.score)}</div>`
      : "";

  gameStatus.innerHTML = status;
  gameWindow.innerHTML = html;
}

// коррдинатная область
function FindClickCoordinate(minX, maxX, minY, maxY, clickX, clickY) {
  if (clickY < minY) {
    if (clickX < minX) {
      return 1;
    } else if (clickX > maxX) {
      return 3;
    } else {
      return 2;
    }
  } else if (clickY > maxY) {
    if (clickX < minX) {
      return 7;
    } else if (clickX > maxX) {
      return 9;
    } else {
      return 8;
    }
  } else {
    if (clickX < minX) {
      return 4;
    } else if (clickX > maxX) {
      return 6;
    } else {
      return 5;
    }
  }
}

// крайнее положение фигуры
function GetMovedFigurePosition() {
  const positions = {
    bottom: [],
    left: [],
    right: [],
    top: [],
  };
  const movedFigure = document.body.querySelectorAll(".active");
  let brick = null;

  for (let i = 0; i < movedFigure.length; i++) {
    brick = movedFigure[i].getBoundingClientRect();
    positions.bottom.push(brick.bottom);
    positions.left.push(brick.left);
    positions.right.push(brick.right);
    positions.top.push(brick.top);
  }

  const sortFunction = function (a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  positions.bottom.sort(sortFunction).reverse();
  positions.left.sort(sortFunction);
  positions.right.sort(sortFunction).reverse();
  positions.top.sort(sortFunction);

  return {
    bottom: positions.bottom[0],
    left: positions.left[0],
    right: positions.right[0],
    top: positions.top[0],
  };
}

export const init = () => {
  {
    const intro = document.getElementById("intro");
    intro.addEventListener("click", function (event) {
      event.stopPropagation();
      intro.parentNode.removeChild(intro);
      setTimeout(Start, 0);
    });
  }

  window.addEventListener("resize", Draw);

  window.addEventListener("keydown", function (event) {
    if (isPause()) return;

    if (event.code === "ArrowUp") {
      Rotate();
    } else if (event.code === "ArrowRight") {
      MoveRight();
    } else if (event.code === "ArrowLeft") {
      MoveLeft();
    }
  });

  window.addEventListener("keydown", function (event) {
    if (isPause()) return;

    if (event.code === "KeyH") {
      if (App.turnOnAI) {
        App.turnOnAI = false;
      } else {
        App.turnOnAI = true;
        AI();
      }
    }
    if (event.code === "ArrowDown") {
      FastDown();
    } else if (event.code === "Escape") {
      if (!isPause()) GamePausePopup();
    }
  });

  window.addEventListener("mousedown", function (event) {
    if (isPause()) return;

    const fp = GetMovedFigurePosition();
    const area = FindClickCoordinate(
      fp.left,
      fp.right,
      fp.top,
      fp.bottom,
      event.clientX,
      event.clientY
    );

    if (area === 1 || area === 4 || area === 7) {
      MoveLeft();
    } else if (area === 3 || area === 6 || area === 9) {
      MoveRight();
    } else if (area === 2 || area === 5) {
      Rotate();
    } else if (area === 8) {
      FastDown();
    }
  });
};
