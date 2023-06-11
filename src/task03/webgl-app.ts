import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Earth } from './earth'
import { Airplane } from './airplane'
import { CloudManager } from './cloud-manager'
import { Moon } from './moon'

export class WebGLApp {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private directionalLight: THREE.DirectionalLight
  private ambientLight: THREE.AmbientLight
  private controls: OrbitControls
  private gui: GUI
  private helperGloup: THREE.Group
  private clock: THREE.Clock
  private cloudManager: CloudManager

  private earth: Earth
  private moon: Moon
  private airplainA: Airplane
  private airplainB: Airplane

  // const
  private static AREA_SIZE = 100
  private static AXES_SIZE = 100
  private static EARTH_RADIUS = 24

  private static COLOR = {
    CLEAR: 0xdfdfdf,
    LIGHT: 0xffffff,
    BLUE: 0x0074df,
    GREEN: 0x63b6ac,
    GRAY: 0x798da4,
    YELLO: 0xffcd1a,
    ORANGE: 0xff932e,
  }

  private static get CAMERA() {
    const aspect = window.innerWidth / window.innerHeight
    const scale = 30
    const horizontal = scale * aspect
    const vertiacal = scale
    return {
      SCALE: scale,
      LEFT: -horizontal,
      RIGHT: horizontal,
      TOP: vertiacal,
      BOTTOM: -vertiacal,
      NEAR: -100.0,
      FAR: 1000.0,
      X: 200,
      Y: 50,
      Z: 50,
      TILT: 24,
      LOOK_AT: new THREE.Vector3(0, 0, 0),
    }
  }

  private guiValue: {
    shouldShowHelper: boolean
    wireFrame: boolean
    autoRotate: boolean
    fanSwitchIsOn: boolean
    earthColor: number
    greenColor: number
    moonColor: number
    airplainColor: number
    airplainSubColor: number
  }

