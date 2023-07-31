import { WebGLUtility } from './webgl-utility'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'

export class App {
  public isRender = false
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private program?: WebGLProgram

  private position: number[] = []
  private positionStride: number = 0
  private positionVBO?: WebGLBuffer
  private color: number[] = []
  private colorStride: number = 0
  private colorVBO?: WebGLBuffer

  private uniformLocation: {
    time: WebGLUniformLocation
  } = { time: 0 }

  private startTime = 0

  // 多角形の角の数
  private ANGLE_COUNT = 10
  // 多角形の半径
  private RADIUS = 0.5
  // クリアカラー
  private CLEAR_COLOR = {
    r: 0.3,
    g: 0.3,
    b: 0.3,
  }

  constructor(id: string) {
    const canvas = <HTMLCanvasElement>document.getElementById(id)
    if (!canvas) throw new Error('canvas not found')
    this.canvas = canvas

    const size = Math.min(window.innerWidth, window.innerHeight)
    this.canvas.width = size
    this.canvas.height = size

    const ctx = canvas.getContext('webgl')
    if (ctx === null) throw new Error('context is null')

    this.gl = ctx

    this.startTime = Date.now()
  }

  // 頂点シェーダー、フラグメントシェーダーをテキストファイルとして読み込み、リンクしてプログラムオブジェクトを生成する
  loadShader(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // vs
        const vertexShader = WebGLUtility.createShaderObject(
          this.gl,
          vertex,
          this.gl.VERTEX_SHADER
        )

        // fs
        const fragmentShader = WebGLUtility.createShaderObject(
          this.gl,
          fragment,
          this.gl.FRAGMENT_SHADER
        )

        this.program = WebGLUtility.createProgramObject(
          this.gl,
          vertexShader,
          fragmentShader
        )

        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 多角形の頂点情報をVBOに入れて、GPUと連携する
  initGeometry() {
    if (!this.program) throw new Error('program is null')

    // 必要なポリゴン数
    for (let i = 0; i < this.ANGLE_COUNT; i++) {
      this.position.push(0.0, 0.0, 0.0)
      const radiusA =
        i % 2 === 0 ? this.RADIUS : this.RADIUS * Math.cos(Math.PI / 5) * 0.5
      const x1 = Math.cos(((2 * Math.PI) / this.ANGLE_COUNT) * i) * radiusA
      const y1 = Math.sin(((2 * Math.PI) / this.ANGLE_COUNT) * i) * radiusA
      this.position.push(x1, y1, 0.0)

      const radiusB =
        i % 2 !== 0 ? this.RADIUS : this.RADIUS * Math.cos(Math.PI / 5) * 0.5
      const x2 =
        Math.cos(((2 * Math.PI) / this.ANGLE_COUNT) * (i + 1)) * radiusB
      const y2 =
        Math.sin(((2 * Math.PI) / this.ANGLE_COUNT) * (i + 1)) * radiusB
      this.position.push(x2, y2, 0.0)
    }
    this.positionStride = 3
    this.positionVBO = WebGLUtility.createVBO(this.gl, this.position)

    const attPosition = this.gl.getAttribLocation(this.program, 'position')
    WebGLUtility.enableAttribute(
      this.gl,
      this.positionVBO,
      attPosition,
      this.positionStride
    )

    // 頂点属性として色を追加しVBOに入れる
    for (let i = 0; i < this.ANGLE_COUNT; i++) {
      this.color.push(1.0, 1.0, 1.0)
      this.color.push(1.0, 1.0, 0.0)
      this.color.push(1.0, 0.98, 0.0)
    }

    this.colorStride = 3
    this.colorVBO = WebGLUtility.createVBO(this.gl, this.color)

    const attColor = this.gl.getAttribLocation(this.program, 'color')
    WebGLUtility.enableAttribute(
      this.gl,
      this.colorVBO,
      attColor,
      this.colorStride
    )

    const timeLocation = this.gl.getUniformLocation(this.program, 'time')
    if (!timeLocation) throw new Error('timeLocation is null')
    this.uniformLocation.time = timeLocation
  }

  setupRendering() {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(
      this.CLEAR_COLOR.r,
      this.CLEAR_COLOR.g,
      this.CLEAR_COLOR.b,
      1.0
    )
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  // レンダリング
  render() {
    if (!this.program || !this.uniformLocation) return

    if (this.isRender === true) {
      requestAnimationFrame(this.render.bind(this))
    }

    this.setupRendering()

    const nowTime = (Date.now() - this.startTime) * 0.001

    this.gl.useProgram(this.program)
    this.gl.uniform1f(this.uniformLocation.time, nowTime)

    this.gl.drawArrays(
      this.gl.TRIANGLES,
      0,
      this.position.length / this.positionStride
    )
  }
}
