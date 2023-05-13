import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
    })
    renderer.setClearColor(new THREE.Color(0xdfdfdf))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      20.0
    )
    camera.position.set(0.0, 2.0, 10.0)
    camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0))

    const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0)
    const material = new THREE.MeshPhongMaterial({
      color: 0x0074df,
    })

    const box = new THREE.Mesh(geometry, material)
    scene.add(box)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(1.0, 1.0, 1.0)
    scene.add(directionalLight)

    // アンビエントライト（環境光）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight)

    // コントロール
    const controls = new OrbitControls(camera, renderer.domElement)

    const render = () => {
      // 恒常ループの設定
      requestAnimationFrame(render)

      // コントロールを更新
      controls.update()

      // レンダラーで描画
      renderer.render(scene, camera)
    }

    render()
  },
  false
)
