const GAME_FPS = 1000 / 60;
const BLOCK_SIZE = 25;
const MINO_SIZE = 4;
const FIELD_ROW = 20;
const FIELD_COL = 10;
const SCREEN_HEIGHT = BLOCK_SIZE * FIELD_ROW;
const SCREEN_WIDTH = BLOCK_SIZE * FIELD_COL;

const key = {
	left: 0,
	right: 1,
	up: 2,
	down: 3,
	space: 4,
	MAX: 5
};
let isPressed = new Array(key.MAX).fill(false);
let can = document.getElementById("can");
let con = can.getContext("2d");
let field = new Array(FIELD_ROW);
let frameCount = 0;
let startTime;
let isRotated = false;	// スペースキーが押された時に回転したかどうか（押しっぱなしで回転することを防ぐ）
let mino = [
	[0, 0, 0, 0],
	[1, 1, 0, 0],
	[0, 1, 1, 0],
	[0, 0, 0, 0]
];
class Block {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
let block = new Block(FIELD_COL / 2 - MINO_SIZE / 2, 0);

function init() {
	can.height = SCREEN_HEIGHT;
	can.width = SCREEN_WIDTH;
	can.style.border = "4px solid #555";
	for (let y = 0; y < FIELD_ROW; y++) {
		field[y] = new Array(FIELD_COL).fill(0);
	}
	// debug
	field[5][5] = 1;
}

function drawBlock(x, y, color) {
	let blockColor;
	let lineColor;
	switch (color) {
		case 0:
			blockColor = "white";
			lineColor = "gray";
			break;
		default:
			blockColor = "red";
			lineColor = "black";
			break;
	}
	let px = x * BLOCK_SIZE;
	let py = y * BLOCK_SIZE;
	con.fillStyle = blockColor;
	con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
	con.strokeStyle = lineColor;
	con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}
function drawField() {
	for (let y = 0; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			drawBlock(x, y);
		}
	}
}

function checkMove(mx, my, newMino) {
	if(newMino == undefined) newMino = mino;
	for (let y = 0; y < MINO_SIZE; y++) {
		for (let x = 0; x < MINO_SIZE; x++) {
			let nx = block.x + mx + x;
			let ny = block.y + my + y;
			if (newMino[y][x]) {
				if (nx < 0 || nx >= FIELD_COL || ny < 0 || ny >= FIELD_ROW || field[nx][ny]) return false;
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
			newMino[y][x] = mino[MINO_SIZE-x-1][y];
		}
	}
	return newMino;
}

function update() {
	if(frameCount%3 == 0) {
		if (isPressed[key.left]) if (checkMove(-1, 0)) block.x--;
		if (isPressed[key.right]) if (checkMove(1, 0)) block.x++;
		if (isPressed[key.up]) if (checkMove(0, -1)) block.y--;
		if (isPressed[key.down]) if (checkMove(0, 1)) block.y++;
	}
	if (!isRotated && isPressed[key.space]) {
		let newMino = rotateBlock();
		isRotated = true;
		if (checkMove(0, 0, newMino)) {
			mino = newMino;
		}
	}
}

function draw() {
	con.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	for (let y = 0; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			drawBlock(x, y, field[y][x]);
		}
	}
	for (let y = 0; y < MINO_SIZE; y++) {
		for (let x = 0; x < MINO_SIZE; x++) {
			if(mino[y][x]) drawBlock(block.x + x, block.y + y, mino[y][x]);
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
	if (nowFrame > frameCount) {
		let cnt = 0;
		while (nowFrame > frameCount) {
			frameCount++;
			update();
			if (++cnt >= 4) break;
		}
		draw();
	}
	requestAnimationFrame(mainLoop);
}

document.onkeydown = function (e) {
	switch (e.keyCode) {
		case 37: // 左
			isPressed[key.left] = true;
			break;
		case 38: // 上
			isPressed[key.up] = true;
			break;
		case 39: // 右
			isPressed[key.right] = true;
			break;
		case 40: // 下
			isPressed[key.down] = true;
			break;
		case 32: // スペース
			isPressed[key.space] = true;
			break;
	}
}

document.onkeyup = function (e) {
	switch (e.keyCode) {
		case 37: // 左
			isPressed[key.left] = false;
			break;
		case 38: // 上
			isPressed[key.up] = false;
			break;
		case 39: // 右
			isPressed[key.right] = false;
			break;
		case 40: // 下
			isPressed[key.down] = false;
			break;
		case 32: // スペース
			isPressed[key.space] = false;
			isRotated = false;
			break;
	}
}