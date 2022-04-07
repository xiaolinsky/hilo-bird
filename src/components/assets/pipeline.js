/**
 * @author Sky Lin
 * @date 2019/12/17
 */
import Hilo from '@/assets/plugin/hilo-standalone/index'

const { Container, Tween, Bitmap } = Hilo
export default class Pipeline extends Container {
  constructor(props) {
    super(props)
    //管子之间的水平间隔
    this.hoseSpacingX = 300
    //上下管子之间的垂直间隔，即小鸟要穿越的空间大小
    this.hoseSpacingY = 290
    //管子的总数（上下一对管子算一个）
    this.numHoses = 4
    //移出屏幕左侧的管子数量，一般设置为管子总数的一半
    this.numOffscreenHoses = this.numHoses * 0.5
    //管子的宽度（包括管子之间的间隔）
    this.hoseWidth = 148 + this.hoseSpacingX

    //初始化障碍的宽和高
    this.width = this.hoseWidth * this.numHoses
    this.height = props.height

    this.startX = props.startX || 300 //障碍开始的起始x轴坐标
    this.groundY = props.groundY //地面的y轴坐标
    this.passThrough = 0 //穿过的管子的数量，也即移出屏幕左侧的管子的数量

    this.reset()
    this.createHoses(props.image)
    this.moveTween = new Tween(this, null, {
      onComplete: this.resetHoses.bind(this)
    })
  }

  createHoses(image) {
    for (let i = 0; i < this.numHoses; i++) {
      const downHose = new Bitmap({
        id: 'down' + i,
        image: image,
        rect: [0, 0, 148, 820],
        boundsArea: [
          { x: 8, y: 0 },
          { x: 140, y: 0 },
          { x: 140, y: 60 },
          { x: 136, y: 60 },
          { x: 136, y: 820 },
          { x: 14, y: 820 },
          { x: 14, y: 60 },
          { x: 8, y: 60 }
        ]
      }).addTo(this)

      const upHose = new Bitmap({
        id: 'up' + i,
        image: image,
        rect: [148, 0, 148, 820],
        boundsArea: [
          { x: 14, y: 0 },
          { x: 140, y: 0 },
          { x: 140, y: 820 - 60 },
          { x: 144, y: 820 - 60 },
          { x: 144, y: 820 },
          { x: 8, y: 820 },
          { x: 8, y: 820 - 60 },
          { x: 14, y: 820 - 60 }
        ]
      }).addTo(this)

      this.placeHose(downHose, upHose, i)
    }
  }

  placeHose(down, up, index) {
    //下面障碍在y轴的最上的位置
    const downMinY = this.groundY - down.height + this.hoseSpacingY
    //下面障碍在y轴的最下的位置
    const downMaxY = this.groundY - 180
    //在downMinY和downMaxY之间随机位置
    down.y = (downMinY + (downMaxY - downMinY) * Math.random()) >> 0
    down.x = this.hoseWidth * index

    up.y = down.y - this.hoseSpacingY - up.height
    up.x = down.x
  }

  resetHoses() {
    const total = this.children.length

    //把已移出屏幕外的管子放到队列最后面，并重置它们的可穿越位置
    for (let i = 0; i < this.numOffscreenHoses; i++) {
      const downHose = this.getChildAt(0)
      const upHose = this.getChildAt(1)
      this.setChildIndex(downHose, total - 1)
      this.setChildIndex(upHose, total - 1)
      this.placeHose(downHose, upHose, this.numOffscreenHoses + i)
    }

    //重新确定队列中所有管子的x轴坐标
    for (let i = 0; i < total - this.numOffscreenHoses * 2; i++) {
      const hose = this.getChildAt(i)
      hose.x = this.hoseWidth * ((i * 0.5) >> 0)
    }

    //重新确定障碍的x轴坐标
    this.x = 0

    //更新穿过的管子数量
    this.passThrough += this.numOffscreenHoses

    //继续移动
    this.startMove()
    Tween._tweens.push(this.moveTween)
  }

  startMove() {
    //设置缓动的x轴坐标
    const targetX = -this.hoseWidth * this.numOffscreenHoses
    //设置缓动时间
    this.moveTween.duration = (this.x - targetX) * 4
    //设置缓动的变换属性，即x从当前坐标变换到targetX
    this.moveTween.setProps({ x: this.x }, { x: targetX })
    //启动缓动动画
    this.moveTween.start()
  }

  stopMove() {
    if (this.moveTween) this.moveTween.pause()
  }

  checkCollision(bird) {
    for (let i = 0, len = this.children.length; i < len; i++) {
      if (bird.hitTestObject(this.children[i], true)) {
        return true
      }
    }
    return false
  }

  calcPassThrough(x) {
    let count = 0

    x = -this.x + x
    if (x > 0) {
      const num = (x / this.hoseWidth + 0.5) >> 0
      count += num
    }
    count += this.passThrough

    return count
  }

  reset() {
    this.x = this.startX
    this.passThrough = 0
  }
}
