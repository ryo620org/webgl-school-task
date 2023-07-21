export class App {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private program?: WebGLProgram

  private position: number[] = []
  private positionStride: number = 3
  private positionVBO?: WebGLBuffer
  private color: number[] = []
  private colorStride: number = 3
  private colorVBO?: WebGLBuffer

  private uniformLocation: {
    time: WebGLUniformLocation
  } = { time: 0 }

  private startTime = 0

  // 多角形の角の数
  private ANGLE_COUNT = 5
  // 多角形の半径
  private RADIUS = 0.5
  // クリアカラー
  private CLEAR_COLOR = {
    r: 0.9,
    g: 0.0,
    b: 0.1,
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
        const vertexShaderResponse = await fetch('./shader/vertex-shader.vert')
        const vertexShaderSource = await vertexShaderResponse.text()
        const vertexShader = this.createShaderObject(
          vertexShaderSource,
          this.gl.VERTEX_SHADER
        )
        const fragmentShaderResponse = await fetch(
          './shader/fragment-shader.frag'
        )
        const fragmentShaderSource = await fragmentShaderResponse.text()
        const fragmentShader = this.createShaderObject(
          fragmentShaderSource,
          this.gl.FRAGMENT_SHADER
        )
        this.program = this.createProgramObject(vertexShader, fragmentShader)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 多角形の頂点情報をVBOに入れて、GPUと連携する
  initGeometry() {
    // 必要なポリゴン数
    for (let i = 0; i < this.ANGLE_COUNT - 2; i++) {
      this.position.push(this.RADIUS, 0.0, 0.0)
      const x1 =
        Math.cos(((2 * Math.PI) / this.ANGLE_COUNT) * (i + 1)) * this.RADIUS
      const y1 =
        Math.sin(((2 * Math.PI) / this.ANGLE_COUNT) * (i + 1)) * this.RADIUS
      this.position.push(x1, y1, 0.0)
      const x2 =
        Math.cos(((2 * Math.PI) / this.ANGLE_COUNT) * (i + 2)) * this.RADIUS
      const y2 =
        Math.sin(((2 * Math.PI) / this.ANGLE_COUNT) * (i + 2)) * this.RADIUS
      this.position.push(x2, y2, 0.0)
    }
    this.positionVBO = this.createVBO(this.position)

    // 頂点属性として色を追加しVBOに入れる
    this.color = [
      0,
      1,
      1, // A
      1,
      0,
      0, // B
      0,
      0,
      1, // C
      0,
      1,
      1, // A
      0,
      0,
      1, // C
      0,
      1,
      0, // D
      0,
      1,
      1, // A
      0,
      1,
      0, // D
      1,
      1,
      0, // E
    ]
    this.colorVBO = this.createVBO(this.color)

    if (!this.program) throw new Error('program is null')

    const attPosition = this.gl.getAttribLocation(this.program, 'position')
    this.enableAttribute(this.positionVBO, attPosition, this.positionStride)

    const attColor = this.gl.getAttribLocation(this.program, 'color')
    this.enableAttribute(this.colorVBO, attColor, this.colorStride)

    const timeLocation = this.gl.getUniformLocation(this.program, 'time')
    if (!timeLocation) throw new Error('timeLocation is null')
    this.uniformLocation.time = timeLocation
  }

  // レンダリング
  render() {
    if (!this.program || !this.uniformLocation) return

    requestAnimationFrame(this.render.bind(this))

    const nowTime = (Date.now() - this.startTime) * 0.001

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.gl.clearColor(
      this.CLEAR_COLOR.r,
      this.CLEAR_COLOR.g,
      this.CLEAR_COLOR.b,
      1.0
    )
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    this.gl.useProgram(this.program)
    this.gl.uniform1f(this.uniformLocation.time, nowTime)

    this.gl.drawArrays(
      this.gl.TRIANGLES,
      0,
      this.position.length / this.positionStride
    )
  }

  private createShaderObject(source: string, type: number): WebGLShader {
    const shader = this.gl.createShader(type)
    if (!shader) throw new Error('shader is null')

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
      throw new Error('compile failed')

    return shader
  }

  private createProgramObject(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram()
    if (!program) throw new Error('program is null')

    this.program = program

    this.gl.attachShader(this.program, vertexShader)
    this.gl.attachShader(this.program, fragmentShader)
    this.gl.linkProgram(this.program)
    this.gl.deleteShader(vertexShader)
    this.gl.deleteShader(fragmentShader)

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS))
      throw new Error('program attach failed')

    return this.program
  }

  private createVBO(vertexArray: number[]): WebGLBuffer {
    const vbo = this.gl.createBuffer()
    if (!vbo) throw new Error('buffer is null')

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertexArray),
      this.gl.STATIC_DRAW
    )
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)

    return vbo
  }

  private enableAttribute(
    vbo: WebGLBuffer,
    attLocation: number,
    attStride: number
  ): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
    this.gl.enableVertexAttribArray(attLocation)
    this.gl.vertexAttribPointer(
      attLocation,
      attStride,
      this.gl.FLOAT,
      false,
      0,
      0
    )
  }
}
