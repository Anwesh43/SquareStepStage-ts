const nodes : number = 5
const lines : number = 8
const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const color : string = "#01579B"
const sizeFactor : number = 2.3
const strokeFactor : number = 90
const lineSizeFactor : number = 0.6

const divideScale : Function = (scale : number, i : number, n : number) : number =>Math.min(1/n, Math.max(0, scale - i/n)) * n
const scaleFactor : Function = (scale : number) : number => Math.floor(scale / scDiv)
const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
      const k = scaleFactor(scale)
      return (1 - k) / a + k / b
}
const updateScale : Function = (scale : number, dir : number, a : number, b : number) => mirrorValue(scale, a, b) * scGap * dir

const drawSSLSNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const gap : number = w / (nodes + 1)
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const size : number = gap / sizeFactor
    context.strokeStyle = color
    context.lineWidth = Math.min(w, h) / strokeFactor
    context.lineCap = 'round'
    const lineSize : number = size * lineSizeFactor
    const offsetX : number = size * 0.9 - lineSize
    const yGap = 2 * size / (lines / 2 + 1)
    context.save()
    context.translate(gap * (i + 1), h/2)
    context.rotate(Math.PI/2 * sc2)
    context.strokeRect(-size, -size, 2 * size, 2 * size)
    for(var j = 0; j < lines; j++) {
        const sc : number = divideScale(sc1, j, lines)
        const x = -size + size * Math.floor(j / 4) + offsetX
        const y =
        context.save()
        context.translate(x, yGap * ((j % 4) + 1))
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(lineSize * sc, 0)
        context.stroke()
        context.restore()
    }
    context.restore()
}

class SquareStackLineStepStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : SquareStackLineStepStage = new SquareStackLineStepStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0
    update(cb : Function) {
        this.scale += updateScale(this.scale, this.dir, lines, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number
    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class SSLSNode {

    next : SSLSNode
    prev : SSLSNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new SSLSNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawSSLSNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SSLSNode {
        var curr : SSLSNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr != null) {
            return curr
        }
        cb()
        return this
    }
}

class SquareStackLineStep {
    root : SSLSNode = new SSLSNode(0)
    curr : SSLSNode = this.root
    dir : number = 1
    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {
    ssls : SquareStackLineStep = new SquareStackLineStep()
    animator : Animator = new Animator()
    render(context : CanvasRenderingContext2D) {
        this.ssls.draw(context)
    }

    handleTap(cb : Function) {
        this.ssls.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.ssls.update(() => {
                    cb()
                    this.animator.stop()
                })
            })
        })
    }
}
