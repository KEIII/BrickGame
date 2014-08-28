var figures = {

    I: function() {
        this.states = [
            [ [0, 0, 0, 0],
              [1, 1, 1, 1],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 1, 0],
              [0, 0, 1, 0],
              [0, 0, 1, 0],
              [0, 0, 1, 0], ],

            [ [0, 0, 0, 0],
              [0, 0, 0, 0],
              [1, 1, 1, 1],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 1, 0, 0], ]
        ];
        this.color = 4;
        this.gridX = 3;
        this.gridY = -1;
        this.currentState = 0;
    },

    J: function() {
        this.states = [
            [ [1, 0, 0, 0],
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 1, 0],
              [0, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 0, 0],
              [1, 1, 1, 0],
              [0, 0, 1, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [0, 1, 0, 0],
              [1, 1, 0, 0],
              [0, 0, 0, 0] ]
        ];
        this.color = 5; // blue
        this.gridX = 4;
        this.gridY = -1;
        this.currentState = 2;
    },

    L: function() {
        this.states = [
            [ [0, 0, 1, 0],
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 1, 1, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 0, 0],
              [1, 1, 1, 0],
              [1, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [1, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ]
        ];
        this.color = 1; // orange
        this.gridX = 4;
        this.gridY = -1;
        this.currentState = 2;
    },

    O: function() {
        this.states = [
            [ [0, 1, 1, 0],
              [0, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ]
            ];
        this.color = 2; // yellow
        this.gridX = 3;
        this.gridY = 0;
        this.currentState = 0;
    },

    S: function() {
        this.states = [
            [ [0, 1, 1, 0],
              [1, 1, 0, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [0, 1, 1, 0],
              [0, 0, 1, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 0, 0],
              [0, 1, 1, 0],
              [1, 1, 0, 0],
              [0, 0, 0, 0] ],

            [ [1, 0, 0, 0],
              [1, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ]
        ];
        this.color = 3; // green
        this.gridX = 4;
        this.gridY = 0;
        this.currentState = 0;
    },

    T: function() {
        this.states = [
            [ [0, 1, 0, 0],
              [1, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [0, 1, 1, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 0, 0],
              [1, 1, 1, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [1, 1, 0, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ]
        ];
        this.color = 6; // Purple
        this.gridX = 4;
        this.gridY = -1;
        this.currentState = 2;
    },

    Z: function() {
        this.states = [
            [ [1, 1, 0, 0],
              [0, 1, 1, 0],
              [0, 0, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 1, 0],
              [0, 1, 1, 0],
              [0, 1, 0, 0],
              [0, 0, 0, 0] ],

            [ [0, 0, 0, 0],
              [1, 1, 0, 0],
              [0, 1, 1, 0],
              [0, 0, 0, 0] ],

            [ [0, 1, 0, 0],
              [1, 1, 0, 0],
              [1, 0, 0, 0],
              [0, 0, 0, 0] ]
        ];
        this.color = 0;
        this.gridX = 4;
        this.gridY = 0;
        this.currentState = 0;
    },

};



/**
 * Random Generator
 * http://tetris.wikia.com/wiki/Random_Generator
 * Random Generator generates a sequence of all
 * seven one-sided tetrominoes (I, J, L, O, S, T, Z)
 * It can produce a maximum of
 * 12 tetrominoes between one I and the next I.
 */
function RandomPieceGenerator() {
    var bag = [];

    for (var i in figures) {
        if (figures.hasOwnProperty(i)) {
            bag.push(new figures[i]());
        }
    }

    return shuffle(bag);
}