/**
 * @author Sky Lin
 * @date 2019/12/5
 */
import Hilo from '@/assets/plugin/hilo-standalone/index'

const { LoadQueue, TextureAtlas, EventMixin } = Hilo
const { fire, off, on } = EventMixin

export default class Asset {
  constructor(resources) {
    /**
     * 资源类变量
     */
    this.resources = resources
    this.queue = {}
    this.loadedResourceObj = {}
  }

  /**
   * 添加Hilo事件监听方法
   */
  fire = (type, detail) => fire(type, detail)
  off = (type, listener) => off(type, listener)
  on = (type, listener, once) => on(type, listener, once)

  load() {
    const queue = new LoadQueue()
    queue.add(this.resources)
    queue.on('complete', this.onComplete)
    this.queue = queue
    queue.start()
  }

  onComplete = () => {
    const { queue } = this
    const birdAtlas = new TextureAtlas({
      image: queue.get('bird').content,
      frames: [
        [0, 120, 86, 60],
        [0, 60, 86, 60],
        [0, 0, 86, 60]
      ],
      sprites: {
        bird: [0, 1, 2]
      }
    })

    const number = queue.get('number').content
    const numberGlyphs = {
      0: { image: number, rect: [0, 0, 60, 91] },
      1: { image: number, rect: [61, 0, 60, 91] },
      2: { image: number, rect: [121, 0, 60, 91] },
      3: { image: number, rect: [191, 0, 60, 91] },
      4: { image: number, rect: [261, 0, 60, 91] },
      5: { image: number, rect: [331, 0, 60, 91] },
      6: { image: number, rect: [401, 0, 60, 91] },
      7: { image: number, rect: [471, 0, 60, 91] },
      8: { image: number, rect: [541, 0, 60, 91] },
      9: { image: number, rect: [611, 0, 60, 91] }
    }

    this.loadedResourceObj = {
      birdAtlas,
      numberGlyphs,
      ground: queue.get('ground').content,
      bg: queue.get('bg').content,
      ready: queue.get('ready').content,
      over: queue.get('over').content,
      pipeline: queue.get('pipeline').content
    }

    //删除下载队列的complete事件监听
    queue.off('complete')
    //发送complete事件
    this.fire('complete')
  }
}
