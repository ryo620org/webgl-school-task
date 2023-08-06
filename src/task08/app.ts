import { WebGLOrbitCamera } from './camera'
import { Geometry, WebGLGeometry } from './geometry'
import { Mat4, Vec3 } from './math'
import { WebGLUtility } from './webgl-utility'
import fragmentSource from './shader/fragment.glsl'
import vertexSource from './shader/vertex.glsl'

export class App {
  private canvas: HTMLCanvasElement
  private gl: WebGLRenderingContext
  private program?: WebGLProgram
  private camera: WebGLOrbitCamera
  private planeGeometry?: Geometry
  private planeVBO?: WebGLBuffer[]
  private planeIBO?: WebGLBuffer

  private attributeLocation: number[] = []
  private attributeStride: number[] = []

  private texture?: WebGLTexture
  private isRight = true // 右向きであるかどうか

  private uniformLocation?: {
    mvpMatrix: WebGLUniformLocation
    normalMatrix: WebGLUniformLocation
    textureUnit: WebGLUniformLocation
  }

  private geoMetoryPosition = {
    x: 0,
    y: 0,
    z: 0,
  }

  private startTime = 0

  // クリアカラー
  private CLEAR_COLOR = {
    r: 0.9,
    g: 0.9,
    b: 0.9,
  }

  constructor(id: string) {
    // canvas の生成
    const canvas = <HTMLCanvasElement>document.getElementById(id)
    if (!canvas) throw new Error('canvas not found')
    this.canvas = canvas

    // webgl context の取得
    const ctx = canvas.getContext('webgl', {
      premultipliedAlpha: false,
    })
    if (ctx === null) throw new Error('context is null')
    this.gl = ctx

    // camera の生成
    this.camera = new WebGLOrbitCamera(this.canvas, {
      distance: 3.0, // Z 軸上の初期位置までの距離
      min: 1.0, // カメラが寄れる最小距離
      max: 10.0, // カメラが離れられる最大距離
      move: 5.0, // 右ボタンで平行移動する際の速度係数
    })
    this.camera.setPoint(Vec3.create(0.0, 1.0, 3.0))

    // リサイズ処理
    this.resize()
    window.addEventListener('resize', this.resize.bind(this), false)

    // カリングフェイス、深度テストのオプション設定
    // this.gl.enable(this.gl.CULL_FACE)
    // this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.enable(this.gl.BLEND)
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

    // 初期時間を取得
    this.startTime = Date.now()
  }

  // canvas をリサイズする
  resize() {
    this.canvas.width = window.innerWidth * 2
    this.canvas.height = window.innerHeight * 2
  }

  // 頂点シェーダー・フラグメントシェーダーを import し、リンクしてプログラムオブジェクトを生成する
  loadShader(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const vertexShader = WebGLUtility.createShaderObject(
          this.gl,
          vertexSource,
          this.gl.VERTEX_SHADER
        )

        const fragmentShader = WebGLUtility.createShaderObject(
          this.gl,
          fragmentSource,
          this.gl.FRAGMENT_SHADER
        )

        // vs と fs をリンクしてプログラムオブジェクトを生成する
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

  loadTexture(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const image = await WebGLUtility.loadImage('./animation-texture.png')
        this.texture = WebGLUtility.createTexture(this.gl, image)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 多角形の頂点情報をVBOに入れて、GPUと連携する
  setupGeometry() {
    if (!this.program) throw new Error('program is null')

    // プレーンジオメトリの情報を取得
    const size = 2.0
    const color = [1.0, 1.0, 1.0, 1.0]
    this.planeGeometry = WebGLGeometry.plane(size, size, color)
    this.planeGeometry.texCoord = [
      0.0, 0.0, 0.125, 0.0, 0.0, 0.125, 0.125, 0.125,
    ]
    // VBO と IBO を生成する
    this.planeVBO = [
      WebGLUtility.createVBO(this.gl, this.planeGeometry.position),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.normal),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.color),
      WebGLUtility.createVBO(this.gl, this.planeGeometry.texCoord), // テクスチャ座標 @@@
    ]
    this.planeIBO = WebGLUtility.createIBO(this.gl, this.planeGeometry.index)
  }

