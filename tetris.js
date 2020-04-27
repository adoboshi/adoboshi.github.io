const GAME_FPS = 1000/60;
const BLOCK_SIZE = 25;
const MINO_SIZE = 4;
const FIELD_ROW = 20;
const FIELD_COL = 10;
const SCREEN_HEIGHT = BLOCK_SIZE * FIELD_ROW;
const SCREEN_WIDTH = BLOCK_SIZE * FIELD_COL;

let can = document.getElementById("can");
let con = can.getContext("2d");
can.height = SCREEN_HEIGHT;
can.width = SCREEN_WIDTH;
can.style.border = "4px solid #555";


let mino = [
	[0, 0, 0, 0],
	[1, 1, 0, 0],
	[0, 1, 1, 0],
	[0, 0, 0, 0]
]
for (let y = 0; y < MINO_SIZE; y++) {
	for (let x = 0; x < MINO_SIZE; x++) {
		if (mino[y][x]) {
			let px = x * BLOCK_SIZE;
			let py = y * BLOCK_SIZE;
			con.fillStyle = "red";
			con.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
			con.strokeStyle = "black";
			con.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
		}
	}
}

function update() {
	
}
function draw() {
	con.fillStyle = "#ccc";
	con.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	
	con.font = "20px sans-serif";
	con.fillStyle = "black";
	con.fillText(`frame: ${frameCount}`, 10, SCREEN_HEIGHT/2);
	con.fillText(`startTime: ${startTime}`, 10, SCREEN_HEIGHT/2+60);
	
	if(isLeftPress) {
		con.fillStyle = "#444";
		con.fillRect(0, 0, SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
	}
	if(isRightPress) {
		con.fillStyle = "#4c4";
		con.fillRect(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT);
	}
}

let isLeftPress = false;
let isRightPress = false;
let frameCount = 0;
let startTime;
window.onload = function() {
	startTime = performance.now();
	mainLoop();
}
// メインループ
function mainLoop() {
	let nowTime = performance.now();
	let nowFrame = (nowTime - startTime)/GAME_FPS;
	if(nowFrame > frameCount) {
		let cnt = 0;
		while(nowFrame > frameCount) {
			frameCount++;
			update();
			if(++cnt >= 4) break;
		}
		draw();
	}
	requestAnimationFrame(mainLoop);
}

document.onkeydown = function(e) {
	if(e.keyCode === 37) isLeftPress = true;
	if(e.keyCode === 39) isRightPress = true;
}

document.onkeyup = function(e) {
	if(e.keyCode === 37) isLeftPress = false;
	if(e.keyCode === 39) isRightPress = false;
}