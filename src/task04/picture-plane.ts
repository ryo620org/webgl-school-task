import * as THREE from 'three'
import { loadTexture } from './lib/loadTexture'
import type { Picture } from './models/picture'

export class PicturePlane extends THREE.Group {
  private material: THREE.MeshBasicMaterial
  private plane: THREE.Mesh
  public picture: Picture

  constructor(picture: Picture) {
    super()

    this.picture = picture
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })

    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material)
    this.add(this.plane)
    this.loadTexture(this.picture.imageFileName)
  }

  private async loadTexture(fileName: string) {
    const texture = await loadTexture(`/images/${fileName}`)

    texture.colorSpace = THREE.SRGBColorSpace
    this.material.map = texture
    this.material.needsUpdate = true
    const aspectRatio = texture.image.height / texture.image.width
    this.plane.scale.set(10, 10 * aspectRatio, 1)
  }

  public update() {
    const hoge = this.getWorldPosition(new THREE.Vector3())
    this.plane.rotation.z = -hoge.y * 0.02 + 0.2
    this.plane.rotation.y = hoge.y * 0.05 - 0.7
  }
}
