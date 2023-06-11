import * as THREE from 'three'

export class Tree extends THREE.Group {
  constructor(material: THREE.MeshPhongMaterial) {
    super()

    const item = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.6, 4), material)

    // 直立させる
    item.rotation.x = Math.PI / 2

    // 向きをバラけさせる
    item.rotation.y = (Math.random() * Math.PI) / 2
    this.add(item)
  }
}
