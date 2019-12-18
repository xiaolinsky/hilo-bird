/**
 * @author Sky Lin
 * @date 2019/12/10
 * 小鸟类
 */
import Hilo from '@/assets/plugin/hilo-standalone/index'

const { Sprite, Tween } = Hilo
export default class Bird extends Sprite {
  constructor(props) {
    super(props)
    //添加小鸟精灵动画帧
    this.addFrame(props.atlas.getSprite('bird'))
    //设置小鸟扇动翅膀的频率
    this.interval = 6
    //设置小鸟的中心点位置
    this.pivotX = 43
    this.pivotY = 30

    this.startX = props.startX || 0 //小鸟的起始x坐标
    this.startY = props.startY || 0//小鸟的起始y坐标
    this.x = props.startX || 0 //小鸟的当前x坐标
    this.y = props.startY || 0//小鸟的当前y坐标
    this.groundY = props.groundY || 0 //地面的坐标
    this.gravity = 10 / 1000 * 0.3 //重力加速度
    this.flyHeight = 80 //小鸟每次往上飞的高度
    this.initVelocity = Math.sqrt(2 * this.flyHeight * this.gravity) //小鸟往上飞的初速度

    this.isDead = true //小鸟是否已死亡
    this.isUp = false //小鸟是在往上飞阶段，还是下落阶段
    this.flyStartY = 0 //小鸟往上飞的起始y轴坐标
    this.flyStartTime = 0 //小鸟飞行起始时间
  }

  /**
   * 小鸟准备状态(state=ready)
   */
  getReady() {
    //设置起始坐标
    this.x = this.startX
    this.y = this.startY

    //恢复小鸟飞行角度为平行向前
    this.rotation = 0
    //减慢小鸟精灵动画速率
    this.interval = 6
    //恢复小鸟精灵动画
    this.play()

    //小鸟上下漂浮的动画
    this.tween = Tween.to(this, { y: this.y + 10, rotation: -8 }, { duration: 400, reverse: true, loop: true })
  }

  /**
   * 修改小鸟状态为存活
   */
  activate() {
    this.isDead = false
  }

  /**
   * 小鸟飞行状态(state=playing)
   */
  fly() {
    //减小小鸟精灵动画间隔，加速小鸟扇动翅膀的频率
    this.interval = 3
    //记录往上飞的起始y轴坐标
    this.flyStartY = this.y
    //记录飞行开始的时间
    this.flyStartTime = Date.now()
    //停止之前的缓动动画
    if (this.tween) this.tween.stop()
  }

  /**
   * 更新小鸟飞行过程
   */
  onUpdate() {
    if (this.isDead) {
      return
    }

    //飞行时间
    let time = Date.now() - this.flyStartTime

    //飞行距离
    const distance = this.initVelocity * time - 0.5 * this.gravity * time * time
    //y轴坐标
    const y = this.flyStartY - distance

    /**
     * 小鸟死亡条件：
     * 1.小鸟碰到天花板
     * 2.小鸟碰到地板
     */
    if (y < 30 || y > this.groundY) {
      this.y = this.groundY
      this.isDead = true
      return
    }

    /**
     * 小鸟在合法区域飞行，未死亡：
     * 1.往上飞时，角度上仰20度
     * 2.往下跌落时，角度往下90度
     */
    this.y = y
    if (distance > 0 && !this.isUp) {
      // 1
      this.tween = Tween.to(this, { rotation: -20 }, { duration: 200 })
      this.isUp = true
      return
    }

    // 2
    this.tween = Tween.to(this, { rotation: 90 }, { duration: this.groundY - this.y })
    this.isUp = false
  }
}
