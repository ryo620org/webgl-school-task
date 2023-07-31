import { WebGLOrbitCamera } from './camera'
import { Geometry, WebGLGeometry } from './geometry'
import { Mat4, Vec3 } from './math'
import { WebGLUtility } from './webgl-utility'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'

export class App {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private program?: WebGLProgram
  private camera: WebGLOrbitCamera
  private torusGeometry?: Geometry
  private torusVBO?: WebGLBuffer[]
  private torusIBO?: WebGLBuffer
  private attributeLocation: number[] = []
  private attributeStride: number[] = []

  public isRender = false

  private isRotation = false

  private uniformLocation?: {
    mvpMatrix: WebGLUniformLocation
    normalMatrix: WebGLUniformLocation
  }

  private startTime = 0

  // クリアカラー
  private CLEAR_COLOR = {
    r: 0.9,
    g: 0.9,
    b: 0.9,
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

    // カメラ制御用インスタンスを生成する
    const cameraOption = {
      distance: 5.0, // Z 軸上の初期位置までの距離
      min: 1.0, // カメラが寄れる最小距離
      max: 10.0, // カメラが離れられる最大距離
      move: 2.0, // 右ボタンで平行移動する際の速度係数
    }
    this.camera = new WebGLOrbitCamera(this.canvas, cameraOption)

    this.resize()
    window.addEventListener('resize', this.resize, false)

    this.gl.enable(this.gl.CULL_FACE)
    this.gl.enable(this.gl.DEPTH_TEST)

    this.startTime = Date.now()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
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
  setupGeometry() {
    if (!this.program) throw new Error('program is null')

    const row = 32
    const column = 32
    const innerRadius = 0.4
    const outerRadius = 0.8
    const color = [1.0, 1.0, 1.0, 1.0]
    this.torusGeometry = WebGLGeometry.torus(
      row,
      column,
      innerRadius,
      outerRadius,
      color
    )

    // VBO と IBO を生成する
    this.torusVBO = [
      WebGLUtility.createVBO(this.gl, this.torusGeometry.position),
      WebGLUtility.createVBO(this.gl, this.torusGeometry.normal),
      WebGLUtility.createVBO(this.gl, this.torusGeometry.color),
    ]
    this.torusIBO = WebGLUtility.createIBO(this.gl, this.torusGeometry.index)
  }

  setupLocation() {
    if (!this.program) throw new Error('program is null')

    const gl = this.gl
    // attribute location の取得
    this.attributeLocation = [
      gl.getAttribLocation(this.program, 'position'),
      gl.getAttribLocation(this.program, 'normal'),
      gl.getAttribLocation(this.program, 'color'),
    ]
    // attribute のストライド
    this.attributeStride = [3, 3, 4]
    const mvpMatrix = gl.getUniformLocation(this.program, 'mvpMatrix')
    const normalMatrix = gl.getUniformLocation(this.program, 'normalMatrix')

    if (!mvpMatrix || !normalMatrix) throw new Error('location is null')
    // uniform location の取得
    this.uniformLocation = {
      mvpMatrix,
      normalMatrix,
    }
  }

  setupRendering() {
    const gl = this.gl
    // ビューポートを設定する
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    // クリアする色と深度を設定する
    gl.clearColor(
      this.CLEAR_COLOR.r,
      this.CLEAR_COLOR.g,
      this.CLEAR_COLOR.b,
      1.0
    )
    gl.clearDepth(1.0)
    // 色と深度をクリアする
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  // レンダリング
  render() {
    if (
      !this.program ||
      !this.uniformLocation ||
      !this.torusVBO ||
      !this.torusIBO ||
      !this.torusGeometry
    )
      return

    // レンダリングのフラグの状態を見て、requestAnimationFrame を呼ぶか決める
    if (this.isRender === true) {
      requestAnimationFrame(this.render.bind(this))
    }

    // 現在までの経過時間
    const nowTime = (Date.now() - this.startTime) * 0.001

    // レンダリングのセットアップ
    this.setupRendering()

    // モデル座標変換行列（フラグが立っている場合だけ回転させる）
    const rotateAxis = Vec3.create(0.0, 1.0, 0.0)
    const m =
      this.isRotation === true
        ? Mat4.rotate(Mat4.identity(), nowTime, rotateAxis)
        : Mat4.identity()

    // ビュー・プロジェクション座標変換行列
    const v = this.camera.update()
    const fovy = 45
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.1
    const far = 10.0
    const p = Mat4.perspective(fovy, aspect, near, far)

    // 行列を乗算して MVP 行列を生成する（掛ける順序に注意）
    const vp = Mat4.multiply(p, v)
    const mvp = Mat4.multiply(vp, m)

    // モデル座標変換行列の、逆転置行列を生成する @@@
    const normalMatrix = Mat4.transpose(Mat4.inverse(m))

    // プログラムオブジェクトを選択し uniform 変数を更新する @@@
    this.gl.useProgram(this.program)
    this.gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, mvp)
    this.gl.uniformMatrix4fv(
      this.uniformLocation.normalMatrix,
      false,
      normalMatrix
    )

    // VBO と IBO を設定し、描画する
    WebGLUtility.enableBuffer(
      this.gl,
      this.torusVBO,
      this.attributeLocation,
      this.attributeStride,
      this.torusIBO
    )

    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.torusGeometry.index.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }

  // バックフェイスカリングを設定する
  setCulling(flag: boolean) {
    const gl = this.gl
    if (gl == null) {
      return
    }
    if (flag === true) {
      gl.enable(gl.CULL_FACE)
    } else {
      gl.disable(gl.CULL_FACE)
    }
  }

  // 深度テストを設定する
  setDepthTest(flag: boolean) {
    const gl = this.gl
    if (gl == null) {
      return
    }
    if (flag === true) {
      gl.enable(gl.DEPTH_TEST)
    } else {
      gl.disable(gl.DEPTH_TEST)
    }
  }

  // isRotation を設定する
  setRotation(flag: boolean) {
    this.isRotation = flag
  }
}