  constructor() {
    this.guiValue = {
      shouldShowHelper: false,
      wireFrame: false,
      autoRotate: true,
      fanSwitchIsOn: false,
      earthColor: WebGLApp.COLOR.BLUE,
      greenColor: WebGLApp.COLOR.YELLO,
      moonColor: WebGLApp.COLOR.GRAY,
      airplainColor: WebGLApp.COLOR.YELLO,
      airplainSubColor: WebGLApp.COLOR.ORANGE,
    }

    // dom
    const width = window.innerWidth
    const height = window.innerHeight
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    })
    this.renderer.setClearColor(new THREE.Color(WebGLApp.COLOR.CLEAR))
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // scene
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(WebGLApp.COLOR.CLEAR, 200, 290)

    // camera
    this.camera = new THREE.OrthographicCamera(
      WebGLApp.CAMERA.LEFT,
      WebGLApp.CAMERA.RIGHT,
      WebGLApp.CAMERA.TOP,
      WebGLApp.CAMERA.BOTTOM,
      WebGLApp.CAMERA.NEAR,
      WebGLApp.CAMERA.FAR
    )
    this.camera.position.set(
      WebGLApp.CAMERA.X,
      WebGLApp.CAMERA.Y,
      WebGLApp.CAMERA.Z
    )
    this.camera.rotation.y = THREE.MathUtils.degToRad(WebGLApp.CAMERA.TILT)
    this.camera.lookAt(WebGLApp.CAMERA.LOOK_AT)

    // light
    this.directionalLight = new THREE.DirectionalLight(
      WebGLApp.COLOR.LIGHT,
      1.0
    )
    this.directionalLight.position.set(20.0, 10.0, -10.0)
    this.ambientLight = new THREE.AmbientLight(WebGLApp.COLOR.LIGHT, 0.5)
    const ambientLight2 = new THREE.AmbientLight(WebGLApp.COLOR.ORANGE, 0.6)
    this.scene.add(this.ambientLight, this.directionalLight, ambientLight2)

    // helper
    this.helperGloup = new THREE.Group()
    this.helperGloup.add(new THREE.AxesHelper(WebGLApp.AXES_SIZE))
    this.helperGloup.add(
      new THREE.GridHelper(WebGLApp.AREA_SIZE, WebGLApp.AREA_SIZE)
    )
    this.helperGloup.visible = this.guiValue.shouldShowHelper
    this.scene.add(this.helperGloup)

    // 経過時間取得用
    this.clock = new THREE.Clock()

    // controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = this.guiValue.autoRotate
    this.controls.autoRotateSpeed = 1
    this.controls.target = WebGLApp.CAMERA.LOOK_AT

    // gui
    this.gui = new GUI()
    this.gui.close()
    this.gui
      .add(this.guiValue, 'shouldShowHelper')
      .name('show helper')
      .onChange((value: boolean) => {
        this.helperGloup.visible = value
      })
    this.gui
      .add(this.guiValue, 'wireFrame')
      .name('show wireframe')
      .onChange((value: boolean) => {
        this.earth.setWireFrame(value)
        this.moon.setWireFrame(value)
        this.airplainA.setWireFrame(value)
        this.airplainB.setWireFrame(value)
      })
    this.gui
      .add(this.guiValue, 'autoRotate')
      .name('auto rotate')
      .onChange((value: boolean) => {
        this.controls.autoRotate = value
      })
    this.gui
      .addColor(this.guiValue, 'earthColor')
      .name('Earth Color')
      .onChange((value: number) => {
        this.earth.changeEarthColor(value)
      })
    this.gui
      .addColor(this.guiValue, 'greenColor')
      .name('Green Color')
      .onChange((value: number) => {
        this.earth.changeGreenColor(value)
      })
    this.gui
      .addColor(this.guiValue, 'moonColor')
      .name('Moon Color')
      .onChange((value: number) => {
        this.moon.changeColor(value)
      })
    this.gui
      .addColor(this.guiValue, 'airplainColor')
      .name('Airplain Main Color')
      .onChange((value: number) => {
        this.airplainA.changeMainColor(value)
      })
    this.gui
      .addColor(this.guiValue, 'airplainSubColor')
      .name('Airplain Sub Color')
      .onChange((value: number) => {
        this.airplainA.changeSubColor(value)
      })

    // earth
    this.earth = new Earth(this.guiValue.earthColor, this.guiValue.greenColor)
    this.scene.add(this.earth)

    // moon
    this.moon = new Moon(this.guiValue.moonColor)
    this.moon.position.set(0, 0, 100)
    this.scene.add(this.moon)

    // airplain
    this.airplainA = new Airplane(
      this.guiValue.airplainColor,
      this.guiValue.airplainSubColor
    )
    this.airplainB = new Airplane(
      this.guiValue.airplainColor,
      this.guiValue.airplainSubColor
    )
    this.airplainB.changeAxis(new THREE.Vector3(0, 0, -1).normalize())
    this.scene.add(this.airplainA, this.airplainB)

    // cloud manager
    this.cloudManager = new CloudManager(this.scene)
  }

  render() {
    requestAnimationFrame(this.render.bind(this))

    const sec = this.clock.getElapsedTime()

    this.controls.update()

    this.earth.update()
    this.moon.update(sec)

    // 飛行機Aの位置制御
    const s = Math.sin(sec)
    const c = Math.cos(sec)
    const airplainANewPosition = new THREE.Vector3(
      0,
      -s * (WebGLApp.EARTH_RADIUS + 2),
      c * (WebGLApp.EARTH_RADIUS + 2)
    )
    this.airplainA.update(airplainANewPosition)

    // 飛行機Bの位置制御
    const airplainBNewPosition = new THREE.Vector3(
      c * (WebGLApp.EARTH_RADIUS + 2),
      0,
      s * (WebGLApp.EARTH_RADIUS + 2)
    )
    this.airplainB.update(airplainBNewPosition)

    // 煙の制御
    if (Math.random() < 0.3) {
      this.cloudManager.createCloud(this.airplainA.position)
      this.cloudManager.createCloud(this.airplainB.position)
    }

    this.renderer.render(this.scene, this.camera)
  }

  public resizeRenderer() {
    if (!this.renderer) return
    const width = window.innerWidth
    const height = window.innerHeight

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    const aspect = window.innerWidth / window.innerHeight
    const scale = WebGLApp.CAMERA.SCALE
    const horizontal = scale * aspect
    const vertiacal = scale
    this.camera.left = -horizontal
    this.camera.right = horizontal
    this.camera.top = vertiacal
    this.camera.bottom = -vertiacal
    this.camera.updateProjectionMatrix()
  }
}
