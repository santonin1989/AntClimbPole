import Timer from './Timer'
import { increment } from '../config'

export default class Ant {
  // direction: 1表示向右，-1表示向左，0表示静止
  constructor(x, y, direction = 0, color = '#797979', speed = 5) {
    this.name = x
    this.x = x
    this.y = y
    this.direction = direction
    this.speed = speed
    this.color = color
    this.isOut - false
  }

  _draw(ctx) {
    // 绘画：根据当前坐标画三角形
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + 8, this.y - 30)
    ctx.lineTo(this.x - 8, this.y - 30)
    ctx.fillStyle = this.color
    // 顶部写文字
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(this.name, this.x, this.y - 40)
    // 在顶部写方向
    if (this.direction === 1) {
      ctx.fillText('→', this.x, this.y - 60)
    } else if (this.direction === -1) {
      ctx.fillText('←', this.x, this.y - 60)
    } else {
      ctx.fillText('-', this.x, this.y - 60)
    }
    ctx.fill()
  }

  _move(outCount, keyMoments) {
    const timeDelta = increment / 1000 // 转换为秒
    // 更新位置
    this.x += this.speed * this.direction * timeDelta
    // 边界检测，返回值表示在哪个方向出界
    if (this.x <= 0 || this.x >= 300) {
      // 使用boolean变量isOut来标记是否出界
      // 为什么不从ants数组中删除？因为删除后数组的索引会变化，导致其他蚂蚁的索引也会变化，导致出错
      this.isOut = true
      outCount.value++
      keyMoments.value.push(
        `第${Timer.getCurrentTime() / 1000}秒 蚂蚁 ${this.name} 出界，向${this.direction === 1 ? '右' : '左'}`
      )
    }
  }

  // 依次调用move和draw方法
  update(ctx, outCount, keyMoments) {
    if (this.isOut) return
    this._move(outCount, keyMoments)
    this._draw(ctx)
  }

  // 碰撞检测
  collision(other, keyMoments) {
    if (this.isOut || other.isOut) return
    const deltaX = Math.abs(this.x - other.x)
    if (deltaX < 1 && this.direction !== other.direction) {
      this.direction = -this.direction
      other.direction = -other.direction
      keyMoments.value.push(
        `第${Timer.getCurrentTime() / 1000}秒 蚂蚁 ${this.name} 和 ${other.name} 碰撞`
      )
    }
  }
}
