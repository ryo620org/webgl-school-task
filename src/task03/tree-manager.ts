import * as THREE from 'three'
import { Tree } from './tree'
import type { Earth } from './earth'

export class TreeManager {
  private earth: Earth
  private trees: Tree[]
  private seaLevel: number
  private material: THREE.MeshPhongMaterial

  constructor(
    earth: Earth,
    seaLevel: number,
    material: THREE.MeshPhongMaterial
  ) {
    this.earth = earth
    this.material = material
    this.seaLevel = seaLevel

    this.trees = []
  }

  createTree(latitudeDeg: number, longitudeDeg: number) {
    const latitudeRad = (Math.PI * latitudeDeg) / 180
    const longitudeRad = (2 * Math.PI * longitudeDeg) / 360

    const x = this.seaLevel * Math.sin(latitudeRad) * Math.cos(longitudeRad)
    const y = this.seaLevel * Math.sin(latitudeRad) * Math.sin(longitudeRad)
    const z = this.seaLevel * Math.cos(latitudeRad)

    const tree = new Tree(this.material)
    tree.position.set(x, y, z)

    // 原点に向ける
    const direction = tree.position.clone().normalize()
    const initialDirection = new THREE.Vector3(0, 0, 1)
    const gtn = new THREE.Quaternion().setFromUnitVectors(
      initialDirection,
      direction
    )
    tree.quaternion.premultiply(gtn)

    this.trees.push(tree)
    this.earth.add(tree)
  }
}
