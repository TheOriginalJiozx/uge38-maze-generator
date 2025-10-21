function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true,
        };
        this.visited = false;
        this.visitOrder = 0;
    }

    draw(ctx, cellWidth) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();

        const px = this.x * cellWidth;
        const py = this.y * cellWidth;

        ctx.moveTo(px, py);

        if (this.walls.left) {
            ctx.lineTo(px, py + cellWidth);
        } else {
            ctx.moveTo(px, py + cellWidth);
        }

        if (this.walls.bottom) {
            ctx.lineTo(px + cellWidth, py + cellWidth);
        } else {
            ctx.moveTo(px + cellWidth, py + cellWidth);
        }

        if (this.walls.right) {
            ctx.lineTo(px + cellWidth, py);
        } else {
            ctx.moveTo(px + cellWidth, py);
        }

        if (this.walls.top) {
            ctx.lineTo(px, py);
        } else {
            ctx.moveTo(px, py);
        }

        ctx.stroke();
    }

    // find naboerne i grid vha. this.x og this.y
    unvisitedNeighbors(grid) {
        let neighbors = [];

        // Vi er ikke den nordligste celle
        if (this.y > 0) {
            const nord_x = this.x;
            const nord_y = this.y - 1;
            const nord_nabo = grid[nord_x][nord_y];
            if (!nord_nabo.visited) {
                neighbors.push(nord_nabo);
            }
        }

        // Vi er ikke cellen mest til venstre
        if (this.x > 0) {
            const venstre_x = this.x - 1;
            const venstre_y = this.y;
            const venstre_nabo = grid[venstre_x][venstre_y];
            if (!venstre_nabo.visited) {
                neighbors.push(venstre_nabo);
            }
        }

        // Vi er ikke den sydligste celle
        if (this.y < grid[0].length - 1) {
            const syd_x = this.x;
            const syd_y = this.y + 1;
            const syd_nabo = grid[syd_x][syd_y];
            if (!syd_nabo.visited) {
                neighbors.push(syd_nabo);
            }
        }

        // Vi er ikke cellen mest til højre
        if (this.x < grid.length - 1) {
            const højre_x = this.x + 1;
            const højre_y = this.y;
            const højre_nabo = grid[højre_x][højre_y];
            if (!højre_nabo.visited) {
                neighbors.push(højre_nabo);
            }
        }

        return neighbors;
    }

    punchWallDown(otherCell) {
        const dx = this.x - otherCell.x;
        const dy = this.y - otherCell.y;

        if (dx === 1) {
            // otherCell er til venstre for this
            this.walls.left = false;
            otherCell.walls.right = false;
        } else if (dx === -1) {
            // otherCell er til højre for this
            this.walls.right = false;
            otherCell.walls.left = false;
        } else if (dy === 1) {
            // otherCell er over this
            this.walls.top = false;
            otherCell.walls.bottom = false;
        } else if (dy === -1) {
            // otherCell er under this
            this.walls.bottom = false;
            otherCell.walls.top = false;
        }
    }
}

class Maze {
    constructor(cols, rows, canvas, randomness = 0.5) {
        this.grid = [];
        this.cols = cols;
        this.rows = rows;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.randomness = randomness;
        this.cellWidth = canvas.width / cols;
        this.initializeGrid();
    }

    initializeGrid() {
        for (let i = 0; i < this.rows; i += 1) {
            this.grid.push([]);
            for (let j = 0; j < this.cols; j += 1) {
                this.grid[i].push(new Cell(i, j));
            }
        }
    }

    draw() {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                this.grid[i][j].draw(this.ctx, this.cellWidth);
            }
        }
    }

    generate() {
        const start_x = randomInteger(0, this.cols);
        const start_y = randomInteger(0, this.rows);
        let currentCell = this.grid[start_x][start_y];
        let stack = [];

        currentCell.visited = true;

        while (currentCell != null) {
            let unvisitedNeighbors = currentCell.unvisitedNeighbors(this.grid);
            if (unvisitedNeighbors.length > 0) {
                const randomNeighborCell = unvisitedNeighbors[randomInteger(0, unvisitedNeighbors.length)];
                currentCell.punchWallDown(randomNeighborCell);
                stack.push(currentCell);
                currentCell = randomNeighborCell;
                currentCell.visited = true;
            } else {
                if (stack.length > 0) {
                    if (Math.random() < this.randomness) {
                    const randomIndex = randomInteger(0, stack.length);
                    currentCell = stack.splice(randomIndex, 1)[0];
                } else {
                    currentCell = stack.pop();
                }
            } else {
                currentCell = null;
            }
        }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');

    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    canvas.width = size;
    canvas.height = size;
    
    const maze = new Maze(20, 20, canvas, 0.5);

    maze.generate();

    const breakChance = 0.125; // 12.5% chance for at bryde en væg mellem naboceller

    for (let x = 0; x < maze.cols; x++) {
        for (let y = 0; y < maze.rows; y++) {
            const cell = maze.grid[x][y];
            if (Math.random() < breakChance) {
                const neighbors = [];
                if (x > 0) neighbors.push(maze.grid[x - 1][y]); // venstre
                if (x < maze.cols - 1) neighbors.push(maze.grid[x + 1][y]); // højre
                if (y > 0) neighbors.push(maze.grid[x][y - 1]); // over
                if (y < maze.rows - 1) neighbors.push(maze.grid[x][y + 1]); // under

                if (neighbors.length > 0) {
                    const randomNeighbor = neighbors[randomInteger(0, neighbors.length)];
                    cell.punchWallDown(randomNeighbor);
                }
            }
        }
    }

    maze.draw();

    console.log(maze);
})
