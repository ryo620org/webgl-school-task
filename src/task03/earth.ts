import * as THREE from 'three'
import { TreeManager } from './tree-manager'

export class Earth extends THREE.Group {
  private earthMaterial: THREE.MeshPhongMaterial
  private greenMaterial: THREE.MeshPhongMaterial

  private treeManager: TreeManager

  constructor(radius: number, earthColor: number, greenColor: number) {
    super()

    this.earthMaterial = new THREE.MeshPhongMaterial({
      color: earthColor,
      flatShading: true,
    })

    this.greenMaterial = new THREE.MeshPhongMaterial({
      color: greenColor,
      flatShading: true,
    })

    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, 2),
      this.earthMaterial
    )
    this.add(sphere)

    this.treeManager = new TreeManager(this, radius + 1.3, this.greenMaterial)
    this.treeManager.createTree(30, 140)
    this.treeManager.createTree(40, 140)

    this.treeManager.createTree(60, 40)
    this.treeManager.createTree(60, 50)
    this.treeManager.createTree(70, 40)

    this.treeManager.createTree(70, -10)
    this.treeManager.createTree(75, -20)

    this.treeManager.createTree(-80, 40)
    this.treeManager.createTree(-80, 50)
    this.treeManager.createTree(-60, 50)

    this.treeManager.createTree(160, 160)
    this.treeManager.createTree(170, 180)
    this.treeManager.createTree(180, 160)
    this.treeManager.createTree(160, 180)

    this.treeManager.createTree(90, 180)
  }

  public update() {
    this.rotation.y += 0.0001
  }

  public setWireFrame(value: boolean) {
    this.earthMaterial.wireframe = value
    this.greenMaterial.wireframe = value
  }

  public changeEarthColor(value: number) {
    this.earthMaterial.color.set(value)
  }
  public changeGreenColor(value: number) {
    this.greenMaterial.color.set(value)
  }
}
