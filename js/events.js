window.addEventListener('keydown', function(event) {
    if (isPause()) return;

    if (event.keyCode === 38) { // Arrow Up
        Rotate();
    }
    else if (event.keyCode === 39) { // Arrow Right
        MoveRight();
    }
    else if (event.keyCode === 37) { // Arrow Left
        MoveLeft();
    }
});



window.addEventListener('keyup', function(event) {
    if (isPause()) return;

    if (event.keyCode === 72) { // H
        if (App.turnOnAI) {
            App.turnOnAI = false;
        }
        else {
            App.turnOnAI = true;
            AI();
        }
    }
    if (event.keyCode === 40) { // Arrow Down
        FastDown();
    }
    else if (event.keyCode === 27) { // ESC
        if (!isPause()) GamePausePopup();
    }
});



window.addEventListener('mousedown', function(event) {
    if (isPause()) return;

    var fp = GetMovedFigurePosition();
    var area = FindClickCoordinate(fp.left, fp.right, fp.top, fp.bottom, event.clientX, event.clientY);

    if (area === 1 || area === 4 || area === 7) {
        MoveLeft();
    }
    else if (area === 3 || area === 6 || area === 9) {
        MoveRight();
    }
    else if (area === 2 || area === 5) {
        Rotate();
    }
    else if (area === 8) {
        FastDown();
    }
});



// коррдинатная область
function FindClickCoordinate(minX, maxX, minY, maxY, clickX, clickY) {
    if (clickY < minY) {
        if (clickX < minX) {
            return 1;
        }
        else if (clickX > maxX) {
            return 3;
        }
        else {
            return 2;
        }
    }
    else if (clickY > maxY) {
        if (clickX < minX) {
            return 7;
        }
        else if (clickX > maxX) {
            return 9;
        }
        else {
            return 8;
        }
    }
    else {
        if (clickX < minX) {
            return 4;
        }
        else if (clickX > maxX) {
            return 6;
        }
        else {
            return 5;
        }
    }

    return 0;
}



// крайнее положение фигуры
function GetMovedFigurePosition() {
    var positions = {
        bottom: [],
        left:   [],
        right:  [],
        top:    [],
    };
    var movedFigure = document.body.querySelectorAll('.active');
    var brick = null;

    for (var i = 0; i < movedFigure.length; i++) {
        brick = movedFigure[i].getBoundingClientRect();
        positions.bottom.push(brick.bottom);
        positions.left.push(brick.left);
        positions.right.push(brick.right);
        positions.top.push(brick.top);
    }

    var sortFunction = function(a, b){
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
    };

    positions.bottom.sort(sortFunction).reverse();
    positions.left.sort(sortFunction);
    positions.right.sort(sortFunction).reverse();
    positions.top.sort(sortFunction);

    var position = {
        bottom: positions.bottom[0],
        left:   positions.left[0],
        right:  positions.right[0],
        top:    positions.top[0],
    };

    return position;
}