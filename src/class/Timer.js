import { increment } from '../config'

export default class Timer {
  // 单位：毫秒
  static #currentTime = 0

  static increment() {
    Timer.#currentTime += increment
  }

  static getCurrentTime() {
    return Timer.#currentTime
  }

  static reset() {
    Timer.#currentTime = 0
  }

  static draw(ctx) {
    // 将timer画到(150, -150)
    ctx.beginPath()
    ctx.font = '20px Arial'
    ctx.fillStyle = '#181818'
    ctx.textAlign = 'center'
    ctx.fillText((Timer.getCurrentTime() / 1000).toFixed(1), 150, -160)
  }
}
