/**
 * 游戏主文件
 */
import Hilo from '@/assets/plugin/hilo-standalone/index'
import Asset from '@/components/assets/asset'
import Bird from '@/components/assets/bird'
import ReadyScene from '@/components/assets/ready-scene'
import GameOverScene from '@/components/assets/game-over-scene'
import Pipeline from '@/components/assets/pipeline'

const { Ticker, Stage, Tween, Bitmap, BitmapText, event } = Hilo

export default {
  name: 'game',
  data() {
    return {
      resources: [
        { id: 'bg', src: 'images/bg.png' },
        { id: 'ground', src: 'images/ground.png' },
        { id: 'ready', src: 'images/ready.png' },
        { id: 'over', src: 'images/over.png' },
        { id: 'number', src: 'images/number.png' },
        { id: 'bird', src: 'images/bird.png' },
        { id: 'pipeline', src: 'images/pipeline.png' }
      ],
      asset: null,
      containerWidth: 375,
      containerHeight: 667,
      scale: 0.5,
      stage: null,
      ticker: null,
      state: 'ready',// 游戏状态:1.ready(准备就绪);2.playing(游戏中);3.over(游戏结束)
      gameReadyScene: null,
      gameOverScene: null,
      currentScore: null,
      score: 0,
      ground: null, // 地板
      pipeline: null // 管道障碍物
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      this.initContainerSize()
      const { containerWidth, containerHeight, scale } = this

      // 加载静态资源
      this.initAssets(() => {
        /**
         * 初始化舞台
         */
        this.initStage(containerWidth, containerHeight, scale)
        const { stage } = this
        document.body.appendChild(stage.canvas)


        /**
         * 初始化：
         * 1.背景
         * 2.场景
         * 3.小鸟
         * 4.管道障碍物
         * 5.当前分数
         * 6.游戏界面的点击事件
         * 7.游戏进入准备状态
         */
        this.initBackground()
        this.initScenes()
        this.initBird()
        this.initPipeline()
        this.initCurrentScore()
        this.initTouchEvent()
        this.gameReady()

        /**
         * 初始化渲染定时器
         */
        this.initTicker(stage)
      })
    },
    initContainerSize() {
      this.containerWidth = Math.min(window.innerWidth, 450) * 2
      this.containerHeight = Math.min(window.innerHeight, 750) * 2
    },
    /**
     * 初始化舞台
     * @param containerWidth
     * @param containerHeight
     * @param scale
     */
    initStage(containerWidth, containerHeight, scale) {
      const stage = new Stage({
        renderType: 'canvas',
        container: document.body,
        width: containerWidth,
        height: containerHeight,
        scaleX: scale,
        scaleY: scale
      })
      stage.canvas.style.zIndex = 100
      stage.onUpdate = this.onUpdate.bind(this)
      this.stage = stage

      this.initOnresize(containerWidth, containerHeight, scale)
    },
    onUpdate() {
      const { state, bird, pipeline, currentScore } = this
      if (state === 'ready') {
        return
      }

      if (bird.isDead) {
        this.gameOver()
      }

      currentScore.setText(this.calcScore())
      // 碰撞检测
      if (pipeline.checkCollision(bird)) {
        this.gameOver()
      }
    },
    /**
     * 设备尺寸变化时，重新初始化舞台尺寸
     * @param containerWidth
     * @param containerHeight
     * @param scale
     */
    initOnresize(containerWidth, containerHeight, scale) {
      const { stage } = this
      window.onresize = () => {
        stage.scaleX = scale
        stage.scaleY = scale
        stage.resize(containerWidth, containerHeight, true)
      }
    },
    /**
     * 加载静态资源
     */
    initAssets(callback) {
      const asset = new Asset(this.resources)
      asset.on('complete', () => {
        asset.off('complete')
        callback()
      })
      asset.load()
      this.asset = asset
    },
    /**
     * 初始化渲染定时器
     * @param stage
     */
    initTicker(stage) {
      //设定舞台刷新频率为60fps
      const ticker = new Ticker(60)
      ticker.addTick(Tween)
      //把舞台加入到tick队列
      ticker.addTick(stage)
      //启动ticker
      ticker.start(true)
      this.ticker = ticker
    },
    /**
     * 初始化背景图
     */
    initBackground() {
      const { containerHeight, asset, stage } = this

      /**
       * 插入地板背景图
       */
      const ground = new Bitmap({
        id: 'ground',
        image: asset.loadedResourceObj.ground
      }).addTo(stage)

      //放置地面在舞台的最底部
      ground.y = containerHeight - ground.height

      //循环移动地面
      Tween.to(ground, { x: -60 }, { duration: 300, loop: true })

      this.ground = ground
    },
    initBird() {
      const { containerHeight, asset, stage, ground } = this
      const startY = containerHeight >> 1
      const depth = 9 //地板的z-index是10，死亡的小鸟要放在地板背后
      this.bird = new Bird({
        id: 'bird',
        atlas: asset.loadedResourceObj.birdAtlas,
        startX: 100,
        startY: startY,
        groundY: ground.y - 12
      }).addTo(stage, depth)
    },
    /**
     * 初始化场景
     */
    initScenes() {
      const { containerWidth, containerHeight, asset, stage } = this
      //准备场景
      const gameReadyScene = new ReadyScene({
        id: 'readyScene',
        width: containerWidth,
        height: containerHeight,
        image: asset.loadedResourceObj.ready,
        visible: false
      }).addTo(stage)
      this.gameReadyScene = gameReadyScene

      //准备场景
      const gameOverScene = new GameOverScene({
        id: 'gameOverScene',
        width: containerWidth,
        height: containerHeight,
        image: asset.loadedResourceObj.over,
        numberGlyphs: asset.loadedResourceObj.numberGlyphs,
        visible: false
      }).addTo(stage)

      //绑定开始按钮事件
      const startBtn = gameOverScene.getChildById('start')
      startBtn.on(event.POINTER_START, (e) => {
          e.stopImmediatePropagation && e.stopImmediatePropagation()
          this.gameReady()
        }
      )
      this.gameOverScene = gameOverScene
    },
    /**
     * 绑定交互事件
     */
    initTouchEvent() {
      const { stage } = this
      stage.enableDOMEvent(event.POINTER_START, true)
      stage.on(event.POINTER_START, (e) => {
        this.onUserInput(e)
      })
    },
    onUserInput(e) {
      const { state, bird, gameOverScene } = this
      if (state === 'over' || gameOverScene.contains(e.eventTarget)) {
        return
      }
      //启动游戏场景
      if (state === 'ready') {
        this.gameStart()
        return
      }
      //控制小鸟往上飞
      bird.fly()
    },
    /**
     * 准备游戏
     */
    gameReady() {
      this.state = 'ready'
      //重置分数为0
      this.score = 0
      this.currentScore.visible = true
      this.currentScore.setText(this.score)
      //隐藏游戏结束场景
      this.gameOverScene.hide()
      //显示准备场景
      this.gameReadyScene.visible = true
      //重置管道障碍物的位置
      this.pipeline.reset()
      //准备小鸟
      this.bird.getReady()
    },
    /**
     * 开始游戏
     */
    gameStart() {
      const { gameReadyScene, pipeline, bird } = this
      this.state = 'playing'
      /**
       * 小鸟存活之后，才能飞行
       */
      bird.activate()
      bird.fly()

      gameReadyScene.visible = false
      pipeline.startMove()
    },
    /**
     * 游戏结束
     */
    gameOver() {
      const { state, bird, pipeline, currentScore, gameOverScene } = this
      if (state === 'over') {
        return
      }

      //设置当前状态为结束over
      this.state = 'over'
      //停止障碍的移动
      pipeline.stopMove()
      //小鸟跳转到第一帧并暂停，即停止扇动翅膀
      bird.goto(0, true)
      //隐藏屏幕中间显示的分数
      currentScore.visible = false
      //显示结束场景
      gameOverScene.show(this.calcScore(), this.saveBestScore())
    },
    /**
     * 初始化当前分数
     */
    initCurrentScore() {
      //当前分数
      const { containerWidth, asset } = this
      const currentScore = new BitmapText({
        id: 'score',
        glyphs: asset.loadedResourceObj.numberGlyphs,
        textAlign: 'center'
      }).addTo(this.stage)

      //设置当前分数的位置
      currentScore.x = (containerWidth - currentScore.width) >> 1
      currentScore.y = 180
      this.currentScore = currentScore
    },
    calcScore() {
      const { bird } = this
      const count = this.pipeline.calcPassThrough(bird.x)
      this.score = count
      return count
    },
    saveBestScore() {
      const { score } = this
      const bestScore = parseInt(localStorage.getItem('HILO_BIRD_BEST_SCORE')) || 0
      if (score > bestScore) {
        window.localStorage.setItem('HILO_BIRD_BEST_SCORE', score)
      }
      return bestScore
    },
    /**
     * 初始化管道障碍物
     */
    initPipeline() {
      const { asset, containerHeight, containerWidth, ground, stage } = this
      this.pipeline = new Pipeline({
        id: 'pipeline',
        image: asset.loadedResourceObj.pipeline,
        height: containerHeight,
        startX: containerWidth + 200,
        groundY: ground.y
      }).addTo(stage, ground.depth - 1)
    }
  }
}
