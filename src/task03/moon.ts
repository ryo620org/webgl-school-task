import * as THREE from 'three'

export class Moon extends THREE.Group {
  private moonMaterial: THREE.MeshPhongMaterial

  // 向きの単位ベクトル
  private direction: THREE.Vector3

  private static SPEED = 0.1
  private static DISTANCE = 80

  constructor(color: number) {
    super()

    const geometry = new THREE.OctahedronGeometry(8, 2)
    this.moonMaterial = new THREE.MeshPhongMaterial({
      color: color,
      flatShading: true,
    })
    const sphere = new THREE.Mesh(geometry, this.moonMaterial)
    this.add(sphere)

    this.direction = new THREE.Vector3(0, 0, 1)
  }

  public update(sec: number) {
    const s = Math.sin(sec * Moon.SPEED)
    const c = Math.cos(sec * Moon.SPEED)

    // 前回の向きベクトルを保存する
    const prevDirection = this.direction.clone()

    // 次に描画される位置を求める（地球赤道上を公転する）
    const newPosition = new THREE.Vector3(
      -c * Moon.DISTANCE,
      0,
      s * Moon.DISTANCE
    )

    // 現在地との差分によって、進むベクトルを求める
    this.direction = new THREE.Vector3().subVectors(newPosition, this.position)

    // 単位ベクトル化する
    this.direction.normalize()

    // 位置を決定する
    this.position.set(newPosition.x, newPosition.y, newPosition.z)

    // 前回ベクトル・現在ベクトルから外積で法線ベクトルを求め、単位ベクトル化する
    const normalAxis = new THREE.Vector3().crossVectors(
      prevDirection,
      this.direction
    )
    normalAxis.normalize()

    // 前回ベクトル・現在ベクトルから内積でコサインを求め、ラジアンを求める
    const cos = prevDirection.dot(this.direction)
    const radians = Math.acos(cos)

    // 法線ベクトルとラジアンから、クォータニオンを定義する
    const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians)

    // 現在のクォータニオンに乗算する
    this.quaternion.premultiply(qtn)
  }

  public setWireFrame(value: boolean) {
    this.moonMaterial.wireframe = value
  }

  public changeColor(value: number) {
    this.moonMaterial.color.set(value)
  }
}
