import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three'
import gsap from 'gsap'
import GUI from 'lil-gui'

export class App {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private directionalLight: THREE.DirectionalLight
  private ambientLight: THREE.AmbientLight
  private controls: OrbitControls
  private helperContainer: THREE.Object3D
  private material: THREE.MeshPhongMaterial
  private boxArray: THREE.Object3D[] = []
  private visibleBoxCount: number
  private guiValue: {
    shouldShowHelper: boolean
    boxCount: number
    matColor: number
  }

  static BOX_SIZE = 1.0
  static MAX_BOX_COUNT = 200
  static MATERIAL_COLOR = 0xfc6668
  static AREA_SIZE = 40.0

  constructor() {
    const width = window.innerWidth
    const height = window.innerHeight

    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    })
    this.renderer.setClearColor(new THREE.Color(0xdfdfdf))
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // シーン・カメラ
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200.0)
    this.camera.position.set(12.0, 12.0, 12.0)
    this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))

    // ディレクションライト（拡散光）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    this.directionalLight.position.set(1.0, 1.0, 1.0)
    this.scene.add(this.directionalLight)

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(this.ambientLight)

    // カメラ操作
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5

    // メッシュ生成
    const geometry = new THREE.BoxGeometry(
      App.BOX_SIZE,
      App.BOX_SIZE,
      App.BOX_SIZE
    )
    this.material = new THREE.MeshPhongMaterial({
      color: App.MATERIAL_COLOR,
    })

    for (let i = 0; i < App.MAX_BOX_COUNT; i++) {
      const rotateBox = this.getRotateBox(geometry, this.material)
      rotateBox.position.set(
        Math.random() * App.AREA_SIZE - App.AREA_SIZE * 0.5,
        0,
        Math.random() * App.AREA_SIZE - App.AREA_SIZE * 0.5
      )
      this.scene.add(rotateBox)
      this.boxArray.push(rotateBox)
    }

    // GUIコントローラー
    const gui = new GUI()
    this.guiValue = {
      shouldShowHelper: false,
      boxCount: App.MAX_BOX_COUNT,
      matColor: App.MATERIAL_COLOR,
    }
    this.visibleBoxCount = this.guiValue.boxCount

    gui.add(this.guiValue, 'shouldShowHelper')
    gui.add(this.guiValue, 'boxCount', 1, App.MAX_BOX_COUNT, 1)
    gui.addColor(this.guiValue, 'matColor')

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
  }

  public render() {
    requestAnimationFrame(this.render.bind(this))
    this.controls.update()
    this.renderer.render(this.scene, this.camera)

    // ヘルパーの表示・非表示
    if (this.helperContainer.visible !== this.guiValue.shouldShowHelper) {
      this.helperContainer.visible = this.guiValue.shouldShowHelper
    }

    // Boxの表示・非表示
    if (this.visibleBoxCount > this.guiValue.boxCount) {
      const l = this.visibleBoxCount - this.guiValue.boxCount
      for (let i = 0; i < l; i++) {
        this.boxArray[this.visibleBoxCount - 1 - i].visible = false
      }
      this.visibleBoxCount = this.guiValue.boxCount
    } else if (this.visibleBoxCount < this.guiValue.boxCount) {
      const l = this.guiValue.boxCount - this.visibleBoxCount
      for (let i = 0; i < l; i++) {
        this.boxArray[this.visibleBoxCount + i].visible = true
      }
      this.visibleBoxCount = this.guiValue.boxCount
    }

    // 色変更
    this.material.color.set(this.guiValue.matColor)
  }

  private getRotateBox(geo: THREE.BoxGeometry, mat: THREE.MeshPhongMaterial) {
    const boxContainer = new THREE.Object3D()
    const box = new THREE.Mesh(geo, mat)
    box.position.set(0, App.BOX_SIZE * 0.5, App.BOX_SIZE * -0.5)
    boxContainer.add(box)

    const speed = Math.random() * 0.4 + 0.1
    gsap.to(boxContainer.rotation, {
      duration: speed,
      x: Math.PI / 2,
      repeat: -1,
      ease: 'sine',
      onRepeat: () => {
        boxContainer.position.z += App.BOX_SIZE
        if (boxContainer.position.z > App.AREA_SIZE * 0.5) {
          boxContainer.position.x =
            Math.random() * App.AREA_SIZE - App.AREA_SIZE * 0.5
          boxContainer.position.z = -App.AREA_SIZE * 0.5
        }
      },
    })
    return boxContainer
  }

  private handleResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
