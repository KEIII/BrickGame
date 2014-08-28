var gameWindow = document.getElementById('window');
var gameStatus = document.getElementById('status');
var colors = [
    'red',      // 0
    'orange',   // 1
    'yellow',   // 2
    'green',    // 3
    'cyan',     // 4
    'blue',     // 5
    'violet'    // 6
];



function Draw() {
    if (App.field === null) return;

    // style.css
    var margin  = 30;
    var padding = 5;
    var border  = 2;

    var aspectRatio = App.fieldY / App.fieldX;
    var maxWidth = window.innerWidth - margin * 2;
    var maxHeight = window.innerHeight - margin * 2;
    var width = maxHeight / aspectRatio;
    if (width > maxWidth) width = maxWidth;

    var cellSize = Math.round((width - (padding + border) * 2) / App.fieldX);
    var cellBorderSize = Math.round(cellSize * 0.04);
    width = cellSize * App.fieldX + (padding + border) * 2;



    var html = '<div class="field-box" style="width:' + width + 'px;">';
    App.field.each(function(row){
        html += '<div class="row">';
        row.each(function(cell){
            html += '<div style="border-width:' + cellBorderSize + 'px;width:' + cellSize + 'px;height:' + cellSize + 'px;" class="brick ';
            html += (cell[0] === 1) ? colors[cell[1]] : 'empty'; // цветная клетка или пустая
            if (cell[2] === 1) html += ' active'; // перемещаемая фигура
            if (cell[3] === 1) html += ' blink'; // мигать ли
            if (cell[4] === 1) html += ' next'; // маркер следующей фигуры
            html += '"></div>';
        });
        html += '</div>';
    });
    html += '</div>'; // field-box end


    var status = '';
    status += (App.turnOnAI) ? '<div class="item ai-title">AI</div>' : '';
    status += (App.score > 0) ? '<div class="item score">' + formatNumber(App.score) + '</div>' : '';

    gameStatus.innerHTML = status;
    gameWindow.innerHTML = html;
}



window.addEventListener('resize', Draw);