<template>
    <div class="container">
        <div class="control-panel panel">
            <h2>Control Panel</h2>
            <div class="btn-group">
                <el-button :disabled="isBegin" class="btn" type="primary" @click="start">开始</el-button>
                <el-button :disabled="!isBegin" class="btn" type="primary" @click="pause">{{ isPaused ? '继续' : '暂停'
                    }}</el-button>
                <el-button class="btn" type="primary" @click="reset">重置</el-button>
                <el-switch v-model="discolor" size="large" active-text="去色" inactive-text="上色" />
            </div>
            <div @click="showComment = !showComment" class="comment">
                <p class="comment-title">作者有话说！</p>
                <div :style="{ display: showComment ? 'flex' : 'none' }" class="hover-comment-container">
                    <p class="hover-comment">
                        偷偷说，实际上每只蚂蚁爬出杆子的时间只有10种情况：6、10、16、22、28、32、38、44、50、54秒钟
                    </p>
                    <p class="hover-comment">
                        另外，5只蚂蚁全部爬出杆子的时间只有6种情况：28、32、38、44、50、54秒钟
                    </p>
                    <p class="hover-comment">
                        PS：因为JavaScript太菜，所以Key Moments会有最高0.05s的误差
                    </p>
                </div>
            </div>
        </div>
        <canvas id="myCanvas" width="600" height="600" />
        <div class="key-moment panel">
            <h2>Key Moments</h2>
            <ol>
                <li v-for="(moment, index) in keyMoments" :key="index">{{ moment }}</li>
            </ol>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const showComment = ref(false);  // 是否显示作者有话说

const discolor = ref(false);    // 是否去色

let canvas = null;              // canvas 画布

let ctx = null;                 // canvas 画布的上下文

const animationFrameId = ref(null); // 动画帧 ID

const isPaused = ref(false);       // 是否暂停

const isBegin = ref(false);       // 是否开始

let ants = [];                   // 蚂蚁数组

let outAntCount = 0;           // 蚂蚁出杆的数量

const keyMoments = ref([])

const initAnts = [{
    x: 30,
    y: 0,
    direction: 0,
    color: "#CA0000"
}, {
    x: 80,
    y: 0,
    direction: 0,
    color: "#89CA00"
}, {
    x: 110,
    y: 0,
    direction: 0,
    color: "#0099CA"
}, {
    x: 160,
    y: 0,
    direction: 0,
    color: "#4D00CA"
}, {
    x: 250,
    y: 0,
    direction: 0,
    color: "#CA9100"
}];

onMounted(() => {
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    // 移动坐标原点到(150,300)
    ctx.translate(150, 300);

    init();
})

// 初始化画布上的元素
const init = () => {
    // 实例化杆子
    new Pole(0, 0).draw(ctx);
    // 实例化蚂蚁
    ants = [];
    for (let i = 0; i < initAnts.length; i++) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        const color = discolor.value ? "#797979" : initAnts[i].color;
        const ant = new Ant(initAnts[i].x, initAnts[i].y, direction, color);
        ants.push(ant);
        ant.draw(ctx);
    }
}

// 动画
const animate = () => {
    if (outAntCount === ants.length) {
        pause();
    }
    if (isBegin.value && !isPaused.value) {
        console.log("动画");
        animationFrameId.value = requestAnimationFrame(animate);
        clear(ctx);

        // 将timer画到(150, -150)
        ctx.beginPath();
        ctx.font = "20px Arial";
        ctx.fillStyle = "#181818";
        ctx.textAlign = "center";
        ctx.fillText(Timer.getElapsedTime().toFixed(2), 150, -160);

        // 实例化杆子
        const pole = new Pole(0, 0);
        pole.draw(ctx);

        for (let i = 0; i < ants.length; i++) {
            ants[i].update(ctx);
            for (let j = i + 1; j < ants.length; j++) {
                ants[i].collision(ants[j]);
            }
        }
    }
}

// 开始
const start = () => {
    console.log("开始");
    init();
    outAntCount = 0;
    isPaused.value = false;
    isBegin.value = true;
    keyMoments.value = [];
    Timer.start();
    for (let i = 0; i < ants.length; i++) {
        ants[i].startTimer();
    }
    animate();
}

// 暂停
const pause = () => {
    console.log("暂停");
    isPaused.value = !isPaused.value; // 切换暂停和继续的状态
    if (!isPaused.value) {
        for (let i = 0; i < ants.length; i++) {
            ants[i].startTimer();
        }
        Timer.continue();
        animate();
    } else if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId.value = null;
        Timer.stop();
    }
}

// 重置
const reset = () => {
    console.log("重置");
    isPaused.value = false;
    isBegin.value = false;
    if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId.value = null;
    }
    clear(ctx);
    init(); // 重置蚂蚁
}

// 清空画布
const clear = (ctx) => {
    ctx.clearRect(-150, -300, 600, 600); // 清除整个画布
}

class Pole {
    // 构造函数：定义起始点和长度
    constructor(x, y, length = 300) {
        this.x = x;
        this.y = y;
        this.length = length;
    }

