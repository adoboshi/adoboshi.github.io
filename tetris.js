const GAME_FPS = 1000 / 60;
const BLOCK_SIZE = 25;
const FIELD_ROW = 30;
const FIELD_ROW_DISPLAY = 20;
const FIELD_COL = 10;
const SCREEN_HEIGHT = BLOCK_SIZE * FIELD_ROW_DISPLAY;
const HOLD_WIDTH = 6 * BLOCK_SIZE;
const FIELD_WIDTH = BLOCK_SIZE * FIELD_COL;
const NEXT_WIDTH = 6 * BLOCK_SIZE;
const SCREEN_WIDTH = FIELD_WIDTH + NEXT_WIDTH + HOLD_WIDTH;
const FREE_FALL_SPEED = 500;
const FIX_INTERVAL_MAX = 500;	// ミノが接地してから固定されるまでの時間[ms]
const FIX_MOVE_COUNT_MAX = 15;
const AUTO_REPEAT_DELAY_MAX = 200;	// 横を押しっぱなしにした時に、
const NEXT_DISPLAY_NUM = 6;

const KEY = {
	left: 0,
	right: 1,
	hardDrop: 2,
	down: 3,
	rotateCW: 4,
	rotateCCW: 5,
	hold: 6,
	MAX: 7
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
let hold;
let frameCount = 0;
let startTime;
let isRotatedCW = false;	// スペースキーが押された時に回転したかどうか（押しっぱなしで回転することを防ぐ）
let isRotatedCCW = false;	// スペースキーが押された時に回転したかどうか（押しっぱなしで回転することを防ぐ）
let isHardDropped = false;	// ハードドロップしたか
let isHolded = false;	// holdしたか
let isMovedRight = false;	// 右移動したか
let isMovedLeft = false;	// 左移動したか
let gameOver = false;
let lineCount = 0;
let TspinCount = 0;
let isTspin = false;
let fixInterval = 0;
let fixMoveCount = 0;	// 移動か回転が行われるたびに+1（下に落下すると0に戻る）。FIX_MOVE_COUNT_MAXに達すると強制設置
let lowestHeight;	// そのミノが経験した最も低い高さ。最小値が更新されない場合、落下してもfixMoveCountを0にしない（無限回しの防止）
let autoRepeatDelay = 0;	// AUTO_REPEAT_DELAY_MAX未満のときはオートリピートしない
let pastTime = 0;
let block = new Object();

function setBlock(type) {
	block.type = type;
	block.shape = MINO[type].shape;
	block.color = MINO[type].color;
	block.size = block.shape.length;
	block.x = Math.floor(FIELD_COL / 2 - block.size / 2);
	block.y = FIELD_ROW - FIELD_ROW_DISPLAY - 2;
	block.dir = 0;	// 0: Noreth, 1: East, 2: South, 3: West
}

// 新しいブロックの生成
function spwanBlock() {
	if (gameOver) return;
	if (next.length <= NEXT_DISPLAY_NUM) generateNext();
	setBlock(next.shift());
	fixInterval = pastTime;
	fixMoveCount = 0;
	isTspin = false;
	lowestHeight = block.y;
	if (!canMove(0, 0)) gameOver = true;
}

// 配列nextにネクストを生成する（７種１巡）
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
				if (nx >= 0 && nx < FIELD_COL && ny >= (FIELD_ROW - FIELD_ROW_DISPLAY) && ny < FIELD_ROW) {
					isOffScreen = false;
				}
			}
		}
	}
	// 置いたときに完全に画面外だったらゲームオーバー
	if (isOffScreen) gameOver = true;
	checkClear();
	spwanBlock();
	isHolded = false;
}

function checkClear() {
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
			if (isTspin) TspinCount++;
			for (let ny = y; ny > 0; ny--) {
				for (let nx = 0; nx < FIELD_COL; nx++) {
					field[ny][nx] = field[ny - 1][nx];
				}
			}
		}
	}
}

function freeFall() {
	if (gameOver) return;
	if (canMove(0, 1)) {
		block.y++;
		fixInterval = pastTime;
		if (lowestHeight < block.y) {
			fixMoveCount = 0;
		}
		lowestHeight = Math.max(lowestHeight, block.y);
	}
	draw();
}

