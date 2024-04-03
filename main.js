console.log('hello world')

class ScreenBoard {


    addSquares() {

    }
}

class LogicBoard {
    
    constructor (lines, bumbs_num) {
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
            this.getAroundIndexes(index, lines).forEach(around_index => {
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
    
    getAroundIndexes(index, line_num=this.lines) {
        let around_indexes = [];
        const [y, x] = this.indexToCordinates(index, line_num);

        for (let y_index = Math.max(y-1, 0); y_index <= Math.min(y+1, line_num-1); y_index++) {
            for (let x_index = Math.max(x-1, 0); x_index <= Math.min(x+1, line_num-1); x_index++) {
                if (y_index === y && x_index === x) continue;
                around_indexes.push(this.cordinatsToIndex(x_index, y_index, line_num));
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
        
        const [x, y] = this.indexToCordinates(index);
        

        return zerosIndexes;
    }

    discoverIndex(index, board=this.board) {
        if (this.discoverBoard[index] !== 0) return;

        const discoverIndexes = this.getZeroComponant(index, board);
        console.log(discoverIndexes);
        discoverIndexes.forEach(discover_index => {
            this.discoverBoard[discover_index] = 1; 
        });

        this.printBoard(true);
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

d = new LogicBoard(8,15);
d.discoverIndex(0);
// console.log(d.generateBoard(5, 7));