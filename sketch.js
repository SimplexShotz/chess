
var board = {
    width: 8,
    height: 8
};

var check = [false, false];
var turnOrder = ["white", "black"];
var turn = 0;

var grid = [];
for (var x = 0; x < board.width; x++) {
    grid.push([]);
    for (var y = 0; y < board.height; y++) {
        grid[x].push(-1);
    }
}

var sinCount = 0;
var turnDelay = 0;
var selectedPiece = -1;

var botLevel = 2;
var botTimeout = 5000;
var botIgnore = 0;
var botTeams = [false, true];

var botStartTime = 0;
var validMoves = [];
var pieces = [];
var state = "playing"; // playing/setup
if (state === "playing") { // Auto setup:
    state = "setup";
    for (var x = 0; x < board.width; x++) {
        // Pawns:
        pieces.push({
            type: "pawn",
            col: "white",
            x: x,
            y: 6,
            firstMove: true,
            display: true
        });
        grid[x][6] = pieces.length - 1;
        pieces.push({
            type: "pawn",
            col: "black",
            x: x,
            y: 1,
            firstMove: true,
            display: true
        });
        grid[x][1] = pieces.length - 1;
        // Rooks:
        if (x % 8 === 0 || x % 8 === 7) {
            pieces.push({
                type: "rook",
                col: "white",
                x: x,
                y: 7,
                firstMove: true,
                display: true
            });
            grid[x][7] = pieces.length - 1;
            pieces.push({
                type: "rook",
                col: "black",
                x: x,
                y: 0,
                firstMove: true,
                display: true
            });
            grid[x][0] = pieces.length - 1;
        }
        // Knights:
        if (x % 8 === 1 || x % 8 === 6) {
            pieces.push({
                type: "knight",
                col: "white",
                x: x,
                y: 7,
                firstMove: true,
                display: true
            });
            grid[x][7] = pieces.length - 1;
            pieces.push({
                type: "knight",
                col: "black",
                x: x,
                y: 0,
                firstMove: true,
                display: true
            });
            grid[x][0] = pieces.length - 1;
        }
        // Bishops:
        if (x % 8 === 2 || x % 8 === 5) {
            pieces.push({
                type: "bishop",
                col: "white",
                x: x,
                y: 7,
                firstMove: true,
                display: true
            });
            grid[x][7] = pieces.length - 1;
            pieces.push({
                type: "bishop",
                col: "black",
                x: x,
                y: 0,
                firstMove: true,
                display: true
            });
            grid[x][0] = pieces.length - 1;
        }
        // Queens:
        if (x % 8 === 3) {
            pieces.push({
                type: "queen",
                col: "white",
                x: x,
                y: 7,
                firstMove: true,
                display: true
            });
            grid[x][7] = pieces.length - 1;
            pieces.push({
                type: "queen",
                col: "black",
                x: x,
                y: 0,
                firstMove: true,
                display: true
            });
            grid[x][0] = pieces.length - 1;
        }
        // Kings:
        if (x % 8 === 4) {
            pieces.push({
                type: "king",
                col: "white",
                x: x,
                y: 7,
                firstMove: true,
                display: true
            });
            grid[x][7] = pieces.length - 1;
            pieces.push({
                type: "king",
                col: "black",
                x: x,
                y: 0,
                firstMove: true,
                display: true
            });
            grid[x][0] = pieces.length - 1;
        }
    }
}

var pieceList = {
    king: {
        char: "♚",
        moves: [{
            dir: "+",
            dist: [1]
        }, {
            dir: "x",
            dist: [1]
        }],
        attacksWhereMoves: true
    },
    queen: {
        char: "♛",
        moves: [{
            dir: "+",
            dist: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        }, {
            dir: "x",
            dist: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        }],
        attacksWhereMoves: true
    },
    rook: {
        char: "♜",
        moves: [{
            dir: "+",
            dist: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        }],
        attacksWhereMoves: true
    },
    bishop: {
        char: "♝",
        moves: [{
            dir: "x",
            dist: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        }],
        attacksWhereMoves: true
    },
    knight: {
        char: "♞",
        moves: [{
            dir: "xy",
            dist: [{ x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: -1, y: -2 },
                   { x: 2, y: 1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: -2, y: -1 }]
        }],
        attacksWhereMoves: true
    },
    pawn: {
        char: "♟",
        firstMoves: [{
            dir: "v",
            dist: [1, 2]
        }],
        moves: [{
            dir: "xy",
            dist: [{ x: 0, y: 1 }]
        }],
        attacksWhereMoves: false,
        attacks: [{
            dir: "xy",
            dist: [{ x: 1, y: 1 }, { x: -1, y: 1 }]
        }]
    }
};

