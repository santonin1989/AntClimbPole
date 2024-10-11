export default class Pole {
  // 构造函数：定义起始点和长度
  constructor(x, y) {
    this.x = x
    this.y = y
    this.length = 300
  }

  // 绘画：根据当前坐标画矩形
  draw(ctx) {
    ctx.beginPath()
    ctx.rect(this.x, this.y, this.length, 8)
    ctx.fillStyle = '#4E4E4E'
    ctx.fill()
  }
}
