// 获取页面元素
var contentDiv = document.getElementById('content');
var startDiv = document.getElementById('start');
var mainDiv = document.getElementById('main');
var scoreDiv = document.getElementById('score');
var suspendDiv = document.getElementById('suspend');
var continueDiv = document.getElementById('continue');
var settlementDIV = document.getElementById('settlement');

var score = 0;
// 获取游戏界面宽高度
var contentClass = contentDiv.currentStyle ? contentDiv.currentStyle : window.getComputedStyle(contentDiv, null);
var stageSizeX = parseInt(contentClass.width);
var stageSizeY = parseInt(contentClass.height);

// 创建不同病毒型号对象
var enemyVirusS = {
	width: 34,
	height: 24,
	imgSrc: './asset/images/virus.png',
	boomSrc: './asset/images/virus-hit.png',
	boomTime: 50,
	hp: 1
};

var enemyVirusM = {
	width: 46,
	height: 60,
	imgSrc: './asset/images/virueM.png',
	hitSrc: './asset/images/virueM-hit.png',
	boomSrc: './asset/images/virueM-boom.png',
	boomTime: 50,
	hp: 3
};

var enemyVirusL = {
	width: 110,
	height: 164,
	imgSrc: './asset/images/virusL.png',
	hitSrc: './asset/images/virusLhit.png',
	boomSrc: './asset/images/virusL-hit.png',
	boomTime: 50,
	hp: 7
};

// 我方医生
var ourDoctor = {
	width: 100,
	height: 100,
	imgSrc: './asset/images/doctor.jpg',
	boomSrc: './asset/images/doctor-hit.jpg',
	boomTime: 50,
	hp: 1
};
// 子弹
var bulletX = {
	width: 6,
	height: 14,
	imgSrc: './asset/images/needle.png',
	speed: 5
};

// 创建构造函数
var Plane = function (centerX, centerY, planeModel, speed) {
	this.centerX = centerX;
	this.centerY = centerY;
	this.sizeX = planeModel.width;
	this.sizeY = planeModel.height;
	this.imgSrc = planeModel.imgSrc;
	this.boomSrc = planeModel.boomSrc;
	this.boomTime = planeModel.boomTime;
	this.hp = planeModel.hp;
	this.speed = speed;

	//定位点
	this.currentX = this.centerX - this.sizeX / 2;
	this.currentY = this.centerY - this.sizeY / 2;
}

// 画的方法
Plane.prototype.draw = function () {
	// this.imgNode = document.createElement('img');
	this.imgNode = new Image();
	this.imgNode.src = this.imgSrc;
	this.imgNode.style.top = this.centerY - this.sizeY / 2 + 'px';
	this.imgNode.style.left = this.centerX - this.sizeX / 2 + 'px';
	mainDiv.appendChild(this.imgNode);
}

// 移动方法
Plane.prototype.move = function () {
	this.currentY += this.speed;
	this.centerY = this.currentY + this.sizeY / 2;
	this.imgNode.style.top = this.currentY + 'px';
	this.checkOverRange();
}

// 检测是否超出画布
Plane.prototype.checkOverRange = function () {
	// 如果病毒超出画布 就给当前病毒对象添加一个isBottomRange的属性
	this.isBottomRange = this.currentY > (stageSizeY - this.sizeY);
	this.isTopRange = this.currentY < 0;
}

// 病毒的构造函数
var Enemy = function () {
	this.segments = [];
	this.generatedCount = 0;
};

// 随机生成 min-max 之间的随机数
var randomNumber = function (min, max) {
	return Math.round(Math.random() * (max - min)) + min;
}
// 随机数当成   min+(max-min)  范围min 到 (min + (max-min))

// 生成画出所有新的病毒方法
Enemy.prototype.createNewEnemy = function () {
	this.generatedCount++;

	if (this.generatedCount % 17 === 0) {
		this.newEnemy = new Plane(randomNumber(enemyVirusL.width / 2, stageSizeX - enemyVirusL.width / 2), 12, enemyVirusL, 1)
	} else if (this.generatedCount % 5 === 0) {
		this.newEnemy = new Plane(randomNumber(enemyVirusM.width / 2, stageSizeX - enemyVirusM.width / 2), 12, enemyVirusM, randomNumber(2, 3))
	} else {
		this.newEnemy = new Plane(randomNumber(enemyVirusS.width / 2, stageSizeX - enemyVirusS.width / 2), 12, enemyVirusS, randomNumber(3, 5))
	}

	// 把新生成的病毒写入数组
	this.segments.push(this.newEnemy);
	// 把新生成的病毒画出来
	this.newEnemy.draw();

}

