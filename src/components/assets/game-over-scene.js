/**
 * @author Sky Lin
 * @date 2019/12/11
 */
import Hilo from '@/assets/plugin/hilo-standalone/index'

const { Container, Bitmap, BitmapText, View, Tween } = Hilo
export default class GameOverScene extends Container {
  constructor(props) {
    super(props)
    this.init(props)
  }

  init(props) {
    //Game Over图片文字
    const gameOver = new Bitmap({
      id: 'gameOver',
      image: props.image,
      rect: [0, 298, 508, 158]
    })

    //结束面板
    const board = new Bitmap({
      id: 'board',
      image: props.image,
      rect: [0, 0, 590, 298]
    })

    //开始按钮
    const startBtn = new Bitmap({
      id: 'start',
      image: props.image,
      rect: [590, 0, 290, 176]
    })

    //等级按钮
    const rankBtn = new Bitmap({
      id: 'rank',
      image: props.image,
      rect: [590, 176, 290, 176]
    })

    //玩家当前分数
    const scoreLabel = new BitmapText({
      id: 'score',
      glyphs: props.numberGlyphs,
      scaleX: 0.5,
      scaleY: 0.5,
      letterSpacing: 4,
      text: 0
    })

    //玩家最好成绩
    const bestLabel = new BitmapText({
      id: 'best',
      glyphs: props.numberGlyphs,
      scaleX: 0.5,
      scaleY: 0.5,
      letterSpacing: 4,
      text: 0
    })

    //白色的遮罩效果
    const whiteMask = new View({
      id: 'mask',
      width: this.width,
      height: this.height,
      alpha: 0,
      background: '#fff'
    })

    board.x = this.width - board.width >> 1
    board.y = this.height - board.height >> 1
    gameOver.x = this.width - gameOver.width >> 1
    gameOver.y = board.y - gameOver.height - 20
    startBtn.x = board.x - 5
    startBtn.y = board.y + board.height + 20 >> 0
    rankBtn.x = startBtn.x + startBtn.width + 20 >> 0
    rankBtn.y = startBtn.y
    scoreLabel.x = board.x + board.width - 140 >> 0
    scoreLabel.y = board.y + 90
    bestLabel.x = scoreLabel.x
    bestLabel.y = scoreLabel.y + 105

    this.addChild(gameOver, board, startBtn, rankBtn, scoreLabel, bestLabel, whiteMask)
  }

  show(score, bestScore) {
    this.visible = true
    this.getChildById('score').setText(score)
    this.getChildById('best').setText(bestScore)
    this.getChildById('mask').alpha = 1

    Tween.to(this.getChildById('gameOver'), { alpha: 1 }, { duration: 100 })
    Tween.to(this.getChildById('board'), { alpha: 1, y: this.getChildById('board').y - 150 }, {
      duration: 200,
      delay: 200
    })
    Tween.to(this.getChildById('score'), { alpha: 1, y: this.getChildById('score').y - 150 }, {
      duration: 200,
      delay: 200
    })
    Tween.to(this.getChildById('best'), { alpha: 1, y: this.getChildById('best').y - 150 }, {
      duration: 200,
      delay: 200
    })
    Tween.to(this.getChildById('start'), { alpha: 1 }, { duration: 100, delay: 600 })
    Tween.to(this.getChildById('rank'), { alpha: 1 }, { duration: 100, delay: 600 })
    Tween.to(this.getChildById('mask'), { alpha: 0 }, { duration: 400 })
  }

  hide() {
    this.visible = false
    this.getChildById('gameOver').alpha = 0
    this.getChildById('board').alpha = 0
    this.getChildById('score').alpha = 0
    this.getChildById('best').alpha = 0
    this.getChildById('start').alpha = 0
    this.getChildById('rank').alpha = 0
    this.getChildById('board').y += 150
    this.getChildById('score').y += 150
    this.getChildById('best').y += 150
  }
}
