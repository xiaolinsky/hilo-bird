/**
 * @author Sky Lin
 * @date 2019/12/10
 * 准备场景
 */
import Hilo from '@/assets/plugin/hilo-standalone/index'

const { Container } = Hilo
export default class ReadyScene extends Container {
  constructor(props) {
    super(props)
    this.init(props)
  }

  init(props) {
    //准备Get Ready!
    const getReady = new Hilo.Bitmap({
      image: props.image,
      rect: [0, 0, 508, 158]
    })

    //开始提示tap
    const tap = new Hilo.Bitmap({
      image: props.image,
      rect: [0, 158, 286, 246]
    })

    //确定getReady和tap的位置
    tap.x = parseInt((this.width - tap.width) / 2)
    tap.y = parseInt((this.height - tap.height + 40) / 2)
    getReady.x = parseInt((this.width - getReady.width) / 2)
    getReady.y = parseInt(tap.y - getReady.height)

    this.addChild(tap, getReady)
  }
}
