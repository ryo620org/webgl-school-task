import * as THREE from 'three'
// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module'
import { Gallery } from './gallery'

export class WebGLApp {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private stats: Stats
  private helperGloup: THREE.Group

  private gallery: Gallery

  // const
  private static COLOR = {
    CLEAR: 0xdfdfdf, // 背景色
    LIGHT: 0xffffff,
    BLUE: 0x0074df,
    GREEN: 0x63b6ac,
    GRAY: 0x798da4,
    YELLO: 0xffcd1a,
    ORANGE: 0xff932e,
  } as const

  public static get CAMERA() {
    const aspect = window.innerWidth / window.innerHeight
    return {
      X: -12.0,
      Y: 20.0,
      Z: 30.0,
      FOV: 50.0,
      ASPECT: aspect,
      NEAR: 0.1,
      FAR: 1000.0,
      LOOK_AT: new THREE.Vector3(0, 0, 0),
    } as const
  }

  private static HELPER = {
    AREA_SIZE: 100,
    AXES_SIZE: 100,
  } as const

  private static INITIAL_GUI_VALUE = {
    shouldShowHelper: false,
    wireFrame: false,
    autoRotate: false,
    mainColor: WebGLApp.COLOR.BLUE,
  } as const

  private guiValue: {
    shouldShowHelper: boolean
    wireFrame: boolean
    autoRotate: boolean
    mainColor: number
  }

  constructor() {
    this.guiValue = WebGLApp.INITIAL_GUI_VALUE

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
    this.scene.fog = new THREE.Fog(WebGLApp.COLOR.CLEAR, 20, 70)

    // camera
    this.camera = new THREE.PerspectiveCamera(
      WebGLApp.CAMERA.FOV,
      WebGLApp.CAMERA.ASPECT,
      WebGLApp.CAMERA.NEAR,
      WebGLApp.CAMERA.FAR
    )
    this.camera.position.set(
      WebGLApp.CAMERA.X,
      WebGLApp.CAMERA.Y,
      WebGLApp.CAMERA.Z
    )
    this.camera.lookAt(WebGLApp.CAMERA.LOOK_AT)

    // helper
    this.helperGloup = new THREE.Group()
    this.helperGloup.add(new THREE.AxesHelper(WebGLApp.HELPER.AXES_SIZE))
    this.helperGloup.add(
      new THREE.GridHelper(WebGLApp.HELPER.AREA_SIZE, WebGLApp.HELPER.AREA_SIZE)
    )
    this.helperGloup.visible = this.guiValue.shouldShowHelper
    this.scene.add(this.helperGloup)

    // 絵画ギャラリー
    this.gallery = new Gallery(this.camera)
    this.scene.add(this.gallery)

    this.stats = new Stats()
    // document.body.appendChild(this.stats.dom)
  }

  render() {
    this.stats.begin()
    requestAnimationFrame(this.render.bind(this))
    this.gallery.update()
    this.renderer.render(this.scene, this.camera)
    this.stats.end()
  }

  public resizeRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