// 移动所有的病毒
Enemy.prototype.moveAllEnemy = function () {
	// 遍历敌机对象里面的保存敌机的数组 让每一个都移动
	for (var i = 0; i < this.segments.length; i++) {
		this.segments[i].move();
		// 如果超出画布怎么样
		if (this.segments[i].isBottomRange) {
			mainDiv.removeChild(this.segments[i].imgNode);
			this.segments.splice(i, 1);
		}

		// 检测子弹碰撞
		for (var j = 0; j < ourPlane.segement.length; j++) {

			// 如果病毒还未死亡就挡住子弹
			if (this.segments[i].hp > 0) {
				var horizontalCollision = Math.abs(this.segments[i].centerX - ourPlane.segement[j].centerX) < (this.segments[i].sizeX / 2 + ourPlane.segement[j].sizeX / 2)
				var verticalCollision = Math.abs(this.segments[i].centerY - ourPlane.segement[j].centerY) < (this.segments[i].sizeY / 2 + ourPlane.segement[j].sizeY / 2)
				var checkBulletCollision = horizontalCollision && verticalCollision;

				if (checkBulletCollision) {
					// 病毒挨打
					score++;
					scoreDiv.innerHTML = score;
					this.segments[i].imgNode.src = this.segments[i].hitSrc ? this.segments[i].hitSrc : this.segments[i].boomSrc;
					this.segments[i].hp--;

					// 把子弹干掉
					mainDiv.removeChild(ourPlane.segement[j].imgNode);
					ourPlane.segement.splice(j, 1);

					// 打中音效
					var a = document.createElement('audio')
					a.src = './asset/images/子弹铁皮.mp3'
					// document.body.appendChild(a)
					a.play()
					// a.onended = function () {
					// 	document.body.removeChild(a)
					// }
				}
			}
		}

		// 检测与我方医生的碰撞
		var ourHorizontalCollision = Math.abs(this.segments[i].centerX - ourPlane.centerX) < (this.segments[i].sizeX / 2 + ourPlane.sizeX / 2);
		var ourVerticalCollision = Math.abs(this.segments[i].centerY - ourPlane.centerY) < (this.segments[i].sizeY / 2 + ourPlane.sizeY / 2);
		var checkOurCollision = ourHorizontalCollision && ourVerticalCollision;

		if (checkOurCollision) {
			this.segments[i].hp = 0;
			ourPlane.hp--;
		}

		//检测病毒是否死亡
		if (this.segments[i].hp <= 0) {
			this.segments[i].imgNode.src = this.segments[i].boomSrc;
			this.segments[i].boomTime -= 10;
			// 把病毒干掉
			if (this.segments[i].boomTime <= 0) {
				mainDiv.removeChild(this.segments[i].imgNode);
				this.segments.splice(i, 1);
			}
		}

	}
}


// 实例化所有病毒
var enemies = new Enemy();



//var planeS = new Plane(17, 12, enemyVirusS, 10);
//planeS.draw();
//
//var planeM = new Plane(297, 10, enemyVirusM, 5);
////planeM.draw();

var ourPlane = new Plane(stageSizeX / 2, stageSizeY - ourDoctor.height / 2, ourDoctor, 0);
ourPlane.draw();

function moveOurPlane(ev) {
	// console.log(ev);
	ev.preventDefault()

	if (ev.type == 'touchmove') {
		ev = ev.changedTouches[0]
	}
	ourPlane.centerX = ev.clientX - contentDiv.offsetLeft;
	if (ourPlane.centerX < 0) {
		ourPlane.centerX = 0;
	}
	if (ourPlane.centerX > stageSizeX) {
		ourPlane.centerX = stageSizeX;
	}
	ourPlane.centerY = ev.clientY - contentDiv.offsetTop;
	if (ourPlane.centerY < 0) {
		ourPlane.centerY = 0;
	}
	if (ourPlane.centerY > (stageSizeY - ourPlane.sizeY / 2)) {
		ourPlane.centerY = (stageSizeY - ourPlane.sizeY / 2);
	}


	ourPlane.currentX = ourPlane.centerX - ourPlane.sizeX / 2;
	ourPlane.currentY = ourPlane.centerY - ourPlane.sizeY / 2;

	ourPlane.imgNode.style.left = ourPlane.currentX + 'px';
	ourPlane.imgNode.style.top = ourPlane.currentY + 'px';
}
mainDiv.onmousemove = moveOurPlane;
mainDiv.ontouchmove = moveOurPlane;

// 在医生A ourPlane 这个对象里面添加一个数组 用来保存他发射的子弹
ourPlane.segement = []

