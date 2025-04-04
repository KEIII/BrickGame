import { RandomPieceGenerator } from "./figures";
import { DeepCopy, eachMatrix, formatNumber } from "./lib";
import { AI_isON, AI_toggle, AI_turnOff, AI_turnOn } from "./ai";
import { createRenderer } from "./render";
import { ksBehaviourSubject } from "@keiii/k-stream";

const fieldX = 10; // размер поля по горизонтали
const fieldY = 22; // размер поля по вертикали

export const App = {
  fieldX,
  fieldY,
  renderer: createRenderer({
    x: fieldX,
    y: fieldY,
    onElement: (el) => {
      document.getElementById("game-window").append(el);
    },
  }),
  speedStart: 1000, // начальное время (скорость)
  speedStep: 0.75, // процент уменьшения времени за линию
  speedCurrent: null, // текущее время (скорость)
  currentFigure: null, // падующая фигура
  nextFigure: null, // следующая фигура
  bagFigures: [],
  field: null,
  score: null, // счет (кол-во линий)
  startTime: null, // время запуска игры
  isPause: true,
  _animationId: null,
  _timeoutId: null,
  clearTimeout() {
    window.cancelAnimationFrame(App._animationId);
    window.clearTimeout(App._timeoutId);
  },
  delay(f, ms) {
    App.clearTimeout();
    App._timeoutId = window.setTimeout(f, AI_isON() ? App.speedCurrent : ms);
  },
  events: {
    newCircle: ksBehaviourSubject(),
  },
  _fastDown: false,
};

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
  App.clearTimeout();
  App.isPause = true;
}

function GameResume() {
  App.isPause = false;
  GameTick();
}

export function isPause() {
  return App.isPause === true;
}

function Start() {
  // сбрасываем значения
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
  App._fastDown = false;
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
    GameTick();

    App.events.newCircle.next();
  };

  if (ClearLines()) {
    const blinkAnimationDuration = 300;
    App.delay(
      fn,
      /* время анимации удаления линии */ blinkAnimationDuration * 3
    );
  } else {
    fn();
  }
}

function GameTick() {
  if (App._fastDown) {
    if (MoveDown()) {
      window.cancelAnimationFrame(App._animationId);
      App._animationId = requestAnimationFrame(GameTick);
    } else {
      NewCircle();
    }
  } else {
    App.delay(() => {
      if (MoveDown()) {
        GameTick();
      } else {
        NewCircle();
      }
    }, /* скорость падения фигуры */ App.speedCurrent);
  }
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
  App._fastDown = true;
  GameTick();
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

    Draw();

    toRemove.forEach(function (index) {
      // Удаляем линию
      App.field.splice(index, 1);

      // Заполняем сверху
      App.field.unshift(emptyRow());

      // Увеличиваем скорость
      App.speedCurrent = App.speedCurrent * App.speedStep;
      if (App.speedCurrent < 100) {
        App.speedCurrent = 300;
      }

      // Добавляем очков
      // бонус за кол-во линий
      App.score += 1;
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
  GamePause(); // disable control

  let message = '<div class="popup">';
  message += '<div class="title">Good game!</div>';
  message +=
    '<table><tr><td>Your score</td><td class="score">' +
    formatNumber(App.score) +
    "</td></tr>";
  message += "<tr><td>Time</td><td>" + TimeDiff() + "</td></tr></table>";
  message += '<div class="button-box"><div class="button">Restart</div></div>';
  message += "</div>";
  const popup = document.getElementById("popup");
  popup.innerHTML = message;

  const listener = function () {
    Start();
    popup.removeEventListener("click", listener, false);
    popup.innerHTML = "";
  };
  popup.addEventListener("click", listener, false);
}

const gameStatus = document.getElementById("status");

function Draw() {
  if (App.field === null) return;
  App.renderer.render({
    ai: AI_isON(),
    score: App.score,
    field: App.field,
    updateStatus: (html) => (gameStatus.innerHTML = html),
  });
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

    const removeIntro = () => intro.parentNode.removeChild(intro);

    const playButton = document.getElementById("js-play-button");
    playButton.addEventListener("click", () => {
      removeIntro();
      Start();
    });

    const watchAIButton = document.getElementById("js-watch-ai-button");
    watchAIButton.addEventListener("click", () => {
      removeIntro();
      Start();
      AI_turnOn();
    });
  }

  window.addEventListener("resize", App.renderer.resize);

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

  const pausePopup = document.getElementById("pause");

  document.getElementById("js-resume-btn").addEventListener("click", () => {
    GameResume();
    pausePopup.style.display = "none";
  });

  window.addEventListener("keydown", function (event) {
    if (event.code === "Escape") {
      if (isPause()) {
        if (pausePopup.style.display !== "none") {
          pausePopup.style.display = "none";
          GameResume();
        }
      } else {
        pausePopup.style.display = "block";
        GamePause();
      }
    }

    if (isPause()) return;

    if (event.code === "KeyH") {
      AI_toggle();
    } else if (event.code === "ArrowDown") {
      FastDown();
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