  // location を設定して、shader とのやりとりを可能にする
  setupLocation() {
    if (!this.program) throw new Error('program is null')

    // attribute location の取得
    this.attributeLocation = [
      this.gl.getAttribLocation(this.program, 'position'),
      this.gl.getAttribLocation(this.program, 'normal'),
      this.gl.getAttribLocation(this.program, 'color'),
      this.gl.getAttribLocation(this.program, 'texCoord'), // テクスチャ座標 @@@
    ]
    // attribute のストライド
    this.attributeStride = [
      3, // position
      3, // normal
      4, // color
      2, // uv
    ]

    const mvpMatrix = this.gl.getUniformLocation(this.program, 'mvpMatrix')
    const normalMatrix = this.gl.getUniformLocation(
      this.program,
      'normalMatrix'
    )
    const textureUnit = this.gl.getUniformLocation(this.program, 'textureUnit')

    if (!mvpMatrix) throw new Error('mvpMatrix is null')
    if (!normalMatrix) throw new Error('normalMatrix is null')
    if (!textureUnit) throw new Error('textureUnit is null')

    // uniform location の取得
    this.uniformLocation = {
      mvpMatrix,
      normalMatrix,
      textureUnit,
    }
  }

  setupRendering() {
    // ビューポートを設定する
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    // クリアする色と深度を設定する
    this.gl.clearColor(
      this.CLEAR_COLOR.r,
      this.CLEAR_COLOR.g,
      this.CLEAR_COLOR.b,
      1.0
    )
    this.gl.clearDepth(1.0)

    // 色と深度をクリアする
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
  }

  // レンダリング
  render() {
    if (
      !this.program ||
      !this.uniformLocation ||
      !this.planeVBO ||
      !this.planeIBO ||
      !this.planeGeometry ||
      !this.texture
    )
      return

    // レンダリングのフラグの状態を見て、requestAnimationFrame を呼ぶか決める
    requestAnimationFrame(this.render.bind(this))

    // 現在までの経過時間
    const nowTime = (Date.now() - this.startTime) * 0.001

    // レンダリングのセットアップ
    this.setupRendering()

    // ビュー・プロジェクション座標変換行列
    const v = this.camera.update()
    const fovy = 90
    const aspect = window.innerWidth / window.innerHeight
    const near = 0.1
    const far = 10.0
    const p = Mat4.perspective(fovy, aspect, near, far)
    // 行列を乗算して MVP 行列を生成する（掛ける順序に注意）
    const vp = Mat4.multiply(p, v)

    this.gl.useProgram(this.program)

    // 変換・描画
    // モデル座標変換行列（フラグが立っている場合だけ回転させる）
    const m = Mat4.translate(
      Mat4.identity(),
      Vec3.create(
        this.geoMetoryPosition.x,
        this.geoMetoryPosition.y,
        this.geoMetoryPosition.z
      )
    )
    const mvp = Mat4.multiply(vp, m)
    const normalMatrix = Mat4.transpose(Mat4.inverse(m))

    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)

    // プログラムオブジェクトを選択し uniform 変数を更新する
    this.gl.uniformMatrix4fv(this.uniformLocation.mvpMatrix, false, mvp)
    this.gl.uniformMatrix4fv(
      this.uniformLocation.normalMatrix,
      false,
      normalMatrix
    )

    // texCoord を更新する
    {
      const index = Math.floor(nowTime * 8) % 8
      this.planeGeometry.texCoord = this.isRight
        ? [
            0.0 + 0.125 * index,
            0.0,
            0.125 + 0.125 * index,
            0.0,
            0.0 + 0.125 * index,
            0.125,
            0.125 + 0.125 * index,
            0.125,
          ]
        : [
            0.125 + 0.125 * index,
            0.0,
            0.0 + 0.125 * index,
            0.0,

            0.125 + 0.125 * index,
            0.125,
            0.0 + 0.125 * index,
            0.125,
          ]
      this.planeVBO[3] = WebGLUtility.createVBO(
        this.gl,
        this.planeGeometry.texCoord
      )
    }

    // VBO と IBO を設定し、描画する
    WebGLUtility.enableBuffer(
      this.gl,
      this.planeVBO,
      this.attributeLocation,
      this.attributeStride,
      this.planeIBO
    )
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.planeGeometry.index.length,
      this.gl.UNSIGNED_SHORT,
      0
    )
  }

  move(x: number, y: number) {
    let deltaX = x
    let deltaY = y
    if (Math.abs(deltaX) > 0) this.isRight = deltaX > 0
    if (Math.abs(deltaX) > 0 && Math.abs(deltaY) > 0) {
      deltaX *= 1 / Math.sqrt(2)
      deltaY *= 1 / Math.sqrt(2)
    }
    this.geoMetoryPosition.x += x
    this.geoMetoryPosition.z += y
  }
}
