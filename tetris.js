const GAME_FPS = 1000 / 60;
const BLOCK_SIZE = 25;
const MINO_SIZE = 4;
const FIELD_ROW = 20;
const FIELD_COL = 10;
const SCREEN_HEIGHT = BLOCK_SIZE * FIELD_ROW;
const SCREEN_WIDTH = BLOCK_SIZE * FIELD_COL;
const FREE_FALL_SPEED = 500;
const SPAWN_X = Math.floor(FIELD_COL / 2) - Math.floor(MINO_SIZE / 2);
const SPAWN_Y = 0;

const KEY = {
	left: 0,
	right: 1,
	up: 2,
	down: 3,
	space: 4,
	MAX: 5
};
const TYPE = {
	NON: 0,
	J: 1,
	L: 2,
	S: 3,
	Z: 4,
	O: 5,
	T: 6,
	I: 7,
	MAX: 8
}
const MINO = new Array(TYPE.MAX);
MINO[TYPE.I] = {
	shape: [
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	color: "#6CF"
};
MINO[TYPE.J] = {
	shape: [
		[0, 1, 0, 0],
		[0, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	color: "#66F"
};
MINO[TYPE.L] = {
	shape: [
		[0, 0, 1, 0],
		[1, 1, 1, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	color: "#F92"
};
MINO[TYPE.S] = {
	shape: [
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[1, 1, 0, 0],
		[0, 0, 0, 0]
	],
	color: "#5B5"
};
MINO[TYPE.Z] = {
	shape: [
		[0, 0, 0, 0],
		[1, 1, 0, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	],
	color: "#F44"
};
MINO[TYPE.O] = {
	shape: [
		[0, 0, 0, 0],
		[0, 1, 1, 0],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
	],
	color: "#FD2"
};
MINO[TYPE.T] = {
	shape: [
		[0, 1, 0, 0],
		[1, 1, 1, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	],
	color: "#C5C"
};
let isPressed = new Array(KEY.MAX).fill(false);
let can = document.getElementById("can");
let con = can.getContext("2d");
let field = new Array(FIELD_ROW);
let frameCount = 0;
let startTime;
let isRotated = false;	// スペースキーが押された時に回転したかどうか（押しっぱなしで回転することを防ぐ）
let gameOver = false;
let block = new Object();

// 新しいブロックの生成
function spwanBlock() {
	block.x = SPAWN_X;
	block.y = SPAWN_Y;
	block.type = getRandom(TYPE.MAX - 2) + 1;
	block.shape = MINO[block.type].shape;
	block.color = MINO[block.type].color;
}

function getRandom(num) {
	return Math.floor(Math.random() * (num + 1));
}

function init() {
	can.height = SCREEN_HEIGHT;
	can.width = SCREEN_WIDTH;
	can.style.border = "4px solid #555";
	for (let y = 0; y < FIELD_ROW; y++) {
		field[y] = new Array(FIELD_COL).fill(0);
	}
	setInterval(freeFall, FREE_FALL_SPEED);
	spwanBlock();
}

function drawBlock(x, y, type) {
	let px = x * BLOCK_SIZE;
	let py = y * BLOCK_SIZE;
	con.fillStyle = MINO[type].color;
	con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
	con.strokeStyle = "black";
	con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

function checkMove(mx, my, newMino) {
	if (newMino == undefined) newMino = block.shape;
	for (let y = 0; y < MINO_SIZE; y++) {
		for (let x = 0; x < MINO_SIZE; x++) {
			let nx = block.x + mx + x;
			let ny = block.y + my + y;
			if (newMino[y][x]) {
				if (nx < 0 || nx >= FIELD_COL || ny < 0 || ny >= FIELD_ROW || field[ny][nx]) return false;
			}
		}
	}
	return true;
}
function rotateBlock() {
	let newMino = [];
	for (let y = 0; y < MINO_SIZE; y++) {
		newMino[y] = [];
		for (let x = 0; x < MINO_SIZE; x++) {
			newMino[y][x] = block.shape[MINO_SIZE - x - 1][y];
		}
	}
	return newMino;
}

function fixBlock() {
	for (let y = 0; y < MINO_SIZE; y++) {
		for (let x = 0; x < MINO_SIZE; x++) {
			if (block.shape[y][x] !== TYPE.NON) {
				if(field[y + block.y][x + block.x] === TYPE.NON) field[y + block.y][x + block.x] = block.type;
				else {
					return false;
				}
			}
		}
	}
	return true;
}

function checkClear() {
	let lineCount = 0;
	for (let y = 0; y < FIELD_ROW; y++) {
		let isFilled = true;
		for (let x = 0; x < FIELD_COL; x++) {
			if (field[y][x] === TYPE.NON) {
				isFilled = false;
				break;
			}
		}
		if (isFilled) {
			lineCount++;
			for (let ny = y; ny > 0; ny--) {
				for (let nx = 0; nx < FIELD_COL; nx++) {
					field[ny][nx] = field[ny - 1][nx];
				}
			}
		}
	}
	return lineCount;
}

function freeFall() {
	if (checkMove(0, 1)) block.y++;
	else {
		if( fixBlock() ) {
			checkClear();
			spwanBlock();
		} else {
			gameOver = true;	
		}
	}
	draw();
}

function update() {
	if (frameCount % 3 == 0) {
		if (isPressed[KEY.left]) if (checkMove(-1, 0)) block.x--;
		if (isPressed[KEY.right]) if (checkMove(1, 0)) block.x++;
		// if (isPressed[KEY.up]) if (checkMove(0, -1)) block.y--;
		if (isPressed[KEY.down]) if (checkMove(0, 1)) block.y++;
	}
	if (!isRotated && isPressed[KEY.space]) {
		let newMino = rotateBlock();
		isRotated = true;
		if (checkMove(0, 0, newMino)) {
			block.shape = newMino;
		}
	}
}

function draw() {
	con.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	// フィールドの描画
	for (let y = 0; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			let px = x * BLOCK_SIZE;
			let py = y * BLOCK_SIZE;
			con.fillStyle = "white";
			con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
			con.strokeStyle = "gray";
			con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
		}
	}
	for (let y = 0; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			if (field[y][x]) drawBlock(x, y, field[y][x]);
		}
	}
	// 操作中のミノの描画
	for (let y = 0; y < MINO_SIZE; y++) {
		for (let x = 0; x < MINO_SIZE; x++) {
			if (block.shape[y][x]) drawBlock(block.x + x, block.y + y, block.type);
		}
	}
	con.font = "20px sans-serif";
	con.fillStyle = "black";
	con.fillText(`frame: ${frameCount}`, 10, 20);
}


window.onload = function () {
	this.init();
	startTime = performance.now();
	mainLoop();
}
// メインループ
function mainLoop() {
	let nowTime = performance.now();
	let nowFrame = (nowTime - startTime) / GAME_FPS;
	// if (nowFrame > frameCount) {
	// 	let cnt = 0;
	// 	while (nowFrame > frameCount) {
	// 		frameCount++;
	// 		update();
	// 		if (++cnt >= 4) break;
	// 	}
	// 	draw();
	// }
	frameCount++;
	update();
	draw();
	requestAnimationFrame(mainLoop);
}

document.onkeydown = function (e) {
	e.preventDefault();
	switch (e.keyCode) {
		case 37: // 左
			isPressed[KEY.left] = true;
			break;
		case 38: // 上
			isPressed[KEY.up] = true;
			break;
		case 39: // 右
			isPressed[KEY.right] = true;
			break;
		case 40: // 下
			isPressed[KEY.down] = true;
			break;
		case 32: // スペース
			isPressed[KEY.space] = true;
			break;
	}
}

document.onkeyup = function (e) {
	switch (e.keyCode) {
		case 37: // 左
			isPressed[KEY.left] = false;
			break;
		case 38: // 上
			isPressed[KEY.up] = false;
			break;
		case 39: // 右
			isPressed[KEY.right] = false;
			break;
		case 40: // 下
			isPressed[KEY.down] = false;
			break;
		case 32: // スペース
			isPressed[KEY.space] = false;
			isRotated = false;
			break;
	}
}