// ミノの回転（dir: 1でCW、-1でCCW）
function rotateBlock(dir) {
	if (block.type === TYPE.O) return;

	let newMino = [];
	for (let y = 0; y < block.size; y++) {
		newMino[y] = [];
		for (let x = 0; x < block.size; x++) {
			if (dir === 1) newMino[y][x] = block.shape[block.size - x - 1][y];
			if (dir === -1) newMino[y][x] = block.shape[x][block.size - y - 1];
		}
	}
	// SRS
	let nextDirction = (block.dir + dir + 4) % 4;
	let canRotate = false;
	let nx = 0, ny = 0;
	if (block.type !== TYPE.I) {
		if (nextDirction === 3 || nextDirction === 1) {
			let mx = ((nextDirction === 3) ? 1 : -1);
			if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
			else if (canMove(mx, 0, newMino)) canRotate = true, nx = mx, ny = 0;
			else if (canMove(mx, -1, newMino)) canRotate = true, nx = mx, ny = -1;
			else if (canMove(0, 2, newMino)) canRotate = true, nx = 0, ny = 2;
			else if (canMove(mx, 2, newMino)) canRotate = true, nx = mx, ny = 2;
		} else {
			let mx;
			if (nextDirction === 0) mx = dir * -1;
			else mx = dir;
			if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
			else if (canMove(mx, 0, newMino)) canRotate = true, nx = mx, ny = 0;
			else if (canMove(mx, 1, newMino)) canRotate = true, nx = mx, ny = 1;
			else if (canMove(0, -2, newMino)) canRotate = true, nx = 0, ny = -2;
			else if (canMove(mx, -2, newMino)) canRotate = true, nx = mx, ny = -2;
		}
	} else {
		if (nextDirction === 0) {
			if (dir === 1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(-2, 0, newMino)) canRotate = true, nx = -2, ny = 0;
				else if (canMove(1, 0, newMino)) canRotate = true, nx = 1, ny = 0;
				else if (canMove(1, 2, newMino)) canRotate = true, nx = 1, ny = 2;
				else if (canMove(-2, -1, newMino)) canRotate = true, nx = -2, ny = -1;
			} else if (dir === -1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(2, 0, newMino)) canRotate = true, nx = 2, ny = 0;
				else if (canMove(-1, 0, newMino)) canRotate = true, nx = -1, ny = 0;
				else if (canMove(2, -1, newMino)) canRotate = true, nx = 2, ny = -1;
				else if (canMove(-1, 2, newMino)) canRotate = true, nx = -1, ny = 2;
			}
		} else if (nextDirction === 1) {
			if (dir === 1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(-2, 0, newMino)) canRotate = true, nx = -2, ny = 0;
				else if (canMove(1, 0, newMino)) canRotate = true, nx = 1, ny = 0;
				else if (canMove(-2, 1, newMino)) canRotate = true, nx = -2, ny = 1;
				else if (canMove(1, -2, newMino)) canRotate = true, nx = 1, ny = -2;
			} else if (dir === -1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(1, 0, newMino)) canRotate = true, nx = 1, ny = 0;
				else if (canMove(-2, 0, newMino)) canRotate = true, nx = -2, ny = 0;
				else if (canMove(1, 2, newMino)) canRotate = true, nx = 1, ny = 2;
				else if (canMove(-2, -1, newMino)) canRotate = true, nx = -2, ny = -1;
			}
		} else if (nextDirction === 2) {
			if (dir === 1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(-1, 0, newMino)) canRotate = true, nx = -1, ny = 0;
				else if (canMove(2, 0, newMino)) canRotate = true, nx = 2, ny = 0;
				else if (canMove(-1, -2, newMino)) canRotate = true, nx = -1, ny = -2;
				else if (canMove(2, 1, newMino)) canRotate = true, nx = 2, ny = 1;
			} else if (dir === -1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(1, 0, newMino)) canRotate = true, nx = 1, ny = 0;
				else if (canMove(-2, 0, newMino)) canRotate = true, nx = -2, ny = 0;
				else if (canMove(-2, 1, newMino)) canRotate = true, nx = -2, ny = 1;
				else if (canMove(1, -2, newMino)) canRotate = true, nx = 1, ny = -2;
			}
		} else if (nextDirction === 3) {
			if (dir === 1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(2, 0, newMino)) canRotate = true, nx = 2, ny = 0;
				else if (canMove(-1, 0, newMino)) canRotate = true, nx = -1, ny = 0;
				else if (canMove(2, -1, newMino)) canRotate = true, nx = 2, ny = -1;
				else if (canMove(-1, 2, newMino)) canRotate = true, nx = -1, ny = 2;
			} else if (dir === -1) {
				if (canMove(0, 0, newMino)) canRotate = true, nx = 0, ny = 0;
				else if (canMove(-1, 0, newMino)) canRotate = true, nx = -1, ny = 0;
				else if (canMove(2, 0, newMino)) canRotate = true, nx = 2, ny = 0;
				else if (canMove(-1, -2, newMino)) canRotate = true, nx = -1, ny = -2;
				else if (canMove(2, 1, newMino)) canRotate = true, nx = 2, ny = 1;
			}
		}
	}

	// 回転
	if (canRotate) {
		block.shape = newMino;
		block.x += nx;
		block.y += ny;
		fixInterval = pastTime;
		fixMoveCount++;
		block.dir = nextDirction;
		
		// Tspin判定
		if (block.type === TYPE.T) {
			let count = 0;
			// 左側
			if (block.x === -1) {
				count += 2;
			} else {
				if (field[block.y][block.x] !== TYPE.NON) count++;
				if (block.y + 2 >= FIELD_ROW) {
					count++;
				} else {
					if (field[block.y + 2][block.x] !== TYPE.NON) count++;
				}
			}
			// 右側
			if (block.x + 2 === FIELD_COL) {
				count += 2;
			} else {
				if (field[block.y][block.x + 2] !== TYPE.NON) count++;
				if (block.y + 2 >= FIELD_ROW) {
					count++;
				} else {
					if (field[block.y + 2][block.x + 2] !== TYPE.NON) count++;
				}
			}

			if (count >= 3) isTspin = true;
			else isTspin = false;
		}
	}
}

