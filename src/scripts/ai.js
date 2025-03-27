import {
  App,
  DeleteFromField,
  emptyRow,
  FastDown,
  isPause,
  MoveDown,
  MoveLeft,
  MoveRight,
  PutOnField,
  Rotate,
} from "./app";
import { DeepCopy } from "./lib";

export function AI() {
  if (App.currentFigure === null || isPause()) {
    return false;
  }

  App.clearTimeout();

  const field = DeleteFromField(App.field, App.currentFigure);
  const variants = AIgetPosibleVariants(field, App.currentFigure);
  const best = AIbest(variants, field, App.nextFigure);
  const theBest = AItheBest(best);

  if (theBest !== false) {
    AImove(theBest.pos_x, theBest.state);
  }
}

function AIgetPosibleVariants(inField, inCurrent) {
  const field = DeepCopy(inField);
  const current = DeepCopy(inCurrent);
  const result = [];

  if (current.gridY < 0) {
    current.gridY = 0; // FIXME опускаем вниз, чтобы убедиться, что фигуру можно повернуть
  }

  const startX = current.gridX;

  // Крутим фигуру
  for (let i = 0; i < current.states.length; i++) {
    if (++current.currentState > current.states.length - 1) {
      current.currentState = 0;
    }

    // Пошли влево
    current.gridX = startX;
    do {
      current.gridX--;
      const tmpL = DeepCopy(current);
      tmpL.gridY = AImaxY(field, current);
      if (tmpL.gridY !== null) {
        result.push({
          figure: tmpL,
          rating: AIfieldRating(field, tmpL),
        });
      } else {
        break;
      }
    } while (true);

    // А теперь вправо c начальной позиции
    current.gridX = startX - 1;
    do {
      current.gridX++;
      const tmpR = DeepCopy(current);
      tmpR.gridY = AImaxY(field, current);
      if (tmpR.gridY !== null) {
        result.push({
          figure: tmpR,
          rating: AIfieldRating(field, tmpR),
        });
      } else {
        break;
      }
    } while (true);
  }

  return result;
}

function AImaxY(inField, inFigure) {
  const tmpFigure = DeepCopy(inFigure);
  let maxY = null;

  while (PutOnField(inField, tmpFigure) !== false) {
    maxY = tmpFigure.gridY++; // присваиваем значение, затем увеличиваем
  }

  return maxY;
}

function AIbestSort(array) {
  const sortFunction = function (a, b) {
    if (a.rating < b.rating) return -1;
    if (a.rating > b.rating) return 1;
    return 0;
  };
  return array.sort(sortFunction);
}

function AIbest(array, inField, inNext) {
  const n = 2; // для лучших n значений просчитаем следующий ход (минимум 2)
  const best = AIbestSort(array).slice(-n); // последние n элементов
  const result = [];

  best.forEach(function (item) {
    const field = PutOnField(inField, item.figure);
    // удаляем заполненные строки
    field.forEach(function (row, index) {
      let fullLine = true;

      row.forEach(function (cell) {
        if (cell[0] !== 1) fullLine = false;
      });

      if (fullLine) {
        field.splice(index, 1);
        field.unshift(emptyRow());
      }
    });
    const nextBest = AItheBest(AIgetPosibleVariants(field, inNext));
    if (nextBest !== false && typeof nextBest.rating !== "undefined") {
      item.rating += nextBest.rating;
      result.push(item);
    }
  });

  return result;
}

function AItheBest(array) {
  const item = AIbestSort(array).pop();

  if (typeof item === "undefined" || typeof item.figure === "undefined") {
    return false;
  }

  return {
    pos_x: item.figure.gridX,
    state: item.figure.currentState,
    rating: item.rating,
  };
}

function AIfieldRating(inField, inFigure) {
  const field = PutOnField(inField, inFigure);

  let AggregateHeight = 0;
  let Holes = 0;
  let CompleteLines = 0;
  let Bumpiness = 0;

  let x = 0,
    isEmptyTop,
    columnHight,
    prevColumnHight = null;
  for (; x < App.fieldX; x++) {
    isEmptyTop = true;
    columnHight = App.fieldY;
    for (let y = 0; y < App.fieldY; y++) {
      if (field[y][x][0] !== 1) {
        // пустая ячейка
        if (isEmptyTop) {
          columnHight--;
        } else {
          Holes++;
        }
      } else {
        isEmptyTop = false;
      }
    }
    AggregateHeight += columnHight;
    if (prevColumnHight !== null) {
      // начинаем со 2й колонки
      Bumpiness += Math.abs(prevColumnHight - columnHight);
    }
    prevColumnHight = columnHight;
  }

  field.forEach(function (row) {
    let fullLine = true;

    row.forEach(function (cell) {
      if (cell[0] !== 1) fullLine = false;
    });

    if (fullLine) CompleteLines++;
  });

  return (
    0.99275 * CompleteLines +
    -0.66569 * AggregateHeight +
    -0.46544 * Holes +
    -0.24077 * Bumpiness
  );
}

function AImove(toX, toState) {
  AImoveDown(true);
  AIrotate(true, toState);
  AImoveX(true, toX);
  FastDown();
}

function AImoveDown(loop) {
  if (App.currentFigure.gridY < 0 && loop) {
    loop = MoveDown();
    AImoveDown(loop);
  }
}

function AImoveX(loop, toX) {
  if (App.currentFigure.gridX !== toX && loop) {
    if (App.currentFigure.gridX > toX) {
      loop = MoveLeft();
    } else if (App.currentFigure.gridX < toX) {
      loop = MoveRight();
    }
    AImoveX(loop, toX);
  }
}

function AIrotate(loop, toState) {
  if (App.currentFigure.currentState !== toState && loop) {
    loop = Rotate();
    AIrotate(loop, toState);
  }
}
