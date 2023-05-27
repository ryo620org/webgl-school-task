import * as THREE from 'three'

export class Fan extends THREE.Group {
  public isOn: boolean

  private fanGroup: THREE.Group
  private headGroup: THREE.Group

  private swingValue: number
  private speed: number

  static MATERIAL_COLOR = 0x0074df
  static AREA_SIZE = 40.0
  static SWING_VALUE = 0.01
  static MAX_SPEED = 0.5

  constructor(mat: THREE.MeshPhongMaterial) {
    super()

    this.speed = 0
    this.isOn = true
    this.swingValue = Fan.SWING_VALUE

    this.headGroup = new THREE.Group()
    this.fanGroup = new THREE.Group()

    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 0.2, 8),
      mat
    )
    baseMesh.position.y = 0.1

    const buttonGroup = new THREE.Group()
    const buttonAMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.1, 0.2),
      mat
    )
    const buttonBMesh = buttonAMesh.clone()
    buttonBMesh.position.z = 0.3
    const buttonCMesh = buttonAMesh.clone()
    buttonCMesh.position.z = -0.3
    buttonGroup.position.y = 0.2
    buttonGroup.position.x = 0.5
    buttonGroup.add(buttonAMesh, buttonBMesh, buttonCMesh)

    const legMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 3.0, 6),
      mat
    )
    legMesh.position.y = 1.5

    const headMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.0, 8),
      mat
    )
    headMesh.position.y = 3
    headMesh.position.x = -0.2
    headMesh.rotation.z = (90 * Math.PI) / 180

    const faceMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.2, 5),
      mat
    )
    faceMesh.rotation.x = (90 * Math.PI) / 180

    const fanAGroup = new THREE.Group()
    const fanGeo = new THREE.BoxGeometry(0.4, 1.2, 0.05)
    const fanAMesh = new THREE.Mesh(fanGeo, mat)
    fanAMesh.rotation.y = (30 * Math.PI) / 180
    fanAGroup.add(fanAMesh)

    const fanBGroup = new THREE.Group()
    const fanBMesh = new THREE.Mesh(fanGeo, mat)
    fanBMesh.rotation.y = (30 * Math.PI) / 180
    fanBGroup.add(fanBMesh)

    const fanCGroup = new THREE.Group()
    const fanCMesh = new THREE.Mesh(fanGeo, mat)
    fanCMesh.rotation.y = (30 * Math.PI) / 180
    fanCGroup.add(fanCMesh)

    fanAGroup.rotation.z = (0 * Math.PI) / 180
    fanAGroup.position.set(0, 1.2, 0)
    fanBGroup.rotation.z = (-120 * Math.PI) / 180
    fanBGroup.position.set((1.2 * Math.sqrt(3)) / 2, 1.2 * -0.5, 0)
    fanCGroup.rotation.z = (120 * Math.PI) / 180
    fanCGroup.position.set((1.2 * -Math.sqrt(3)) / 2, 1.2 * -0.5, 0)

    this.fanGroup.add(fanAGroup, fanBGroup, fanCGroup, faceMesh)
    this.fanGroup.rotation.y = (90 * Math.PI) / 180
    this.fanGroup.position.y = 3.0
    this.fanGroup.position.x = 0.6
    this.fanGroup.rotation.z = Math.random() * Math.PI * 2

    this.add(this.fanGroup)
    this.headGroup.add(this.fanGroup, headMesh)
    this.add(this.headGroup, legMesh, baseMesh, buttonGroup)
  }

  public update() {
    if (this.isOn) {
      this.speed = Math.max(0, Math.min(Fan.MAX_SPEED, this.speed + 0.003))
      this.swingHead()
    } else {
      this.speed = Math.max(0, Math.min(Fan.MAX_SPEED, this.speed - 0.006))
    }

    this.fanGroup.rotation.z += this.speed
  }

  private swingHead() {
    this.headGroup.rotation.y += this.swingValue
    if (this.headGroup.rotation.y > (60 * Math.PI) / 180) {
      this.swingValue = Fan.SWING_VALUE * -1
    } else if (this.headGroup.rotation.y < (-60 * Math.PI) / 180) {
      this.swingValue = Fan.SWING_VALUE
    }
  }
}