var s; // grid tile size
var xo, yo;
function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  s = min((window.innerWidth - 100) / board.width, (window.innerHeight - 100) / board.height);

  document.body.style.overflow = "hidden";
  if (state !== "playing") {
    createDiv("<input style='position: absolute; right: 10px; bottom: 270px; z-index: 1;' id='timeout' placeholder='Bot Timeout (ms) (Advanced)'><input style='position: absolute; right: 10px; bottom: 250px; z-index: 1;' id='ignore' placeholder='Bot Ignore (Disabled) (Advanced)'><button style='position: absolute; right: 10px; bottom: 230px; z-index: 1;' onclick='if (document.getElementById(\"timeout\").value >= 0) { botTimeout = Number(document.getElementById(\"timeout\").value); document.getElementById(\"timeout\").value = \"\"; } if (document.getElementById(\"ignore\").value !== \"\" && Number(document.getElementById(\"ignore\").value).toString() !== \"NaN\") { botIgnore = Number(document.getElementById(\"ignore\").value); document.getElementById(\"ignore\").value = \"\"; } this.innerText = \"Update Advanced (\" + botTimeout + \"ms / <= \" + botIgnore + \")\"; '>Update Advanced (5000ms / <= 0)</button><input style='position: absolute; right: 10px; bottom: 190px; z-index: 1;' id='white' placeholder='Bot Plays White (1 or 0)'><input style='position: absolute; right: 10px; bottom: 170px; z-index: 1;' id='black' placeholder='Bot Plays Black (1 or 0)'><button style='position: absolute; right: 10px; bottom: 150px; z-index: 1;' onclick='if (document.getElementById(\"white\").value === \"1\") { botTeams[0] = true; } else if (document.getElementById(\"white\").value === \"0\") { botTeams[0] = false; } if (document.getElementById(\"black\").value === \"1\") { botTeams[1] = true; } else if (document.getElementById(\"black\").value === \"0\") { botTeams[1] = false; } document.getElementById(\"white\").value = \"\"; document.getElementById(\"black\").value = \"\"; this.innerText = \"Update Bot Teams (W: \" + (botTeams[0] ? \"1\" : \"0\") + \" / B: \" + (botTeams[1] ? \"1\" : \"0\") + \")\"'>Update Bot Teams (W: 0 / B: 1)</button><input style='position: absolute; right: 10px; bottom: 110px; z-index: 1;' id='level' placeholder='Bot Level'><button style='position: absolute; right: 10px; bottom: 90px; z-index: 1;' onclick='if (document.getElementById(\"level\").value > 0) { botLevel = Number(document.getElementById(\"level\").value); this.innerText = \"Update Bot Level (\" + botLevel + \")\"; document.getElementById(\"level\").value = \"\"; }'>Update Bot Level (2)</button><input style='position: absolute; right: 10px; bottom: 50px; z-index: 1;' id='width' placeholder='New Board Width'><input style='position: absolute; right: 10px; bottom: 30px; z-index: 1;' id='height' placeholder='New Board Height'><button style='position: absolute; right: 10px; bottom: 10px; z-index: 1;' onclick='if (document.getElementById(\"width\").value > 0 || document.getElementById(\"height\").value > 0) { setBoardSize(document.getElementById(\"width\").value || board.width, document.getElementById(\"height\").value || board.height); document.getElementById(\"width\").value = \"\"; document.getElementById(\"height\").value = \"\"; s = min((window.innerWidth - 100) / board.width, (window.innerHeight - 100) / board.height); }'>Update Board Size</button>");
  }
}

function drawGrid() {
    noStroke();
    for (var x = 0; x < board.width; x++) {
        for (var y = 0; y < board.height; y++) {
            fill(180, 135, 100);
            if ((x + y) % 2 === 0) {
                fill(240, 220, 180);
            }
            rect(xo + x * s, yo + y * s, s, s);
        }
    }
}

function isInCheck(g, col, pc) { // g = grid array pc = pieces array
    var kings = [];
    // Find king(s):
    for (var i = 0; i < pc.length; i++) {
        if (pc[i].type === "king" && pc[i].col === col) {
            kings.push({
                x: pc[i].x,
                y: pc[i].y
            });
        }
    }
    // Determine if in check:
    // TODO: attacksWhereMoves !important
    l:
    for (var i = 0; i < pc.length; i++) {
        if (pc[i].display && pc[i].col !== col) {
            var moves = getValidMoves(g, pc, pc[i].type, pc[i].x, pc[i].y, pc[i].firstMove, false); // Get all valid moves for this piece
            for (var j = 0; j < moves.length; j++) { // Check if any of them are attacking the oppenent king
                for (var k = 0; k < kings.length; k++) { // Check if any king(s) are in check (usually there will only be 1 tho lmao)
                    if (moves[j].x === kings[k].x && moves[j].y === kings[k].y) {
                        return true; // is in check
                    }
                }
            }
        }
    }
    return false; // is not in check
}

