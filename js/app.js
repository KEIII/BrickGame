var App = {};
App.fieldX          = 10;   // размер поля по горизонтали
App.fieldY          = 22;   // размер поля по вертикали
App.speedStart      = 1000; // начальное время (скорость)
App.speedStep       = 1;    // процент уменьшения времени
App.speedCurrent    = null; // текущее время (скорость)
App.currentFigure   = null; // падующая фигура
App.nextFigure      = null; // следующая фигура
App.bagFigures      = [];
App.timeout         = null;
App.field           = null;
App.score           = null; // счет (кол-во линий)
App.startTime       = null; // время запуска игры
App.isPause         = true;
App.turnOnAI        = false;



var fillField = function() {
    var field = [];

    for (var y = 0; y < App.fieldY; y++) {
        field[y] = emptyRow();
    }

    return field;
};



function emptyRow() {
    var row = [];
    for (var i = 0; i < App.fieldX; i++) {
        row.push([0, // заполнен ли блок
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



function isPause() {
    return App.isPause === true;
}



function Start() {
    // сбрасываем значения
    App.turnOnAI      = true;
    App.isPause       = false;
    App.startTime     = new Date();
    App.speedCurrent  = App.speedStart;
    App.score         = 0;
    App.field         = fillField();
    App.currentFigure = null;
    App.bagFigures    = [];
    App.nextFigure    = GetNextFigure();

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

    var fn = function(){
        var nextFigure = App.nextFigure;
        var newField = PutOnField(App.field, nextFigure);

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
    }
    else {
        fn();
    }
}



function GameTimeout() {
    var fn = function() {
        if (MoveDown() === true) {
            GameTimeout();
        }
        else {
            NewCircle();
        }
    };
    clearTimeout(App.timeout);
    App.timeout = setTimeout(fn, App.turnOnAI ? 100 : App.speedCurrent);
}



function PutOnField(inField, figure) {
    var isOk = true;
    var field = inField.clone();

    eachMatrix(figure.states[figure.currentState], function(row, y, cell, x){
        if (cell !== 1) return;

        var pos_y = y + figure.gridY;
        var pos_x = x + figure.gridX;

        if (typeof field[pos_y] === 'undefined' ||
                typeof field[pos_y][pos_x] === 'undefined') {
            // console.log('фигура вышла за рамки поля');
            isOk = false;
            return false;
        }

        if (field[pos_y][pos_x][0] === 0) {
            field[pos_y][pos_x][0] = 1;
            field[pos_y][pos_x][1] = figure.color;
            field[pos_y][pos_x][2] = 1;
            field[pos_y][pos_x][3] = 0;
        }
        else {
            // console.log('ячейка уже занята');
            isOk = false;
            return false;
        }
    });

    return isOk ? field : false;
}



function DeleteActiveMarker(inField) {
    var field = inField.clone();

    eachMatrix(field, function(row, y, cell, x){
        cell[2] = 0; // освободить ячейку
    });

    return field;
}



function UpdateNextFigureMarker() {
    var field = App.field;
    var figure = App.nextFigure;

    // удаляем предыдущий маркер
    eachMatrix(field, function(row, y, cell, x){
        cell[4] = 0;
    });

    // ставим новый
    eachMatrix(figure.states[figure.currentState], function(row, y, cell, x){
        if (cell !== 1) return;

        var pos_y = y + figure.gridY;
        var pos_x = x + figure.gridX;

        if (typeof field[pos_y] === 'undefined' ||
                typeof field[pos_y][pos_x] === 'undefined') {
            return;
        }

        field[pos_y][pos_x][4] = 1;
    });
}



function DeleteFromField(inField, inFigure) {
    var field = inField.clone();

    if (inFigure !== null) {
        eachMatrix(inFigure.states[inFigure.currentState], function(row, y, cell, x){
            if (cell !== 1) return;

            var pos_y = y + inFigure.gridY;
            var pos_x = x + inFigure.gridX;

            if (typeof field[pos_y] !== 'undefined' &&
                    typeof field[pos_y][pos_x] !== 'undefined') {
                field[pos_y][pos_x][0] = 0;
                field[pos_y][pos_x][1] = 0;
                field[pos_y][pos_x][2] = 0;
                field[pos_y][pos_x][3] = 0;
            }
        });
    }

    return field;
}



function isCanMove(inField, inFigure) {
    if (isPause() || inFigure === null) return false;
    var newField = PutOnField(inField, inFigure);
    return !newField ?  false : {
        field: newField,
        figure: inFigure.clone()
    };
}



function Move(moved) {
    if (moved === false) return false;

    App.field = moved.field;
    App.currentFigure = moved.figure;
    Draw();

    return true;
}



function MoveDown() {
    if (App.currentFigure === null) return;
    var figure = App.currentFigure.clone();
    var field = DeleteFromField(App.field, figure);
    figure.gridY++;
    return Move(isCanMove(field, figure));
}



function MoveLeft() {
    if (App.currentFigure === null) return;
    var figure = App.currentFigure.clone();
    var field = DeleteFromField(App.field, figure);
    figure.gridX--;
    return Move(isCanMove(field, figure));
}



function MoveRight() {
    if (App.currentFigure === null) return;
    var figure = App.currentFigure.clone();
    var field = DeleteFromField(App.field, figure);
    figure.gridX++;
    return Move(isCanMove(field, figure));
}



function Rotate() {
    if (App.currentFigure === null) return;
    var figure = App.currentFigure.clone();
    var field = DeleteFromField(App.field, figure);
    if (++figure.currentState > figure.states.length - 1) figure.currentState = 0;
    return Move(isCanMove(field, figure));
}



function FastDown() {
    clearTimeout(App.timeout);

    if (MoveDown() === true) {
        App.timeout = setTimeout(FastDown, 7); // speed
    }
    else {
        GameTimeout();
    }
}



function ClearLines() {
    var toRemove = [];

    App.field.each(function(row, index) {
        var fullLine = true;

        row.each(function(cell) {
            if (cell[0] !== 1) fullLine = false;
        });

        if (fullLine) toRemove.push(index);
    });

    if (toRemove.length > 0) {
        // Добавляем параметр, чтобы мигали фигуры
        toRemove.each(function(index){
            App.field[index].each(function(cell) {
                cell[3] = 1;
            });
        });

        // Отрисовываем
        Draw();

        toRemove.each(function(index){
            // Удаляем линию
            App.field.splice(index, 1);

            // Заполняем сверху
            App.field.unshift(emptyRow());

            // Увеличиваем скорость
            App.speedCurrent -= App.speedCurrent * App.speedStep / 100;
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
    var diff = Math.round((new Date() - App.startTime) / 1000); // seconds
    var hour = Math.floor(diff / 3600);
    var minutes = Math.floor((diff - hour * 3600) / 60);
    var seconds = Math.floor(diff - minutes * 60);
    var message = '';

    if (hour > 0) {
        message = AddTimeZero(hour) + ':' + AddTimeZero(minutes) + ':' + AddTimeZero(seconds);
    }
    else if (minutes > 0) {
        message = AddTimeZero(minutes) + ':' + AddTimeZero(seconds);
    }
    else {
        message = seconds + ' sec.';
    }

    return message;
}



function AddTimeZero(num) {
    return (num > 9) ? num : '0' + num;
}



function GameOver() {
    var diff = Math.round((new Date() - App.startTime) / 1000); // seconds
    var minutes = Math.floor(diff / 60);
    var seconds = Math.round(diff - minutes * 60);
    var message  = '<div class="popup">';
        message += '<div class="title">Good game!</div>';
        message += '<table><tr><td>Your score</td><td class="score">' + formatNumber(App.score) + '</td></tr>';
        message += '<tr><td>Time</td><td>' + TimeDiff() + '</td></tr></table>';
        message += '<div class="button-box"><div class="button">Start new game</div></div>';
        message += '</div>';
    var popup = document.getElementById('popup');
    popup.innerHTML = message;
    GamePause(); // disable control

    var listener;
    listener = function(event) {
        event.stopPropagation();
        GameResume();
        Start();
        popup.removeEventListener('click', listener, false);
        popup.innerHTML = '';
    };
    popup.addEventListener('click', listener, false);
}



function GamePausePopup() {
    GamePause();
    var diff = new Date() - App.startTime;
    var message  = '<div class="popup">';
        message += '<div class="title">Paused</div>';
        message += '<div class="button-box"><div class="button">Resume game</div></div>';
        message += '</div>';
    var popup = document.getElementById('popup');
    popup.innerHTML = message;
    GamePause(); // disable control

    var listener;
    listener = function(event) {
        event.stopPropagation();
        GameResume();
        popup.removeEventListener('click', listener, false);
        popup.innerHTML = '';
    };
    popup.addEventListener('click', listener, false);
}



var intro = document.getElementById('intro');
intro.addEventListener('click', function(event){
    event.stopPropagation();
    intro.parentNode.removeChild(intro);
    setTimeout(Start, 0);
});