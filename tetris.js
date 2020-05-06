const GAME_FPS = 1000 / 60;
const BLOCK_SIZE = 25;
const FIELD_ROW = 30;
const FIELD_ROW_DISPLAY = 20;
const FIELD_COL = 10;
const SCREEN_HEIGHT = BLOCK_SIZE * FIELD_ROW_DISPLAY;
const SCREEN_WIDTH = BLOCK_SIZE * FIELD_COL + 6 * BLOCK_SIZE;
const FREE_FALL_SPEED = 500;
const NEXT_DISPLAY = 5;

const KEY = {
	left: 0,
	right: 1,
	hardDrop: 2,
	down: 3,
	rotateCW: 4,
	rotateCCW: 5,
	MAX: 6
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
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	color: "#66F"
};
MINO[TYPE.L] = {
	shape: [
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	],
	color: "#F92"
};
MINO[TYPE.S] = {
	shape: [
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	],
	color: "#5B5"
};
MINO[TYPE.Z] = {
	shape: [
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	],
	color: "#F44"
};
MINO[TYPE.O] = {
	shape: [
		[1, 1],
		[1, 1]
	],
	color: "#FD2"
};
MINO[TYPE.T] = {
	shape: [
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	color: "#C5C"
};
let isPressed = new Array(KEY.MAX).fill(false);
let can = document.getElementById("can");
let con = can.getContext("2d");
let field = new Array(FIELD_ROW);
let next = new Array();
let frameCount = 0;
let startTime;
let isRotatedCW = false;	// スペースキーが押された時に回転したかどうか（押しっぱなしで回転することを防ぐ）
let isRotatedCCW = false;	// スペースキーが押された時に回転したかどうか（押しっぱなしで回転することを防ぐ）
let isHardDropped = false;	// ハードドロップしたか
let gameOver = false;
let pastTime;
let block = new Object();

// 新しいブロックの生成
function spwanBlock() {
	if (gameOver) return;
	if (next.length <= NEXT_DISPLAY) generateNext();
	block.type = next.shift();
	block.shape = MINO[block.type].shape;
	block.color = MINO[block.type].color;
	block.size = block.shape.length;
	block.x = Math.floor(FIELD_COL / 2 - block.size / 2);
	block.y = FIELD_ROW - FIELD_ROW_DISPLAY - 2;
	if (!canMove(0, 0)) {
		gameOver = true;
	}
}

function generateNext() {
	let perm = new Array(TYPE.MAX);
	for (let i = 1; i < TYPE.MAX; i++) perm[i] = i;
	for (let i = TYPE.MAX - 2; i >= 0; i--) {
		let now = getRandom(i) + 1;
		next.push(perm[now]);
		perm.splice(now, 1);
	}
}

// 0～numの整数の中からランダムに１つ返す
function getRandom(num) {
	return Math.floor(Math.random() * (num + 1));
}

function init() {
	can.height = SCREEN_HEIGHT;
	can.width = SCREEN_WIDTH;
	can.style.border = "4px solid #555";
	for (let y = 0; y < FIELD_ROW; y++) {
		field[y] = new Array(FIELD_COL).fill(TYPE.NON);
	}
	setInterval(freeFall, FREE_FALL_SPEED);

	spwanBlock();
}

function canMove(mx, my, newMino) {
	if (newMino === undefined) newMino = block.shape;
	for (let y = 0; y < block.size; y++) {
		for (let x = 0; x < block.size; x++) {
			let nx = block.x + mx + x;
			let ny = block.y + my + y;
			if (newMino[y][x]) {
				if (nx < 0 || nx >= FIELD_COL || ny < 0 || ny >= FIELD_ROW || field[ny][nx]) return false;
			}
		}
	}
	return true;
}


function fixBlock() {
	let isOffScreen = true;
	for (let y = 0; y < block.size; y++) {
		for (let x = 0; x < block.size; x++) {
			if (block.shape[y][x] !== TYPE.NON) {
				let nx = x + block.x;
				let ny = y + block.y;
				if (field[ny][nx] === TYPE.NON) {
					field[ny][nx] = block.type;
				}
				if (nx => 0 && nx < FIELD_COL && ny >= (FIELD_ROW - FIELD_ROW_DISPLAY) && ny < FIELD_ROW) {
					isOffScreen = false;
				}
			}
		}
	}
	// 置いたときに完全に画面外だったらゲームオーバー
	if (isOffScreen) gameOver = true;
	checkClear();
	spwanBlock();
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
	if (gameOver) return;
	if (canMove(0, 1)) {
		block.y++;
	} else {
		fixBlock();
	}
	draw();
}

// ミノの回転（dir: 0でCW、1でCCW）
function rotateBlock(dir) {
	let newMino = [];
	for (let y = 0; y < block.size; y++) {
		newMino[y] = [];
		for (let x = 0; x < block.size; x++) {
			if (dir === 0) newMino[y][x] = block.shape[block.size - x - 1][y];
			if (dir === 1) newMino[y][x] = block.shape[x][block.size - y - 1];
		}
	}
	if (canMove(0, 0, newMino)) {
		block.shape = newMino;
	}
}

function update() {
	if (gameOver) return;
	if (frameCount % 3 == 0) {
		if (isPressed[KEY.left]) if (canMove(-1, 0)) block.x--;
		if (isPressed[KEY.right]) if (canMove(1, 0)) block.x++;
		if (isPressed[KEY.down]) if (canMove(0, 1)) block.y++;
	}
	if (!isHardDropped && isPressed[KEY.hardDrop]) {
		isHardDropped = true;
		let bottom = 0;
		while (canMove(0, bottom)) {
			bottom++;
		}
		bottom--;
		block.y += bottom;
		fixBlock();
	}
	if (!isRotatedCW && isPressed[KEY.rotateCW]) {
		isRotatedCW = true;
		rotateBlock(0);
	}
	if (!isRotatedCCW && isPressed[KEY.rotateCCW]) {
		isRotatedCCW = true;
		rotateBlock(1);
	}
}

function zeroPadding(num, len) {
	return (Array(len).join('0') + num).slice(-len);
}

function drawBlock(x, y, color, stroke) {
	if (stroke === undefined) stroke = "black";
	let px = x * BLOCK_SIZE;
	let py = (y - (FIELD_ROW - FIELD_ROW_DISPLAY)) * BLOCK_SIZE;
	con.fillStyle = color;
	con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
	con.strokeStyle = stroke;
	con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

function drawTime() {
	let msec = pastTime % 1000;
	let sec = pastTime / 1000;
	let min = sec / 60;
	sec %= 60;
	msec = Math.floor(msec);
	sec = Math.floor(sec);
	min = Math.floor(min);
	con.font = "20px sans-serif";
	con.fillStyle = "black";
	con.fillText(`${zeroPadding(min, 2)}:${zeroPadding(sec, 2)}.${zeroPadding(msec, 3)}`, 10, 20);
}

function drawNext() {
	for (let i = 0; i < NEXT_DISPLAY; i++) {
		for (let y = 0; y < MINO[next[i]].shape.length; y++) {
			for (let x = 0; x < MINO[next[i]].shape.length; x++) {
				if (MINO[next[i]].shape[y][x]) {
					if (MINO[next[i]].shape.length <= 2) {
						// Oのための位置調整
						drawBlock(FIELD_COL + x + 2, 1 + i * 3 + y + (FIELD_ROW - FIELD_ROW_DISPLAY), MINO[next[i]].color);
					} else {
						drawBlock(FIELD_COL + x + 1, 1 + i * 3 + y + (FIELD_ROW - FIELD_ROW_DISPLAY), MINO[next[i]].color);
					}
				}
			}
		}
	}
}

function draw() {
	con.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	// 背景の描画
	for (let y = FIELD_ROW - FIELD_ROW_DISPLAY; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			drawBlock(x, y, "white", "gray");
		}
	}
	// フィールドの描画
	for (let y = FIELD_ROW - FIELD_ROW_DISPLAY; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			if (field[y][x]) drawBlock(x, y, MINO[field[y][x]].color);
		}
	}
	// ゴーストの位置の計算
	let bottom = 0;
	while (canMove(0, bottom)) {
		bottom++;
	}
	bottom--;
	// 操作中のミノの描画
	for (let y = 0; y < block.size; y++) {
		for (let x = 0; x < block.size; x++) {
			if (block.shape[y][x]) {
				// Ghost
				if (!gameOver) drawBlock(block.x + x, block.y + y + bottom, "#777", "#222");
				// 操作中のミノ
				drawBlock(block.x + x, block.y + y, block.color);
			}
		}
	}
	drawTime();
	drawNext();
	if (gameOver) {
		let s = "GAME OVER";
		con.font = "40px sans-serif";
		let w = con.measureText(s).width;
		let x = SCREEN_WIDTH / 2 - w / 2;
		let y = SCREEN_HEIGHT / 2 - 20;
		con.strokeText(s, x, y);
		con.fillStyle = "red";
		con.fillText(s, x, y);
	}
}


