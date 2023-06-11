import * as THREE from 'three'

export class Cloud extends THREE.Group {
  private item: THREE.Mesh

  constructor() {
    super()

    this.item = new THREE.Mesh(
      new THREE.TetrahedronGeometry(2, 2),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
      })
    )

    this.add(this.item)
  }

  dispose() {
    this.remove(this.item)
    if (Array.isArray(this.item.material)) {
      this.item.material.forEach((material) => material.dispose())
    } else {
      this.item.material.dispose()
    }
    this.item.geometry.dispose()
  }
}