    // 绘画：根据当前坐标画矩形
    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.length, 8);
        ctx.fillStyle = "#4E4E4E"
        ctx.fill();
    }
}

class Ant {
    // direction: 1表示向右，-1表示向左，0表示静止
    constructor(x, y, direction = 0, color = "#797979") {
        this.name = x;
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = 5;
        this.color = color;
        this.lastTime = Date.now();
        this.isOut = false;
    }

    draw(ctx) {
        // 绘画：根据当前坐标画三角形
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 8, this.y - 30);
        ctx.lineTo(this.x - 8, this.y - 30);
        ctx.fillStyle = this.color;
        // 顶部写文字
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.name, this.x, this.y - 40);
        // 再顶部写方向
        if (this.direction === 1) {
            ctx.fillText("→", this.x, this.y - 60);
        } else if (this.direction === -1) {
            ctx.fillText("←", this.x, this.y - 60);
        } else {
            ctx.fillText("-", this.x, this.y - 60);
        }
        ctx.fill();
    }

    move() {
        // 获取当前时间
        const currentTime = Date.now();
        // 计算时间差（毫秒）
        const timeDelta = (currentTime - this.lastTime) / 1000; // 转换为秒
        // 更新位置
        this.x += this.speed * this.direction * timeDelta;
        // console.log(`蚂蚁 ${this.name} 移动 ${this.speed * this.direction * timeDelta} 距离`);
        // 更新最后时间
        this.lastTime = currentTime;
        // 边界检测，返回值表示在哪个方向出界
        if (this.x < 0) {
            this.isOut = true;
            keyMoments.value.push(`第${Timer.getElapsedTime().toFixed(0)}秒 蚂蚁 ${this.name} 出界，向左`);
            outAntCount++;
        } else if (this.x > 300) {
            this.isOut = true;
            keyMoments.value.push(`第${Timer.getElapsedTime().toFixed(0)}秒 蚂蚁 ${this.name} 出界，向右`);
            outAntCount++;
        }
    }

    update(ctx) {
        if (this.isOut) return;
        this.move()
        this.draw(ctx)
    }

    collision(other) {
        if (this.isOut || other.isOut) return;
        const deltaX = Math.abs(this.x - other.x);
        if (deltaX < 0.2 && this.direction !== other.direction) {
            this.direction = -this.direction;
            other.direction = -other.direction;
            // console.log(`蚂蚁 ${this.name} 和 ${other.name} 碰撞`);
            keyMoments.value.push(`第${Timer.getElapsedTime().toFixed(0)}秒 蚂蚁 ${this.name} 和 ${other.name} 碰撞`);
        }
    }

    startTimer() {
        this.lastTime = Date.now();
    }
}

class Timer {
    static #startTime = null;
    static #stopTime = null;

    static start() {
        Timer.#startTime = Date.now();
    }

    static getElapsedTime() {
        if (Timer.#startTime === null) {
            return 0;
        }
        const elapsedTime = (Date.now() - Timer.#startTime) / 1000;
        return elapsedTime;
    }

    static stop() {
        // 记录停止时间
        Timer.#stopTime = Date.now();
    }

    static continue() {
        // 继续计时
        Timer.#startTime += Date.now() - Timer.#stopTime;
    }
}
</script>

<style scoped lang="less">
.container {
    width: 88%;
    min-width: 1040px;
    height: 600px;
    background-color: rgb(255, 250, 244);
    display: flex;
    flex-direction: row;

    .panel {
        width: calc(50% - 300px);
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
    }

    .control-panel {
        h2 {
            margin-bottom: 20px;
        }

        .btn-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 20px;
        }

        .btn {
            margin-left: 0;
        }

        .comment {
            margin-top: 40px;
            width: 100px;
            height: 36px;
            border-radius: 4px;
            border: 1px solid #409eff;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            cursor: pointer;

            .comment-title {
                font-size: 14px;
                color: #075cb1;
                user-select: none;
            }

            .hover-comment-container {
                position: absolute;
                /* 位于父元素右上方 */
                top: 0px;
                right: 0;
                transform: translate(112%, -50%);
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
                padding: 10px;
                z-index: 1;
                width: 280px;
                display: none;
                flex-direction: column;
            }

            .hover-comment {
                font-size: 14px;
                line-height: 1.5;
                color: #666;
                margin-bottom: 12px;
            }
        }
    }

    .key-moment {
        overflow-y: auto;
        padding-bottom: 40px;

        h2 {
            margin-bottom: 20px;
        }

        li {
            margin-bottom: 16px;
        }
    }

    #myCanvas {
        flex-shrink: 0;
        flex-grow: 0;
    }
}

@media screen and (max-width: 1040px) {
    .container {
        flex-direction: column;
        height: auto;
        min-width: 100%;
        width: 100%;
        align-items: center;
        overflow-x: hidden;

        .panel {
            width: 100%;
        }

        .key-moment {
            min-height: 600px;
            overflow-y: visible;
        }

        .control-panel .comment .hover-comment-container {
            /* 位于父元素下方 */
            top: 100%;
            right: 50%;
            transform: translate(50%, 12px);
        }
    }
}
</style>
