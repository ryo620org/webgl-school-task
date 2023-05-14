import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as THREE from 'three'
import gsap from 'gsap'

export class App {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private directionalLight: THREE.DirectionalLight
  private ambientLight: THREE.AmbientLight
  private controls: OrbitControls

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
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100.0)
    this.camera.position.set(12.0, 12.0, 12.0)
    this.camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))

    // ディレクションライト（拡散光）
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    this.directionalLight.position.set(1.0, 1.0, 1.0)
    this.scene.add(this.directionalLight)

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(this.ambientLight)

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.5

    // メッシュ生成
    const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    const material = new THREE.MeshPhongMaterial({
      color: 0xfc6668,
    })
    for (let i = 0; i < 200; i++) {
      const rotateBox = this.getRotateBox(geometry, material)
      rotateBox.position.set(
        Math.random() * 40.0 - 20.0,
        0,
        Math.random() * 40.0 - 20.0
      )
      this.scene.add(rotateBox)
    }

    // リサイズ購読
    window.addEventListener('resize', this.handleResize.bind(this), false)
  }

  public render() {
    requestAnimationFrame(this.render.bind(this))
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private getRotateBox(geo: THREE.BoxGeometry, mat: THREE.MeshPhongMaterial) {
    const boxContainer = new THREE.Object3D()
    const box = new THREE.Mesh(geo, mat)
    box.position.set(0, 0.5, -0.5)
    boxContainer.add(box)

    const speed = Math.random() * 0.4 + 0.1
    gsap.to(boxContainer.rotation, {
      duration: speed,
      x: Math.PI / 2,
      repeat: -1,
      ease: 'sine',
      onRepeat: () => {
        boxContainer.position.z += 1
        if (boxContainer.position.z > 20) {
          boxContainer.position.z = -20
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

  public showHelper() {
    const axesSize = 10
    this.scene.add(new THREE.AxesHelper(axesSize))
    const gridSize = 20
    const divisions = 10
    this.scene.add(new THREE.GridHelper(gridSize, divisions))
  }
}