// 子弹构造函数
var Bullet = Plane;
/*
var Bullet = function (centerX, centerY, bulletModel, speed) {
	this.centerX = centerX;
	this.centerY = centerY;
	this.speed = speed;
	this.imgSrc = bulletModel.imgSrc;
	this.sizeX = bulletModel.width;
	this.sizeY = bulletModel.height;
	
	//定位点
    this.currentX = this.centerX -this.sizeX/2;
    this.currentY = this.centerY -this.sizeY/2;
}

// hua
Bullet.prototype.draw = function () {
	this.imgNode = new Image();
	this.imgNode.src = this.imgSrc;
	this.imgNode.style.top = this.centerY -this.sizeY/2 + 'px';
	this.imgNode.style.left = this.centerX - this.sizeX/2 + 'px';
	mainDiv.appendChild(this.imgNode);
}
// 某个子弹的移动方法
Bullet.prototype.move = function () {
	this.currentY -= this.speed;
	this.imgNode.style.top = this.currentY + 'px';
//	this.checkOverRange();
}

*/
//var b = new Bullet(ourPlane.centerX, ourPlane.centerY - ourPlane.sizeY/2, bulletX, -10);
//b.draw();
function creatNewBullet() {
	ourPlane.newBullet = new Bullet(ourPlane.centerX, ourPlane.centerY - ourPlane.sizeY / 2, bulletX, -10);
	ourPlane.segement.push(ourPlane.newBullet);
	ourPlane.newBullet.draw();

	var a = document.createElement('audio')
	a.src = './asset/images/发射子弹.mp3'
	// document.body.appendChild(a)
	a.volume = 0.4
	a.play()
	// a.onended = function () {
	// 	document.body.removeChild(a)
	// }
}

function moveNewBullet() {
	for (var i = 0; i < ourPlane.segement.length; i++) {
		ourPlane.segement[i].move();
		if (ourPlane.segement[i].isTopRange) {
			mainDiv.removeChild(ourPlane.segement[i].imgNode);
			ourPlane.segement.splice(i, 1);
		}
	}
}
// 排行榜生成方法
var createTr = function(arr){
	//创建
	var list = document.getElementById('tableList');
	//根据数据创建li
	for (var i = 0; i < arr.length; i++) {
		var tr = document.createElement('tr');
		var str = `
		<td>第${i + 1}名</td>
		<td>${arr[i]}</td>
		`;

		tr.innerHTML = str;
		list.appendChild(tr);
	}
}

var table = function () {
	var arrL = [];
	//   获取table
	var arrlist = JSON.parse(localStorage.getItem("pointsTable")).data;
	// 数组排序
	function sortNumber(a, b) {
		return a - b
	}
	var arr = arrlist.sort(sortNumber).reverse();
	// 只展示前十名
	if (arr.length > 10) {
		arrL = arr.slice(0, 10)
		createTr(arrL);
	}else{
		createTr(arr);
	}
	;
	
}

var gameOver = function () {
	ourPlane.imgNode.src = ourPlane.boomSrc;
	clearInterval(timeID);
	settlementDIV.style.display = 'block';
	document.querySelector('p#final-score').innerText = score;

	if (!localStorage.getItem("pointsTable")) {
		localStorage.setItem(
			"pointsTable",
			JSON.stringify({
				data: [score]
			})
		);
		table();
	} else {
		//  localStorage中插入数据
		let array = JSON.parse(localStorage.getItem("pointsTable")).data;
		// if(array.indexOf(String(this.$route.query.id)) == -1){
		array.push(score);
		localStorage.setItem(
			"pointsTable",
			JSON.stringify({
				data: array
			})
		);
		table();
	}

}

var time = 0;


var timeID;
var start = function () {
	//隐藏开始页面
	startDiv.style.display = 'none';
	//显示游戏页面
	mainDiv.style.display = 'block';
	// 
	suspendDiv.style.display = 'none';
	settlementDIV.style.display = 'none';

	timeID = setInterval(function () {
		time++;
		if (time % 50 === 0) {
			enemies.createNewEnemy();
		}
		enemies.moveAllEnemy();

		if (time % 10 === 0) {
			creatNewBullet();
		}
		moveNewBullet();

		if (ourPlane.hp <= 0) {
			gameOver();
		}

	}, 20);
}

var restart = function () {
	window.location.reload();
}

continueDiv.onclick = function (ev) {
	ev.stopPropagation();
	start();
};

mainDiv.onclick = function () {
	clearTimeout(timeID);
	suspendDiv.style.display = 'block';
}