function AI() {
    if (App.currentFigure === null ||
            isPause()) {
        return false;
    }

    clearTimeout(App.timeout);

    var field       = DeleteFromField(App.field, App.currentFigure);
    var variants    = AIgetPosibleVariants(field, App.currentFigure);
    var best        = AIbest(variants, field, App.nextFigure);
    var theBest     = AItheBest(best);

    if (theBest !== false) {
        AImove(theBest.pos_x, theBest.state);
    }
}



function AIgetPosibleVariants(inField, inCurrent) {
    var field   = inField.clone();
    var current = inCurrent.clone();
    var result  = [];

    if (current.gridY < 0) {
        current.gridY = 0; // FIXME опускаем вниз, чтобы убедиться, что фигуру можно повернуть
    }

    var startX = current.gridX;

    // Крутим фигуру
    for (var i = 0; i < current.states.length; i++) {
        if (++current.currentState > current.states.length - 1) {
            current.currentState = 0;
        }

        // FIXME OMG just look at this xD

        // Пошли влево
        current.gridX = startX;
        do {
            current.gridX--;
            var tmpL = current.clone();
            tmpL.gridY = AImaxY(field, current);
            if (tmpL.gridY !== null) {
                result.push({
                    figure: tmpL,
                    rating: AIfieldRating(field, tmpL)
                });
            }
            else {
                break;
            }
        }
        while (true);

        // А теперь вправо c начальной позиции
        current.gridX = startX - 1;
        do {
            current.gridX++;
            var tmpR = current.clone();
            tmpR.gridY = AImaxY(field, current);
            if (tmpR.gridY !== null) {
                result.push({
                    figure: tmpR,
                    rating: AIfieldRating(field, tmpR)
                });
            }
            else {
                break;
            }
        }
        while (true);
    }

    return result;
}



function AImaxY(inField, inFigure) {
    var tmpFigure = inFigure.clone();
    var maxY = null;

    while (PutOnField(inField, tmpFigure) !== false) {
        maxY = tmpFigure.gridY++; // присваиваем значение, затем увеличиваем
    }

    return maxY;
}



function AIbestSort(array) {
    var sortFunction = function(a, b){
        if (a.rating < b.rating) return -1;
        if (a.rating > b.rating) return 1;
        return 0;
    };
    return array.sort(sortFunction);
}



function AIbest(array, inField, inNext) {
    var n = 2; // для лучших n значений просчитаем следующий ход (минимум 2)
    var best = AIbestSort(array).slice(-n); // последние n элементов
    var result = [];

    best.each(function(item) {
        var field = PutOnField(inField, item.figure);
            // удаляем заполненные строки
            field.each(function(row, index) {
                var fullLine = true;

                row.each(function(cell) {
                    if (cell[0] !== 1) fullLine = false;
                });

                if (fullLine) {
                    field.splice(index, 1);
                    field.unshift(emptyRow());
                }
            });
        var nextBest = AItheBest(AIgetPosibleVariants(field, inNext));
        if (nextBest !== false &&
                typeof nextBest.rating !== 'undefined') {
            item.rating += nextBest.rating;
            result.push(item);
        }
    });

    return result;
}



function AItheBest(array) {
    var item = AIbestSort(array).pop();

    if (typeof item === 'undefined' ||
            typeof item.figure === 'undefined') {
        return false;
    }

    return {
        pos_x:  item.figure.gridX,
        state:  item.figure.currentState,
        rating: item.rating
    };
}



function AIfieldRating(inField, inFigure) {
    var field = PutOnField(inField, inFigure);

    var AggregateHeight = 0;
    var Holes           = 0;
    var CompleteLines   = 0;
    var Bumpiness       = 0;

    for (var x = 0, isEmptyTop, columnHight, prevColumnHight = null; x < App.fieldX; x++) {
        isEmptyTop = true;
        columnHight = App.fieldY;
        for (var y = 0; y < App.fieldY; y++) {
            if (field[y][x][0] !== 1) { // пустая ячейка
                if (isEmptyTop) {
                    columnHight--;
                }
                else {
                    Holes++;
                }
            }
            else {
                isEmptyTop = false;
            }
        }
        AggregateHeight += columnHight;
        if (prevColumnHight !== null) { // начинаем со 2й колонки
            Bumpiness += Math.abs(prevColumnHight - columnHight);
        }
        prevColumnHight = columnHight;
    }

    field.each(function(row) {
        var fullLine = true;

        row.each(function(cell) {
            if (cell[0] !== 1) fullLine = false;
        });

        // if (fullLine) CompleteLines += App.fieldX;
        if (fullLine) CompleteLines++;
    });

    return   0.99275 * CompleteLines +
            -0.66569 * AggregateHeight +
            -0.46544 * Holes +
            -0.24077 * Bumpiness;
}





function AImove(toX, toState) {
    AImoveDown(true);
    AIrotate(true, toState);
    AImoveX(true, toX);
    FastDown();
}

function AImoveDown(loop) {
    if (App.currentFigure.gridY < 0 && loop) {
        // console.log('AI down');
        loop = MoveDown();
        AImoveDown(loop);
    }
}

function AImoveX(loop, toX) {
    if (App.currentFigure.gridX !== toX && loop) {
        if (App.currentFigure.gridX > toX) {
            // console.log('AI left');
            loop = MoveLeft();
        }
        else if (App.currentFigure.gridX < toX) {
            // console.log('AI right');
            loop = MoveRight();
        }
        AImoveX(loop, toX);
    }
}

function AIrotate(loop, toState) {
    if (App.currentFigure.currentState !== toState && loop) {
        // console.log('AI rotate');
        loop = Rotate();
        AIrotate(loop, toState);
    }
}