function update() {
	if (gameOver) return;

	if (!isMovedLeft && isPressed[KEY.left]) {
		isMovedLeft = true;
		if (canMove(-1, 0)) {
			block.x--;
			fixInterval = pastTime;
			fixMoveCount++;
			isTspin = false;
		}
	}
	if (!isMovedRight && isPressed[KEY.right]) {
		isMovedRight = true;
		if (canMove(1, 0)) {
			block.x++;
			fixInterval = pastTime;
			fixMoveCount++;
			isTspin = false;
		}
	}

	// オートリピート
	if ((pastTime - autoRepeatDelay) > AUTO_REPEAT_DELAY_MAX) {
		if (frameCount % 3 == 0) if (isMovedLeft && isPressed[KEY.left]) if (canMove(-1, 0)) {
			block.x--;
			fixInterval = pastTime;
			fixMoveCount++;
			isTspin = false;
		}
		if (frameCount % 3 == 0) if (isMovedRight && isPressed[KEY.right]) if (canMove(1, 0)) {
			block.x++;
			fixInterval = pastTime;
			fixMoveCount++;
			isTspin = false;
		}
	}
	if (frameCount % 3 == 0) if (isPressed[KEY.down]) if (canMove(0, 1)) {
		block.y++;
		fixInterval = pastTime;
		if (lowestHeight < block.y) {
			fixMoveCount = 0;
		}
		lowestHeight = Math.max(lowestHeight, block.y);
		isTspin = false;
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
		rotateBlock(1);
	}
	if (!isRotatedCCW && isPressed[KEY.rotateCCW]) {
		isRotatedCCW = true;
		rotateBlock(-1);
	}
	if (!isHolded && isPressed[KEY.hold]) {
		isHolded = true;
		if (hold === undefined) {
			hold = block.type;
			spwanBlock();
		} else {
			let tmp = hold;
			hold = block.type;
			setBlock(tmp);
		}
	}
	// 強制設置
	if (pastTime - fixInterval > FIX_INTERVAL_MAX || fixMoveCount >= FIX_MOVE_COUNT_MAX) {
		if (!canMove(0, 1)) {
			fixBlock();
		}
	}
}

function zeroPadding(num, len) {
	return (Array(len).join('0') + num).slice(-len);
}

function drawBlock(px, py, color, stroke) {
	if (stroke === undefined) stroke = "black";
	con.fillStyle = color;
	con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
	con.strokeStyle = stroke;
	con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
}

function drawField(x, y, color, stroke) {
	let px = x * BLOCK_SIZE + HOLD_WIDTH;
	let py = (y - (FIELD_ROW - FIELD_ROW_DISPLAY)) * BLOCK_SIZE;
	drawBlock(px, py, color, stroke);
}

function drawNext() {
	for (let i = 0; i < NEXT_DISPLAY_NUM; i++) {
		let shape = MINO[next[i]].shape;
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape.length; x++) {
				if (shape[y][x]) {
					let px = HOLD_WIDTH + FIELD_WIDTH + NEXT_WIDTH / 2 - (shape.length / 2 - x) * BLOCK_SIZE;
					let py = (i * 3 + y + 2) * BLOCK_SIZE;
					drawBlock(px, py, MINO[next[i]].color);
				}
			}
		}
	}
}

