<template>
  <div class="container">
    <!-- 控制面板 -->
    <div class="control-panel panel">
      <h2>Control Panel</h2>
      <!-- 按钮组 -->
      <div class="btn-group">
        <el-button :disabled="isBegin" class="btn" type="primary" @click="start"
          >开始</el-button
        >
        <el-button
          :disabled="!isBegin"
          class="btn"
          type="primary"
          @click="pause"
          >{{ isPaused ? '继续' : '暂停' }}</el-button
        >
        <el-button class="btn" type="primary" @click="reset">重置</el-button>
        <el-switch
          v-model="discolor"
          size="large"
          active-text="去色"
          inactive-text="上色"
        />
      </div>
      <!-- 自定义速度与初始方向 -->
      <div class="custom-config">
        <!-- 自定义速度 -->
        <div class="speed-config">
          <el-slider
            v-model="customSpeed"
            :min="1"
            :max="10"
            :step="1"
          ></el-slider>
          <p>速度：{{ customSpeed }}</p>
        </div>
        <!-- 初始方向 -->
        <div class="direction-config">
          <el-switch
            v-model="isCustomDirection"
            size="large"
            active-text="自定义方向"
            inactive-text="随机方向"
          />
          <template v-if="isCustomDirection">
            <el-switch
              :disabled="!isCustomDirection"
              v-model="customDirection[0]"
              size="small"
              active-text="30向右"
              inactive-text="30向左"
            />
            <el-switch
              :disabled="!isCustomDirection"
              v-model="customDirection[1]"
              size="small"
              active-text="80向右"
              inactive-text="80向左"
            />
            <el-switch
              :disabled="!isCustomDirection"
              v-model="customDirection[2]"
              size="small"
              active-text="110向右"
              inactive-text="110向左"
            />
            <el-switch
              :disabled="!isCustomDirection"
              v-model="customDirection[3]"
              size="small"
              active-text="160向右"
              inactive-text="160向左"
            />
            <el-switch
              :disabled="!isCustomDirection"
              v-model="customDirection[4]"
              size="small"
              active-text="250向右"
              inactive-text="250向左"
            />
          </template>
        </div>
      </div>
      <!-- 作者有话说 -->
      <!-- <div @click="showComment = !showComment" class="comment">
        <p class="comment-title">作者有话说！</p>
        <div :style="{ display: showComment ? 'flex' : 'none' }" class="hover-comment-container">
          <p class="hover-comment">
            偷偷说，实际上每只蚂蚁爬出杆子的时间只有10种情况：6、10、16、22、28、32、38、44、50、54秒钟
          </p>
          <p class="hover-comment">
            另外，5只蚂蚁全部爬出杆子的时间只有6种情况：28、32、38、44、50、54秒钟
          </p>
        </div>
      </div> -->
    </div>
    <!-- 画布 -->
    <canvas id="myCanvas" width="600" height="600" />
    <!-- 关键时间点 -->
    <div class="key-moment panel">
      <h2>Key Moments</h2>
      <ol>
        <li v-for="(moment, index) in keyMoments" :key="index">{{ moment }}</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { initAnts, increment } from '@/config'
import { Ant, Pole, Timer } from '@/class'

// const showComment = ref(false) // 是否显示作者有话说

const discolor = ref(false) // 是否去色

let canvas = null // canvas 画布
let ctx = null // canvas 画布的上下文

let currentTime = 0 // 当前时间
let lastUpdateTime = 0 // 上一次更新的时间

const isPaused = ref(false) // 是否暂停
const isBegin = ref(false) // 是否开始

let ants = [] // 蚂蚁数组
let outCount = ref(0) // 出杆蚂蚁数

const keyMoments = ref([])

let pole = null // 杆子实例

const customSpeed = ref(5) // 自定义速度

const isCustomDirection = ref(false) // 是否自定义方向
const customDirection = reactive([false, false, false, false, false])

onMounted(() => {
  canvas = document.getElementById('myCanvas')
  ctx = canvas.getContext('2d')
  // 移动坐标原点到(150,300)
  ctx.translate(150, 300)

  _init()
})

// 初始化画布上的元素
const _init = () => {
  // 实例化杆子
  pole = new Pole(0, 0)
  pole.draw(ctx)

  // 确定蚂蚁的初始方向
  let direction = []
  if (isCustomDirection.value) {
    // 将customDirection数组中的值转换为1或-1
    for (let i = 0; i < customDirection.length; i++) {
      direction.push(customDirection[i] ? 1 : -1)
    }
  } else {
    // 否则随机生成
    for (let i = 0; i < customDirection.length; i++) {
      direction.push(Math.random() < 0.5 ? -1 : 1)
    }
  }

  // 清空蚂蚁数组
  ants = []
  // 填充蚂蚁数组
  for (let i = 0; i < initAnts.length; i++) {
    const color = discolor.value ? '#797979' : initAnts[i].color
    const ant = new Ant(
      initAnts[i].x,
      initAnts[i].y,
      direction[i],
      color,
      customSpeed.value
    )
    ants.push(ant)
    ant._draw(ctx)
  }
}

// 动画
const _animate = () => {
  currentTime = performance.now() // 更新当前时间
  if (ants.length === outCount.value) {
    // 全部蚂蚁出杆，停止动画
    pause()
  }
  if (isBegin.value && !isPaused.value) {
    if (currentTime - lastUpdateTime >= increment) {
      // 更新时间
      lastUpdateTime = currentTime
      Timer.increment()

      _clear(ctx)
      Timer.draw(ctx)
      pole.draw(ctx)

      // 更新蚂蚁
      for (let i = 0; i < ants.length; i++) {
        ants[i].update(ctx, outCount, keyMoments)
      }

      // 碰撞检测
      for (let i = 0; i < ants.length; i++) {
        for (let j = i + 1; j < ants.length; j++) {
          ants[i].collision(ants[j], keyMoments)
        }
      }
    }

    // 用setTimeout来控制动画循环
    setTimeout(() => {
      _animate(performance.now()) // 传入当前时间，进行下一次迭代
    }, 0) // 这里设置为0，尽量不阻塞主线程
  }
}

// 开始
const start = () => {
  _init()
  outCount.value = 0
  isPaused.value = false
  isBegin.value = true
  keyMoments.value = []
  Timer.reset()
  _animate()
}

// 暂停
const pause = () => {
  isPaused.value = !isPaused.value // 切换暂停和继续的状态
  if (!isPaused.value) {
    _animate()
  }
}

// 重置
const reset = () => {
  outCount.value = 0
  isPaused.value = false
  isBegin.value = false
  Timer.reset()
  _clear(ctx)
  _init()
}

// 清空画布
const _clear = (ctx) => {
  ctx.clearRect(-150, -300, 600, 600) // 清除整个画布
}
</script>

<style scoped lang="less">
.container {
  width: 88%;
  min-width: 1040px;
  height: 640px;
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
      margin-top: 32px;
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

.direction-config,
.speed-config {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 8px;
  margin-top: 12px;
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
