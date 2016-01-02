var $ = function (id) { return document.getElementById(id); };

var game = {
    grid: new Array(),
    rows: 0,
    cols: 0,
    mines: 0,
    remaining: 0,
    revealed: 0,
    maxreveals: 0,
    flag: '&#9873;&#65038;',
    mine: '&#9728;&#65038;',
    flagMode: false,

    start: function () {
        var rows = $('rows').value,
            cols = $('cols').value,
            mines = $('mines').value;

        game.initialize_grid(rows, cols);
        game.set_mines(mines);
        game.fill_grid();
        game.add_grid_to_DOM();
        game.bind_keys();
    },

    reset: function () {
        $('grid').innerHTML = '';
        $('tagline').innerHTML = 'click a mine and lose';
        $('tagline').style.color = 'black';
        game.revealed = 0;
        game.start();
    },

    initialize_grid: function (rows, cols) {
        if (rows > 25) {
            rows = 25;
            $('tagline').innerHTML = 'maximum number of rows/columns is 25';
        }
        if (cols > 25) {
            cols = 25;
            $('tagline').innerHTML = 'maximum number of rows/columns is 25';
        }

        game.grid = new Array(rows);
        for (var i = 0; i < rows; i++) {
            game.grid[i] = new Array(cols);
        }
        game.rows = rows;
        game.cols = cols;
    },

    set_mines: function (number) {
        game.mines = number;
        $('remaining').innerHTML = number;
        game.remaining = number;
        game.maxreveals = game.rows * game.cols - game.mines;

        var cells = [];
        for (var i = 0; i < game.rows; i++) {
            for (var j = 0; j < game.cols; j++) {
                cells.push([i, j]);
            }
        }

        for (var i = 0; i < number; i++) {
            var rand = Math.floor(Math.random() * cells.length),
                row = cells[rand][0],
                col = cells[rand][1];

            cells.splice(rand, 1);

            if (game.grid[row][col] !== 'X') {
                game.grid[row][col] = 'X';
            } else {
                number++;
            }
        }
    },

    update_remaining: function () {
        $('remaining').innerHTML = game.remaining;
    },

    fill_grid: function () {
        for (var i = 0; i < game.rows; i++) {
            for (var j = 0; j < game.cols; j++) {
                game.fill_cell(i, j);
            }
        }
    },

    fill_cell: function (row, col) {
        if (game.grid[row][col] !== 'X') {
            var adjacentMines = game.get_adjacent_mines(row, col);
            game.grid[row][col] = adjacentMines;
        }
    },

    get_adjacent_mines: function (row, col) {
        var mines = 0,
            rowstart = row - 1,
            colstart = col - 1;

        for (var i = rowstart; i < rowstart+3; i++) {
            for (var j = colstart; j < colstart+3; j++) {
                try {
                    if (game.grid[i][j] === 'X') {
                        mines += 1;
                    }
                } catch (TypeError) {
                }
            }
        }

        return mines;
    },

    add_grid_to_DOM: function () {
        $('grid').innerHTML = '';
        for (var i = 0; i < game.rows; i++) {
            $('grid').innerHTML += '<br>';
            for (var j = 0; j < game.cols; j++) {
                game.add_cell_to_DOM(i, j);
            }
        }
    },

    add_cell_to_DOM: function (row, col) {
        var cell = game.grid[row][col],
            id = 'id="cell-'+ row +'-'+ col +'"',
            classname = 'class="cell" ',
            onclick = 'onclick="game.click_cell('+ row +','+ col +')" ',
            oncontext = 'oncontextmenu="game.flag_cell('+ row +','+ col +'); return false"',
            button = ('<button '+ id + classname + onclick 
                      + oncontext + '>&nbsp;</button>');

        $('grid').innerHTML += button;
    },

    click_cell: function (row, col) {
        var id = 'cell-' + row + '-' + col;
        if (game.flagMode) {
            game.flag_cell(row, col);
        } else if (!game.is_flag(id)) {
            if (game.revealed === 0) {
                game.safe_reveal(row, col);
            } else {
                game.reveal_cell(row, col);
            }
        }
    },

    flag_cell: function (row, col) {
        var id = 'cell-' + row + '-' + col;
        if ($(id).innerHTML === '&nbsp;') {
            $(id).innerHTML = game.flag;
            $(id).style.color = '#900';
            game.remaining -= 1;
        } else {
            if (game.is_flag(id)) {    
                $(id).innerHTML = '&nbsp;';
                game.remaining += 1;
            }
        }
        game.update_remaining();
    },

    safe_reveal: function (row, col) {
        if (game.grid[row][col] === 'X') {
            game.relocate_mine(row, col);
            game.fill_grid();
        }
        game.reveal_cell(row, col);
    },

    relocate_mine: function (row, col) {
        var empties = [];
        for (var i = 0; i < game.rows; i++) {
            for (var j = 0; j < game.cols; j++) {
                if (game.grid[i][j] !== 'X') {
                    empties.push([i, j]);
                }
            }
        }

        var random = Math.floor(Math.random() * empties.length),
            newcell = empties[random];

        game.grid[newcell[0]][newcell[1]] = 'X';
        game.grid[row][col] = '';
    },

    reveal_cell: function (row, col) {
        var id = 'cell-' + row + '-' + col,
            value = game.grid[row][col];
        if (value === 'X') {
            game.lose();
        } else if ($(id).innerHTML === '&nbsp;') {
            game.revealed += 1;
            $(id).innerHTML = value;
            game.style_cell(id, value);

            if (value === 0) {
                game.reveal_around(row, col);
            }
            
            game.update_status();
        }
    },

    is_flag: function (id) {
        var cellvalue = $(id).innerHTML.charCodeAt(0).toString(),
            flagvalue = game.flag.replace(';','').split('&#')[1];
        if (cellvalue === flagvalue) {
            return true;
        }
        return false;
    },

    style_cell: function (id, value) {
        var color = 'black',
            background = '#BBB',
            border = '1px solid #999';

        switch (value) {
            case 'X':
                background = 'red'; 
                border = '1px solid #000';
                break;
            case 0:
                color = '#BBB'; break;
            case 1:
                color = 'blue'; break;
            case 2:
                color = 'green'; break;
            case 3:
                color = '#900'; break;
            case 4:
                color = 'purple'; break;
        }

        $(id).style.color = color;
        $(id).style.backgroundColor = background;
        $(id).style.border = border;
    },

    reveal_around: function (row, col) {
        var rowstart = row - 1,
            colstart = col - 1;

        for (var i = rowstart; i < rowstart+3; i++) {
            for (var j = colstart; j < colstart+3; j++) {
                // Reveal cell if it is in bounds and not the center
                if (!(i == row && j == col)) {
                    try {
                        game.reveal_cell(i, j);
                    } catch (TypeError) {
                    }
                }
            }
        }
    },

    bind_keys: function () {
        Mousetrap.bind("f", function(){ 
            if ($('flag').checked) {
                $('flag').checked = false;
            } else {
                $('flag').checked = true;
            }
        });
    },

    update_status: function () {
        if (game.revealed === game.maxreveals) {
            game.win();
        }
    },

    win: function () {
        $('tagline').innerHTML = 'you win :)';
        $('tagline').style.color = 'green';
        for (var i = 0; i < game.rows; i++) {
            for (var j = 0; j < game.cols; j++) {
                var id = 'cell-' + i + '-' + j;
                game.disable_cell(id);

                if (game.grid[i][j] === 'X') {
                    $(id).innerHTML = game.flag;
                    $(id).style.color = '#900';
                }
            }
        }
        game.update_remaining();
    },

    lose: function () {
        $('tagline').innerHTML = 'you lost :(';
        $('tagline').style.color = 'red';
        for (var i = 0; i < game.rows; i++) {
            for (var j = 0; j < game.cols; j++) {
                var id = 'cell-' + i + '-' + j;
                game.disable_cell(id);

                if (game.grid[i][j] === 'X') {
                    $(id).innerHTML = game.mine;
                    game.style_cell(id, 'X');
                }
            }
        }
    },

    disable_cell: function (id) {
        $(id).onclick = false;
        $(id).oncontextmenu = false;
    },

    toggle_flag: function () {
        if (game.flagMode) {
            game.flagMode = false;
            $('flag').style.backgroundColor = '#08F';
        } else {
            game.flagMode = true;
            $('flag').style.backgroundColor = '#05C';
        }
    },
};

window.onload = function () {
    game.start();
}