function drawHold() {
	if (hold === undefined) return;
	let shape = MINO[hold].shape;
	for (let y = 0; y < shape.length; y++) {
		for (let x = 0; x < shape.length; x++) {
			if (shape[y][x]) {
				let px = HOLD_WIDTH / 2 - (shape.length / 2 - x) * BLOCK_SIZE;
				let py = (y + 2) * BLOCK_SIZE;
				drawBlock(px, py, MINO[hold].color);
			}
		}
	}

}

function drawText() {
	let fontSize = 30;
	con.font = fontSize + "px sans-serif";
	con.fillStyle = "white";
	let w, s;
	s = "HOLD";
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 40);
	s = "TIME";
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 200);
	s = "LINES";
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 300);
	s = "T-SPINS";
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 400);
	s = "NEXT";
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH + FIELD_WIDTH + NEXT_WIDTH / 2 - w / 2, 40);

	// drawTime();
	let msec = (pastTime % 1000) / 10;
	let sec = pastTime / 1000;
	let min = sec / 60;
	sec %= 60;
	msec = Math.floor(msec);
	sec = Math.floor(sec);
	min = Math.floor(min);
	s = `${zeroPadding(min, 2)}:${zeroPadding(sec, 2)}.${zeroPadding(msec, 2)}`;
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 200 + fontSize + 10);

	// drawLines();
	s = zeroPadding(lineCount, 4);
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 300 + fontSize + 10);

	// drawTspin();
	s = zeroPadding(TspinCount, 4);
	w = con.measureText(s).width;
	con.fillText(s, HOLD_WIDTH / 2 - w / 2, 400 + fontSize + 10);

	// ゲームオーバー
	if (gameOver) {
		con.fillStyle = "black";
		let fontSize = 80;
		con.font = fontSize + "px sans-serif";
		s = "GAME";
		w = con.measureText(s).width;
		// con.strokeText(s, HOLD_WIDTH + FIELD_WIDTH / 2 - w / 2, SCREEN_HEIGHT / 2 - fontSize / 2);
		con.fillText(s, HOLD_WIDTH + FIELD_WIDTH / 2 - w / 2, SCREEN_HEIGHT / 2 - fontSize / 2);
		s = "OVER";
		w = con.measureText(s).width;
		// con.strokeText(s, HOLD_WIDTH + FIELD_WIDTH / 2 - w / 2, SCREEN_HEIGHT / 2 + fontSize / 2);
		con.fillText(s, HOLD_WIDTH + FIELD_WIDTH / 2 - w / 2, SCREEN_HEIGHT / 2 + fontSize / 2);
	}
}

function draw() {
	// con.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	con.fillStyle = "#333";
	con.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

	// 背景の描画
	for (let y = FIELD_ROW - FIELD_ROW_DISPLAY; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			drawField(x, y, "white", "gray");
		}
	}
	// フィールドの描画
	for (let y = FIELD_ROW - FIELD_ROW_DISPLAY; y < FIELD_ROW; y++) {
		for (let x = 0; x < FIELD_COL; x++) {
			if (field[y][x]) drawField(x, y, MINO[field[y][x]].color);
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
				if (!gameOver) drawField(block.x + x, block.y + y + bottom, "#777", "#222");
				// 操作中のミノ
				drawField(block.x + x, block.y + y, block.color);
			}
		}
	}
	drawNext();
	drawHold();
	drawText();
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
			// if (++cnt >= 4) break;
			frameCount++;
			update();
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
			if (!isMovedLeft) autoRepeatDelay = pastTime;
			break;
		case 38: // 矢印上
			isPressed[KEY.hardDrop] = true;
			break;
		case 39: // 矢印右
			isPressed[KEY.right] = true;
			if (!isMovedRight) autoRepeatDelay = pastTime;
			break;
		case 40: // 矢印下
			isPressed[KEY.down] = true;
			break;
		case 32: // スペース
			isPressed[KEY.hold] = true;
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
			isMovedLeft = false;
			break;
		case 38: // 矢印上
			isPressed[KEY.hardDrop] = false;
			isHardDropped = false;
			break;
		case 39: // 矢印右
			isPressed[KEY.right] = false;
			isMovedRight = false;
			break;
		case 40: // 矢印下
			isPressed[KEY.down] = false;
			break;
		case 32: // スペース
			isPressed[KEY.hold] = false;
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