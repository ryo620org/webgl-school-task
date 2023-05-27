import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three'
// import GUI from 'lil-gui'
import { Fan } from './fan'

export class App {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private directionalLight: THREE.DirectionalLight
  private ambientLight: THREE.AmbientLight
  private controls: OrbitControls
  private helperContainer: THREE.Object3D
  private fanStageGroup: THREE.Group
  private material: THREE.MeshPhongMaterial
  private fans: Fan[]

  private guiValue: {
    shouldShowHelper: boolean
    wireFrame: boolean
    autoRotate: boolean
    fanSwitchIsOn: boolean
  }

  static AREA_SIZE = 40.0
  static FAN_COUNT = 24
  static FAN_DISTANCE = 12
  static CLEAR_COLOR = 0xdfdfdf
  static get CAMERA_PARAM() {
    const aspect = window.innerWidth / window.innerHeight
    const scale = 8
    const horizontal = scale * aspect
    const vertiacal = scale
    return {
      scale,
      left: -horizontal,
      right: horizontal,
      top: vertiacal,
      bottom: -vertiacal,
      near: -10,
      far: 100.0,
      x: 0.0,
      y: 8.0,
      z: 11.0,
      lookAt: new THREE.Vector3(0.0, 2.0, 0.0),
    }
  }

  constructor() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.guiValue = {
      shouldShowHelper: false,
      wireFrame: false,
      autoRotate: true,
      fanSwitchIsOn: true,
    }

    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    // レンダラー
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    })
    this.renderer.setClearColor(new THREE.Color(App.CLEAR_COLOR))
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // シーン・カメラ
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(App.CLEAR_COLOR, 14, 24)
    this.camera = new THREE.OrthographicCamera(
      App.CAMERA_PARAM.left,
      App.CAMERA_PARAM.right,
      App.CAMERA_PARAM.top,
      App.CAMERA_PARAM.bottom,
      App.CAMERA_PARAM.near,
      App.CAMERA_PARAM.far
    )
    this.camera.position.set(
      App.CAMERA_PARAM.x,
      App.CAMERA_PARAM.y,
      App.CAMERA_PARAM.z
    )
    this.camera.lookAt(App.CAMERA_PARAM.lookAt)

    // ディレクションライト（拡散光）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    this.directionalLight.position.set(-1.0, 3.0, 1.0)
    this.scene.add(this.directionalLight)

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(this.ambientLight)

    // カメラ操作
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target = App.CAMERA_PARAM.lookAt
    this.camera.lookAt(App.CAMERA_PARAM.lookAt)
    this.controls.autoRotate = this.guiValue.autoRotate
    this.controls.autoRotateSpeed = 0.5

    // 扇風機
    this.fans = []
    this.fanStageGroup = new THREE.Group()
    this.scene.add(this.fanStageGroup)
    this.material = new THREE.MeshPhongMaterial({
      color: Fan.MATERIAL_COLOR,
      flatShading: true,
    })
    this.material.wireframe = this.guiValue.wireFrame
    ;[...Array(App.FAN_COUNT)].map((_, i) => {
      const fan = new Fan(this.material)
      const rad = ((360 / App.FAN_COUNT) * i * Math.PI) / 180
      this.fans.push(fan)
      fan.position.set(
        App.FAN_DISTANCE * Math.cos(rad),
        0,
        App.FAN_DISTANCE * Math.sin(rad)
      )
      fan.rotation.y = -rad
      this.fanStageGroup.add(fan)
    })

    // GUIコントローラー
    // const gui = new GUI()
    // gui.add(this.guiValue, 'shouldShowHelper')
    // gui.add(this.guiValue, 'wireFrame')
    // gui.add(this.guiValue, 'autoRotate')
    // gui.add(this.guiValue, 'fanSwitchIsOn')

    // ヘルパー
    this.helperContainer = new THREE.Object3D()

    const axesSize = 10
    this.helperContainer.add(new THREE.AxesHelper(axesSize))

    const gridSize = App.AREA_SIZE
    const divisions = App.AREA_SIZE
    this.helperContainer.add(new THREE.GridHelper(gridSize, divisions))
    this.helperContainer.visible = this.guiValue.shouldShowHelper
    this.scene.add(this.helperContainer)

    // リサイズ購読
    window.addEventListener('resize', this.handleResize.bind(this), false)
    console.log(this.controls)
  }

  public render() {
    requestAnimationFrame(this.render.bind(this))
    this.controls.update()
    this.renderer.render(this.scene, this.camera)

    // ヘルパー表示のON・OFF
    if (this.helperContainer.visible !== this.guiValue.shouldShowHelper) {
      this.helperContainer.visible = this.guiValue.shouldShowHelper
    }
    // ワイヤーフレームのON・OFF
    if (this.material.wireframe !== this.guiValue.wireFrame) {
      this.material.wireframe = this.guiValue.wireFrame
    }
    // オートローテーションのON・OFF
    if (this.controls.autoRotate !== this.guiValue.autoRotate) {
      this.controls.autoRotate = this.guiValue.autoRotate
    }

    this.fans.forEach((fan) => {
      fan.update()

      // 扇風機スイッチのON・OFF
      if (fan.isOn !== this.guiValue.fanSwitchIsOn) {
        fan.isOn = this.guiValue.fanSwitchIsOn
      }
    })
  }

  private handleResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // OrthographicCamera 用のパラメータを求める
    const aspect = window.innerWidth / window.innerHeight
    const scale = App.CAMERA_PARAM.scale
    const horizontal = scale * aspect
    const vertiacal = scale
    this.camera.left = -horizontal
    this.camera.right = horizontal
    this.camera.top = vertiacal
    this.camera.bottom = -vertiacal
    this.camera.updateProjectionMatrix()
  }

  public changeTopView() {
    this.camera.position.set(0, 10, 0)
  }

  public changeFrontView() {
    this.camera.position.set(0, App.CAMERA_PARAM.lookAt.y, 10)
    this.controls.target = App.CAMERA_PARAM.lookAt
    this.camera.lookAt(App.CAMERA_PARAM.lookAt)
  }

  public changeSideView() {
    this.camera.position.set(10, App.CAMERA_PARAM.lookAt.y, 0)
    this.controls.target = App.CAMERA_PARAM.lookAt
    this.camera.lookAt(App.CAMERA_PARAM.lookAt)
  }
}