function getValidMoves(g, pc, type, x, y, firstMove, checkMatters) {

    // console.log(pc);
    // console.log(g);
    // console.log(x + " " + y);
    // console.log(pc[g[x][y]]);

    var moves = [];
    // TODO: attack, firstmove

    var Ilen = (firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves.length : pieceList[type].moves.length;
    for (var i = 0; i < Ilen; i++) {
        switch((firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves[i].dir : pieceList[type].moves[i].dir) {
            case "xy":
                var Jlen = (firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves[i].dist.length : pieceList[type].moves[i].dist.length;
                for (var j = 0; j < Jlen; j++) {
                    var d = {
                        x: ((firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves[i].dist[j].x : pieceList[type].moves[i].dist[j].x) * (pc[g[x][y]].col === "white" ? -1 : 1),
                        y: ((firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves[i].dist[j].y : pieceList[type].moves[i].dist[j].y) * (pc[g[x][y]].col === "white" ? -1 : 1)
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                }
            break;
            case "+":
                // UP:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: 0,
                        y: -pieceList[type].moves[i].dist[j]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
                // DOWN:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: 0,
                        y: pieceList[type].moves[i].dist[j]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
                // LEFT:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: -pieceList[type].moves[i].dist[j],
                        y: 0
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
                // RIGHT:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: pieceList[type].moves[i].dist[j],
                        y: 0
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
            break;
            case "x":
                // UP & LEFT:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: -pieceList[type].moves[i].dist[j],
                        y: -pieceList[type].moves[i].dist[j]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
                // UP & RIGHT:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: pieceList[type].moves[i].dist[j],
                        y: -pieceList[type].moves[i].dist[j]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
                // DOWN & LEFT:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: -pieceList[type].moves[i].dist[j],
                        y: pieceList[type].moves[i].dist[j]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
                // DOWN & RIGHT:
                for (var j = 0; j < pieceList[type].moves[i].dist.length; j++) {
                    var d = {
                        x: pieceList[type].moves[i].dist[j],
                        y: pieceList[type].moves[i].dist[j]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
            break;
            case "v":
                // DOWN:
                var Jlen = (firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves[i].dist.length : pieceList[type].moves[i].dist.length;
                for (var j = 0; j < Jlen; j++) {
                    var d = {
                        x: 0,
                        y: ((firstMove && pieceList[type].firstMoves) ? pieceList[type].firstMoves[i].dist[j] : pieceList[type].moves[i].dist[j]) * (pc[g[x][y]].col === "white" ? -1 : 1)
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] === -1 || pieceList[type].attacksWhereMoves && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1)) {
                        break;
                    }
                }
            break;
        }
    }
    // TODO: en passant
    if (!pieceList[type].attacksWhereMoves) {
        for (var i = 0; i < pieceList[type].attacks.length; i++) {
            switch(pieceList[type].attacks[i].dir) {
                case "xy":
                    for (var j = 0; j < pieceList[type].attacks[i].dist.length; j++) {
                        var d = {
                            x: pieceList[type].attacks[i].dist[j].x * (pc[g[x][y]].col === "white" ? -1 : 1),
                            y: pieceList[type].attacks[i].dist[j].y * (pc[g[x][y]].col === "white" ? -1 : 1)
                        };
                        if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                            moves.push({
                                x: x + d.x,
                                y: y + d.y
                            });
                        }
                    }
                break;
                case "+":
                    // UP:
                    var d = {
                        x: 0,
                        y: -pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    // DOWN:
                    var d = {
                        x: 0,
                        y: pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    // LEFT:
                    var d = {
                        x: -pieceList[type].attacks[i].dist[0],
                        y: 0
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    // RIGHT:
                    var d = {
                        x: pieceList[type].attacks[i].dist[0],
                        y: 0
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                break;
                case "x":
                    // UP & LEFT:
                    var d = {
                        x: -pieceList[type].attacks[i].dist[0],
                        y: -pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    // UP & RIGHT:
                    var d = {
                        x: pieceList[type].attacks[i].dist[0],
                        y: -pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    // DOWN & LEFT:
                    var d = {
                        x: -pieceList[type].attacks[i].dist[0],
                        y: pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                    // DOWN & RIGHT:
                    var d = {
                        x: pieceList[type].attacks[i].dist[0],
                        y: pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                break;
                case "v":
                    // DOWN:
                    var d = {
                        x: 0,
                        y: pieceList[type].attacks[i].dist[0]
                    };
                    if ((x + d.x >= 0 && x + d.x <= g.length - 1 && y + d.y >= 0 && y + d.y <= g[0].length - 1) && (g[x + d.x][y + d.y] !== -1 && pc[g[x + d.x][y + d.y]].col !== pc[g[x][y]].col)) {
                        moves.push({
                            x: x + d.x,
                            y: y + d.y
                        });
                    }
                break;
            }
        }
    }
    if (board.width === 8 && type === "king" && firstMove) {
        var castleLeft = g[0][y] !== -1 && pc[g[0][y]].type === "rook" && pc[g[0][y]].col === pc[g[x][y]].col && pc[g[0][y]].firstMove,
            castleRight = g[g.length - 1][y] !== -1 && pc[g[g.length - 1][y]].type === "rook" && pc[g[g.length - 1][y]].col === pc[g[x][y]].col && pc[g[g.length - 1][y]].firstMove;
        if (castleLeft) {
            for (var i = x - 1; i > 0; i--) {
                if (g[i][y] !== -1) {
                    castleLeft = false;
                    break;
                }
            }
        }
        if (castleRight) {
            for (var i = x + 1; i < g.length - 1; i++) {
                if (g[i][y] !== -1) {
                    castleRight = false;
                    break;
                }
            }
        }
        if (castleLeft) {
            moves.push({
                x: x - 2,
                y: y,
                castleLeft: true
            });
        }
        if (castleRight) {
            moves.push({
                x: x + 2,
                y: y,
                castleRight: true
            });
        }
    }

    // TODO: castling check stuff
    if (checkMatters) {
        for (var i = 0; i < moves.length; i++) {
            var newPieces = JSON.parse(JSON.stringify(pc));
            var newGrid = JSON.parse(JSON.stringify(g));

            movePiece(newGrid, newPieces, g[x][y], moves[i]); // Move piece

            if (isInCheck(newGrid, pc[g[x][y]].col, newPieces)) { // Ensure move does not put them into check
                moves.splice(i, 1); // If it does, it is not a valid move
                i--; // Prevents skipping
            }
        }
    }
    // TODO: pinning

    return moves;
}

function canMove(g, col, pc) {
    for (var i = 0; i < pc.length; i++) {
        if (pc[i].display && pc[i].col === col) {
            var moves = getValidMoves(g, pc, pc[i].type, pc[i].x, pc[i].y, pc[i].firstMove, true); // Get all valid moves for this piece
            if (moves.length !== 0) { // Has at least one move available
                return true;
            }
        }
    }
    return false; // no moves available
}

function movePiece(g, pc, i, move) { // g = grid array, pc = pieces array

    var score = 0;

    // TAKE PIECE:
    if (g[move.x][move.y] !== -1) {
        switch(pc[g[move.x][move.y]].type) {
            case "queen":
                score += 5000;
            break;
            case "rook":
                score += 600;
            break;
            case "bishop":
            case "knight":
                score += 500;
            break;
            case "pawn":
                score += 40 / (pc[g[move.x][move.y]].col === "white" ? (pc[g[move.x][move.y]].y + 1) : (g[0].length - pc[g[move.x][move.y]].y));
            break;
        }
        pc[g[move.x][move.y]] = { display: false };
    }

    g[pc[i].x][pc[i].y] = -1;
    g[move.x][move.y] = i;

    pc[i].x = move.x;
    pc[i].y = move.y;

    pc[i].firstMove = false;

    // CASTLING:
    if (move.castleLeft) {
        g[3][pc[i].y] = g[0][pc[i].y];
        g[0][pc[i].y] = -1;

        pc[g[3][pc[i].y]].x = 3;

        pc[g[3][pc[i].y]].firstMove = false;

        score += 50;
    }
    if (move.castleRight) {
        g[g.length - 3][pc[i].y] = g[g.length - 1][pc[i].y];
        g[g.length - 1][pc[i].y] = -1;

        pc[g[g.length - 3][pc[i].y]].x = g.length - 3;

        pc[g[g.length - 3][pc[i].y]].firstMove = false;

        score += 50;
    }

    // PROMOTE TO QUEEN:
    if (pc[i].type === "pawn" && (pc[i].col === "white" && pc[i].y === 0 || pc[i].col === "black" && pc[i].y === g[0].length - 1)) {
        pc[i].type = "queen";

        score += 200;
    }

    // var moves = getValidMoves(g, pc, pc[i].type, pc[i].x, pc[i].y, pc[i].firstMove, false);
    // score += moves.length * 0.4;

    return score;
}

function drawPiece(p, i) {
    strokeWeight(s / 10);
    switch(p.col) {
        case "white":
            stroke(selectedPiece === i ? color((cos(sinCount / 20) + 1) * 50 + 50, (cos(sinCount / 20) + 1) * 50 + 50, 0) : 0);
            fill(255);
        break;
        case "black":
            stroke(selectedPiece === i ? color((cos(sinCount / 20) + 1) * 50 + 50, (cos(sinCount / 20) + 1) * 50 + 50, 0) : 255);
            fill(0);
        break;
    }
    textSize(s * 0.8);
    textAlign(CENTER, CENTER);
    text(pieceList[p.type].char, xo + (p.x + 0.5) * s, yo + (p.y + 0.5) * s);
    if (state === "playing" && p.col === turnOrder[turn] && mouseX >= xo + p.x * s && mouseY >= yo + p.y * s && mouseX <= xo + (p.x + 1) * s && mouseY <= yo + (p.y + 1) * s) {
        cursor(HAND);
        if (mouseIsPressed) {
            selectedPiece = i; // SELECT PIECE
            sinCount = 0;

            validMoves = getValidMoves(grid, pieces, p.type, p.x, p.y, p.firstMove, true); // update valid moves

            mouseIsPressed = false;
        }
    }
}

function drawPieces() {
    // Draw pieces:
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].display) {
            drawPiece(pieces[i], i);
        }
    }
    // Draw moves:
    if (selectedPiece !== -1) {
        var p = pieces[selectedPiece];
        var i = selectedPiece;
        noStroke();
        fill(50, 200, 255)
        for (var j = 0; j < validMoves.length; j++) {
            ellipse(xo + (validMoves[j].x + 0.5) * s, yo + (validMoves[j].y + 0.5) * s, s / 4, s / 4);
            if (mouseX >= xo + validMoves[j].x * s && mouseY >= yo + validMoves[j].y * s && mouseX <= xo + (validMoves[j].x + 1) * s && mouseY <= yo + (validMoves[j].y + 1) * s) {
                cursor(HAND);
                if (mouseIsPressed) { // MOVE PIECE:
                    movePiece(grid, pieces, i, validMoves[j]);
                    turnDelay = 0;

                    selectedPiece = -1;
                    mouseIsPressed = false;

                    turn++;
                    if (turn >= turnOrder.length) {
                        turn = 0;
                    }

                    if (!canMove(grid, turnOrder[turn], pieces)) { // If no moves
                        if (isInCheck(grid, turnOrder[turn], pieces)) { // If in check
                            state = "checkmate"; // CHECKMATE
                        } else { // If not in check
                            state = "stalemate"; // STALEMATE
                        }
                    }
                    if (isStalemate(pieces)) {
                        state = "stalemate"; // STALEMATE
                    }
                }
            }
        }
    }
}

var frAverageLength = 5;
var lastFr = [];

function sum(array) {
    var s = 0;
    for (var i = 0; i < array.length; i++) {
        s += array[i];
    }
    return s;
}

function displaySetupMenu() {
    var bs = 90; // button size

    var plLen = 0;
    for (var i in pieceList) {
        plLen++;
    }

    // COLOR BUTTON:
    noStroke();
    fill(255, 50);
    if (mouseX >= window.innerWidth / 2 - bs * plLen / 2 - bs && mouseX <= window.innerWidth / 2 - bs * plLen / 2 && mouseY >= window.innerHeight - bs && mouseY <= window.innerHeight) {
        cursor(HAND);
        fill(255, 100);
        if (mouseIsPressed) {
            turn++;
            if (turn >= turnOrder.length) {
                turn = 0;
            }

            mouseIsPressed = false;
        }
    }
    rect(window.innerWidth / 2 - bs * plLen / 2 - bs, window.innerHeight - bs, bs, bs);
    strokeWeight(bs / 20);
    switch(turnOrder[turn]) {
        case "white":
            stroke(0);
            fill(255);
        break;
        case "black":
            stroke(255);
            fill(0);
        break;
    }
    ellipse(window.innerWidth / 2 - bs * plLen / 2 - (bs * 0.5), window.innerHeight - bs * 0.5, bs / 4, bs / 4);

    // PIECE BUTTONS:
    var i = 0;
    for (var p in pieceList) {
        noStroke();
        fill(255, 50);
        if (selectedPiece === p) {
            fill(255, 100);
        }
        if (mouseX >= window.innerWidth / 2 - bs * plLen / 2 + i * bs && mouseX <= window.innerWidth / 2 - bs * plLen / 2 + (i + 1) * bs && mouseY >= window.innerHeight - bs && mouseY <= window.innerHeight) {
            cursor(HAND);
            fill(255, 100);
            if (mouseIsPressed) {
                if (selectedPiece === p) {
                    selectedPiece = -1;
                } else {
                    selectedPiece = p;
                }

                mouseIsPressed = false;
            }
        }
        rect(window.innerWidth / 2 - bs * plLen / 2 + i * bs, window.innerHeight - bs, bs, bs);
        strokeWeight(bs / 10);
        switch(turnOrder[turn]) {
            case "white":
                stroke(0);
                fill(255);
            break;
            case "black":
                stroke(255);
                fill(0);
            break;
        }
        textSize(bs * 0.8);
        textAlign(CENTER, CENTER);
        text(pieceList[p].char, window.innerWidth / 2 - bs * plLen / 2 + (i + 0.5) * bs, window.innerHeight - bs * 0.5);
        i++;
    }

    // PLAY BUTTON:
    noStroke();
    fill(255, 50);
    if (mouseX >= window.innerWidth / 2 + bs * plLen / 2 && mouseX <= window.innerWidth / 2 + bs * plLen / 2 + bs && mouseY >= window.innerHeight - bs && mouseY <= window.innerHeight) {
        cursor(HAND);
        fill(255, 100);
        if (mouseIsPressed) {

            selectedPiece = -1;
            turn = 0;

            // Check that everyone has a king:
            var kings = {};
            for (var i = 0; i < turnOrder.length; i++) {
                kings[turnOrder[i]] = false;
            }
            for (var i = 0; i < pieces.length; i++) {
                if (pieces[i].type === "king") {
                    kings[pieces[i].col] = true;
                }
            }

            var allKingsPlaced = true;
            for (var i in kings) {
                if (!kings[i]) {
                    allKingsPlaced = false;
                    break;
                }
            }

            if (allKingsPlaced) {
                removeElements();
                state = "playing";
            } else {
                alert("Each team must have at least one king.");
            }

            mouseIsPressed = false;
        }
    }
    rect(window.innerWidth / 2 + bs * plLen / 2, window.innerHeight - bs, bs, bs);
    strokeWeight(bs / 20);
    switch(turnOrder[turn]) {
        case "white":
            stroke(0);
            fill(255);
        break;
        case "black":
            stroke(255);
            fill(0);
        break;
    }
    triangle(window.innerWidth / 2 + bs * plLen / 2 + (bs * 0.35), window.innerHeight - (bs * 0.7), window.innerWidth / 2 + bs * plLen / 2 + (bs * 0.65), window.innerHeight - (bs * 0.5), window.innerWidth / 2 + bs * plLen / 2 + (bs * 0.35), window.innerHeight - (bs * 0.3));

    // PLACE PIECES:
    if (selectedPiece !== -1 && mouseX >= xo && mouseX <= window.innerWidth - xo && mouseY >= yo && mouseY <= window.innerHeight - yo) {
        cursor(HAND);
        if (mouseIsPressed) {
            var x = floor((mouseX - xo) / s);
            var y = floor((mouseY - yo) / s);

            if (grid[x][y] === -1) {
                pieces.push({
                    type: selectedPiece,
                    col: turnOrder[turn],
                    x: x,
                    y: y,
                    firstMove: true,
                    display: true
                });
                grid[x][y] = pieces.length - 1;
            } else {
                var pieceIndex = -1;
                for (var i = 0; i < pieces.length; i++) {
                    if (pieces[i].x === x && pieces[i].y === y) {
                        pieceIndex = i;
                        pieces.splice(i, 1);
                    }
                    grid[x][y] = -1;
                }
                if (pieceIndex !== -1) {
                    for (var gx = 0; gx < grid.length; gx++) {
                        for (var gy = 0; gy < grid[gx].length; gy++) {
                            if (grid[gx][gy] >= pieceIndex) {
                                grid[gx][gy]--;
                            }
                        }
                    }
                }
            }

            mouseIsPressed = false;
        }
    }
}

function setBoardSize(w, h) {
    board = {
        width: w,
        height: h
    };
    pieces = [];
    grid = [];
    for (var x = 0; x < board.width; x++) {
        grid.push([]);
        for (var y = 0; y < board.height; y++) {
            grid[x].push(-1);
        }
    }
}

function partition(arr, lo, hi, by) {
    var pivot = (by ? arr[hi][by] : arr[hi]);
    var i = lo;
    for (var j = lo; j < hi; j++) {
        if ((by ? arr[j][by] : arr[j]) > pivot) {
            if (i !== j) {
                var t = arr[j];
                arr[j] = arr[i];
                arr[i] = t;
            }
            i++;
        }
    }
    var t = arr[hi];
    arr[hi] = arr[i];
    arr[i] = t;
    return i;
}
function quicksort(arr, lo, hi, by) {
    if (lo < hi) {
        var p = partition(arr, lo, hi, by);
        quicksort(arr, lo, p - 1, by);
        quicksort(arr, p + 1, hi, by);
    }
}

function getMoveScore(g, t, pc, originalT, finalDepth, currentDepth, pieceIndex, move) {
    var newPc = JSON.parse(JSON.stringify(pc));
    var newG = JSON.parse(JSON.stringify(g));
    var newT = JSON.parse(JSON.stringify(t));

    var score = movePiece(newG, newPc, pieceIndex, move);

    // ADVANCE GAME:
    newT++;
    if (newT >= turnOrder.length) {
        newT = 0;
    }
    if (!canMove(newG, turnOrder[newT], newPc)) { // If no moves
        if (isInCheck(newG, turnOrder[newT], newPc)) { // If in check
            return score + 10000; // CHECKMATE
        } else { // If not in check
            return score - 10000; // STALEMATE
        }
    }
    if (isStalemate(pieces)) {
        return score - 10000; // STALEMATE
    }
    if (isInCheck(newG, turnOrder[newT], newPc)) {
        score += 100;
    }

    var timeDiff = new Date().getTime() - botStartTime;
    if ((timeDiff < botTimeout || botTimeout === 0) && currentDepth < finalDepth) {
        var newScore = findBestMove(newG, newT, newPc, finalDepth - currentDepth).score;
        var depthMultiplier = 0;
        score -= newScore * (1 / (currentDepth * depthMultiplier + 1));
        // for (var i = 0; i < newPc.length; i++) {
        //     if (newPc[i].display && newPc[i].col === turnOrder[newT]) {
        //         var moves = getValidMoves(newG, newPc, newPc[i].type, newPc[i].x, newPc[i].y, newPc[i].firstMove, true);
        //         for (var j = 0; j < moves.length; j++) {
        //             var newScore = getMoveScore(newG, newT, newPc, originalT, finalDepth, currentDepth + 1, i, moves[j]);
        //             var depthMultiplier = 0;
        //             score -= newScore * (1 / (currentDepth * depthMultiplier + 1));
        //         }
        //     }
        // }
    }

    return score;
}

function findBestMove(g, t, pc, depth) {
    var moveScores = [];
    l:
    for (var i = 0; i < pc.length; i++) {
        if (pc[i].display && pc[i].col === turnOrder[t]) {
            var moves = getValidMoves(g, pc, pc[i].type, pc[i].x, pc[i].y, pc[i].firstMove, true);
            for (var j = 0; j < moves.length; j++) {
                moveScores.push({
                  score: getMoveScore(g, t, pc, t, depth, 1, i, moves[j]),
                  pieceIndex: i,
                  move: moves[j]
                });

                var timeDiff = new Date().getTime() - botStartTime;
                if (timeDiff >= botTimeout && botTimeout !== 0) {
                    break l;
                }
            }
        }
    }

    quicksort(moveScores, 0, moveScores.length - 1, "score");

    for (var i = 0; i < moveScores.length; i++) { // Pick random move if all same:
        if (moveScores[i].score !== moveScores[0].score) {
            moveScores = moveScores.splice(0, i);
            break;
        }
    }

    return moveScores[Math.floor(Math.random() * moveScores.length)];
}

// function findBestMove(g, t, pc, originalT, finalDepth, currentDepth) {
//     if (!canMove(g, turnOrder[t], pc)) {
//         if (t === originalT) {
//             return 0;
//         } else {
//             return 1;
//         }
//     }
//     if (!currentDepth) {
//         currentDepth = 1;
//     }
//     var scores = [];
//     l:
//     for (var i = 0; i < pc.length; i++) {
//         if (pc[i].display && pc[i].col === turnOrder[t]) {
//             var moves = getValidMoves(g, pc, pc[i].type, pc[i].x, pc[i].y, pc[i].firstMove, true); // Get all valid moves for this piece
//             for (var j = 0; j < moves.length; j++) {
//                 var newPc = JSON.parse(JSON.stringify(pc));
//                 var newG = JSON.parse(JSON.stringify(g));
//                 var newT = JSON.parse(JSON.stringify(t));
//
//                 var score = movePiece(newG, newPc, i, moves[j]);
//
//                 newT++;
//                 if (newT >= turnOrder.length) {
//                     newT = 0;
//                 }
//
//                 if (!canMove(newG, turnOrder[newT], newPc)) { // If no moves
//                     if (isInCheck(newG, turnOrder[newT], newPc)) { // If in check
//                         score += 10000; // CHECKMATE
//                     } else { // If not in check
//                         if (currentDepth === 1) {
//                             score -= 10000; // STALEMATE
//                         }
//                     }
//                 } else if (isStalemate(newPc)) {
//                     if (currentDepth === 1) {
//                         score -= 10000; // STALEMATE
//                     }
//                 } else {
//                     if (isInCheck(newG, turnOrder[newT], newPc)) {
//                         score += 10;
//                     }
//                 }
//
//                 var timeDiff = new Date().getTime() - botStartTime;
//                 if (timeDiff < botTimeout && score > botIgnore && currentDepth < finalDepth) { // TODO:  minitor "score > 0"
//                     var s = findBestMove(newG, newT, newPc, originalT, finalDepth, currentDepth + 1);
//                     // console.log(s);
//                     // console.log(newT === originalT);
//                     var newScore;
//                     if (s === 0) {
//                         newScore = 10000; // got CHECKMATEd / STALEMATE
//                         // console.log("-");
//                         // console.log(newT === originalT);
//                     } else if (s === 1) {
//                         newScore = -10000; // CHECKMATEd
//                         // console.log("+");
//                         // console.log(newT === originalT);
//                     } else {
//                         newScore = s.score;// / (newT === originalT ? (currentDepth / 2) : 0.9);
//                     }
//
//                     if (newT === originalT) {
//                         score += newScore;
//                     } else {
//                         score -= newScore;
//                     }
//                     // console.log(score);
//                 }
//
//                 scores.push({
//                     score: score,
//                     pieceIndex: i,
//                     move: JSON.parse(JSON.stringify(moves[j])),
//                     ns: newScore,
//                     cd: currentDepth
//                 });
//                 if (timeDiff >= botTimeout) {
//                     break l;
//                 }
//             }
//         }
//     }
//
//     quicksort(scores, 0, scores.length - 1, "score"); // Sort scores
//
//     // console.log("OO");
//     // console.log(scores[0]);
//     for (var i = 0; i < scores.length; i++) { // Pick random move if all same:
//         if (scores[i].score !== scores[0].score) {
//             scores = scores.splice(0, i);
//             break;
//         }
//     }
//
//     // console.log(scores);
//     // console.log(scores[Math.floor(Math.random() * scores.length)].score);
//
//     return scores[Math.floor(Math.random() * scores.length)];
// }

function isStalemate(pc) {
    var stalemate = true;
    for (var i = 0; i < pc.length; i++) {
        if (pc[i].display && pc[i].type !== "king") {
            stalemate = false;
        }
    }
    return stalemate;
}

function draw() {
    try {
    cursor();
    xo = window.innerWidth / 2 - s * (board.width / 2);
    yo = window.innerHeight / 2 - s * (board.height / 2) - (state === "setup" ? 45 : 0);
    background(75);
    drawGrid();
    drawPieces();
    sinCount++;

    if (state === "setup") {
        displaySetupMenu();
    } else if (state === "playing" && botTeams[turn] && turnDelay > 5 /*frameCount % (60 * 1) === 0*/) {
        botStartTime = new Date().getTime();
        // var best = findBestMove(grid, turn, pieces, turn, botLevel);
        var best = findBestMove(grid, turn, pieces, botLevel);
        console.log(best);
        movePiece(grid, pieces, best.pieceIndex, best.move);

        // ADVANCE GAME:
        turn++;
        if (turn >= turnOrder.length) {
            turn = 0;
        }
        if (!canMove(grid, turnOrder[turn], pieces)) { // If no moves
            if (isInCheck(grid, turnOrder[turn], pieces)) { // If in check
                state = "checkmate"; // CHECKMATE
            } else { // If not in check
                state = "stalemate"; // STALEMATE
            }
        }
        if (isStalemate(pieces)) {
            state = "stalemate"; // STALEMATE
        }
    }

    textAlign(LEFT, TOP);
    textSize(20);
    noStroke();
    fill(255);
    lastFr.push(frameRate());
    if (lastFr.length > frAverageLength) {
        lastFr.shift();
    }
    text(round(sum(lastFr) / lastFr.length), 20, 20);

    if (state === "checkmate") {
        textAlign(CENTER, CENTER);
        textSize(100);
        strokeWeight(20);
        stroke(0);
        fill(255);
        text("Checkmate! " + turnOrder[Number(!turn)][0].toUpperCase() + turnOrder[Number(!turn)].substring(1, 5) + " Wins!", window.innerWidth / 2, window.innerHeight / 2);
    }
    if (state === "playing" && pieces.length === 0) { state = "stalemate"; }
    if (state === "stalemate") {
        textAlign(CENTER, CENTER);
        textSize(100);
        strokeWeight(20);
        stroke(0);
        fill(255);
        text("Stalemate!", window.innerWidth / 2, window.innerHeight / 2);
    }
    turnDelay++;
    } catch(e) {
        console.error(e);
    }
}
