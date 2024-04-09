console.log('hello world')

// cancle the right click manu
window.oncontextmenu = function () {
    return false; 
}

class ScreenBoard {

    constructor (line_size, pressFuncCb) {
        this.pressSquareCb = pressFuncCb;
        // ELEMENTS
        this.timer = document.querySelector('.clock_dashboard');
        this.board_element = document.querySelector('.board');
        this.line_size = line_size;

        this.square_lst = [];
        this.createSquares(line_size);
    }
    

    attribute_square_index = 'square_index'; 
    createSquares(line_size = this.line_size) {
        for (let index = 0; index < line_size*line_size; index++) {
            
            const square = document.createElement("button");
            square.classList.add('square');
    
            square.id = 'id_'+index;
            square.dataset[this.attribute_square_index] = index;
            // square.innerText = "";
            this.board_element.append(square);
            this.square_lst.push(square);

            square.addEventListener('mousedown', event => {
                
                console.log(event);
                
                // left click
                if (event.which == 1) {
                    this.pressSquareCb(index);
                }
                
                // right click
                if (event.which == 3) {
                    if (square.classList.contains('flag')) {
                        square.classList.remove('flag');
                    } else {
                        square.classList.add('flag');
                    }
                }
            });
        }
    }
    
    writeToSqure(index, char) {
        this.square_lst[index].innerText = char;
    }

    updateBoard(board, discover_indexes) {
        discover_indexes.forEach(discover_index => {
            this.writeToSqure(discover_index, board[discover_index]);
        });
    }
    
    updateTimer(timer_in_seconds) {
        this.timer.innerText = timer_in_seconds;
    }
}

class LogicBoard {
    game_over = false;
    
    constructor (lines, bumbs_num) {
        this.screen = new ScreenBoard(lines, this.discoverIndex.bind(this));

        this.lines = lines;
        this.bumbs_num = bumbs_num;

        this.board = this.generateBoard(this.lines, this.bumbs_num);
        this.discoverBoard = Array.from(this.board, x=> 0);
        this.printBoard(false);
        console.log('created logistic board');
    }
    
    generateBoard(lines, bumbs_num) {
        const board_size = lines*lines;
        if (board_size < bumbs_num) throw "there are more bumbs then the board";

        // get list of bumbs
        var bumb_indexes = [];
        while(bumb_indexes.length < bumbs_num){
            var r = Math.floor(Math.random() * board_size);
            if(bumb_indexes.indexOf(r) === -1) bumb_indexes.push(r);
        }

        // fill all the board in information numbers
        var information_board = new Array(board_size).fill(0);
        bumb_indexes.forEach(index => {
            // mark as a bumb.
            information_board[index] = -1;
            
            //add 1 to around only to not bumb square.
            this.getAroundIndexes(index, true, lines).forEach(around_index => {
                if (information_board[around_index] !== -1) {
                    information_board[around_index]++;
                }
            });
        });

        return information_board;
    }

    indexToCordinates(index, line_num=this.lines) {
        const y = Math.floor(index / line_num);
        const x = index % line_num;
        return [y, x];
    }

    cordinatsToIndex(x, y, line_num=this.lines) {
        if (x == null || y == null || x < 0 || y < 0 || x >= line_num || y >= line_num ) {
            // console.log(`cordinats_to_index: error: the cordinats out of bound (${y},${x})`);
            throw `the cordinats out of bound (${x},${y})`;
        } 
        return y * line_num + x;
    }
    
    getAroundIndexes(index, with_diagonals=true, line_num=this.lines) {
        let around_indexes = [];
        const [y, x] = this.indexToCordinates(index, line_num);

        if (with_diagonals) {
            for (let y_index = Math.max(y-1, 0); y_index <= Math.min(y+1, line_num-1); y_index++) {
                for (let x_index = Math.max(x-1, 0); x_index <= Math.min(x+1, line_num-1); x_index++) {
                    if (y_index === y && x_index === x) continue;
                    around_indexes.push(this.cordinatsToIndex(x_index, y_index, line_num));
                }
            }
        } else {
            if (y-1 >= 0) {
                around_indexes.push(this.cordinatsToIndex(x, y-1, line_num));
            }
            if (y+1 <= line_num-1) {
                around_indexes.push(this.cordinatsToIndex(x, y+1, line_num));
            }
            if (x-1 >= 0) {
                around_indexes.push(this.cordinatsToIndex(x-1, y, line_num));
            }
            if (x+1 <= line_num-1) {
                around_indexes.push(this.cordinatsToIndex(x+1, y, line_num));
            }
        }
        
        return around_indexes;
    }
    
    getZeroComponant(index, board) {
        let zerosIndexes = [];
        zerosIndexes.push(index);

        if (board[index] !== 0) {
            return zerosIndexes;
        }
        
        // bfs
        let visited = [];
        visited[index] = true;
        let waiting_list = [index];

        while (waiting_list.length > 0) {
            const current_index = waiting_list.pop();
            this.getAroundIndexes(current_index).forEach(neighbor_index => {
                if (!visited[neighbor_index]) {
                    visited[neighbor_index] = true;
                    zerosIndexes.push(neighbor_index);
                    if (board[neighbor_index] == 0) {
                        waiting_list.push(neighbor_index);
                    }
                }
            });
        }

        // const [x, y] = this.indexToCordinates(index);

        return zerosIndexes;
    }

    discoverIndex(index, board=this.board) {
        if (this.discoverBoard[index] !== 0) return;
        
        if (board[index] == -1) {
            this.game_over = true;
            console.log('game over');
            // this.printBoard(true);
            // return;
        }

        const discoverIndexes = this.getZeroComponant(index, board);
        console.log(`discoverIndexes= ${discoverIndexes}`);
        discoverIndexes.forEach(discover_index => {
            this.discoverBoard[discover_index] = 1; 
        });

        this.printBoard(true);
        this.screen.updateBoard(this.board, discoverIndexes);
    }

    printBoard(only_discoverd=true) {
        for (let line_num = 0; line_num < this.lines; line_num++) {
            let sub_array = this.board.slice(line_num*this.lines, line_num*this.lines + this.lines);
            if (only_discoverd) {
                sub_array = sub_array.map((x, index) => (this.discoverBoard[line_num*this.lines + index] === 0) ? '' : x);
            }
            console.log(sub_array);
        }
    }

}


class Game {
    constructor() {
        this.logic_board = new LogicBoard(10, 15);

        // this.start_time = Date.now();
    }

    updateTimer(timer_in_seconds){
        this.logic_board.screen.updateTimer(timer_in_seconds);
    }
}



game = new Game();


const start_time = Date.now();
setInterval(function() {updateTimer(Date.now());} , 1000)

function updateTimer(current_time){
    const past_time = current_time - start_time;
    const past_seconds = Math.floor(past_time/1000);
    game.updateTimer(past_seconds);
}

// d.discoverIndex(0);
// console.log(d.generateBoard(5, 7));