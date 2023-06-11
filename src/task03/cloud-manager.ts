import * as THREE from 'three'
import { Cloud } from './cloud'
import gsap from 'gsap'

export class CloudManager {
  private scene: THREE.Scene
  private clouds: Cloud[]

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.clouds = []
  }

  createCloud(position: THREE.Vector3) {
    const cloud = new Cloud()
    cloud.position.set(position.x, position.y, position.z)

    this.clouds.push(cloud)
    this.scene.add(cloud)

    const duration = Math.random() * 2 + 1
    const scale = Math.random() * 0.3 + 0.5
    cloud.scale.set(0, 0, 0)

    const tl = gsap.timeline()

    // どんどん大きく、その後どんどん小さく
    tl.to(cloud.scale, {
      duration: duration * 0.2,
      x: scale,
      y: scale,
      z: scale,
      ease: 'sine',
    }).to(cloud.scale, {
      duration: duration * 0.7,
      x: 0,
      y: 0,
      z: 0,
      ease: 'sine',
      delay: duration * 0.1,
      onComplete: () => {
        this.removeCloud(cloud)
      },
    })

    // どんどん前後左右にズレていく
    const gapX = Math.random() * 3 - 1.5
    const gapY = Math.random() * 3 - 1.5
    const gapZ = Math.random() * 3 - 1.5
    gsap.to(cloud.position, {
      duration,
      x: `+=${gapX}`,
      y: `+=${gapY}`,
      z: `+=${gapZ}`,
      ease: 'power4.out',
    })

    // 適当に回転させる
    gsap.to(cloud.rotation, {
      duration,
      x: gapY * 2,
      y: gapZ * 2,
      z: gapX * 2,
      ease: 'power2.out',
    })
  }

  removeCloud(cloud: Cloud) {
    const index = this.clouds.indexOf(cloud)

    if (index > -1) {
      this.clouds.splice(index, 1)
      this.scene.remove(cloud)
      cloud.dispose()
    }
  }
}