window.onload = function () {
	this.init();
	startTime = performance.now();
	mainLoop();
}
// メインループ
function mainLoop() {
	let nowTime = performance.now();
	if (!gameOver) pastTime = nowTime - startTime;
	let nowFrame = (nowTime - startTime) / GAME_FPS;
	if (nowFrame > frameCount) {
		// let cnt = 0;
		while (nowFrame > frameCount) {
			frameCount++;
			update();
			// if (++cnt >= 4) break;
		}
		draw();
	}
	requestAnimationFrame(mainLoop);
}

document.onkeydown = function (e) {
	e.preventDefault();
	if (gameOver) return;
	switch (e.keyCode) {
		case 37: // 矢印左
			isPressed[KEY.left] = true;
			break;
		case 38: // 矢印上
			isPressed[KEY.hardDrop] = true;
			break;
		case 39: // 矢印右
			isPressed[KEY.right] = true;
			break;
		case 40: // 矢印下
			isPressed[KEY.down] = true;
			break;
		case 32: // スペース
			isPressed[KEY.rotateCW] = true;
			break;
		case 90: // Z
			isPressed[KEY.rotateCCW] = true;
			break;
		case 88: // X
			isPressed[KEY.rotateCW] = true;
			break;
	}
}

document.onkeyup = function (e) {
	if (gameOver) return;
	switch (e.keyCode) {
		case 37: // 矢印左
			isPressed[KEY.left] = false;
			break;
		case 38: // 矢印上
			isPressed[KEY.hardDrop] = false;
			isHardDropped = false;
			break;
		case 39: // 矢印右
			isPressed[KEY.right] = false;
			break;
		case 40: // 矢印下
			isPressed[KEY.down] = false;
			break;
		case 32: // スペース
			isPressed[KEY.rotateCW] = false;
			isRotatedCW = false;
			break;
		case 90: // Z
			isPressed[KEY.rotateCCW] = false;
			isRotatedCCW = false;
			break;
		case 88: // X
			isPressed[KEY.rotateCW] = false;
			isRotatedCW = false;
			break;
	}
}