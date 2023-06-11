import * as THREE from 'three'

export class Airplane extends THREE.Group {
  private innerGroup: THREE.Group
  private mainMaterial: THREE.MeshPhongMaterial
  private subMaterial: THREE.MeshPhongMaterial

  private fanR: THREE.Mesh
  private fanL: THREE.Mesh

  // 向きの単位ベクトル
  private direction: THREE.Vector3

  constructor(mainColor: number, subColor: number) {
    super()

    this.innerGroup = new THREE.Group()
    this.add(this.innerGroup)

    this.mainMaterial = new THREE.MeshPhongMaterial({
      color: mainColor,
      flatShading: true,
    })

    this.subMaterial = new THREE.MeshPhongMaterial({
      color: subColor,
      flatShading: true,
    })

    // 頭
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.5, 1, 6, 1, false, Math.PI / 6),
      this.subMaterial
    )
    head.rotation.x = (Math.PI / 180) * 90
    head.position.z = 3.5

    // 本体
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1, 6, 6, 1, false, Math.PI / 6),
      this.mainMaterial
    )
    body.rotation.x = (Math.PI / 180) * 90

    // 翼（右）
    const wingR = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1.6, 6, 6),
      this.subMaterial
    )
    wingR.rotation.x = (Math.PI / 180) * 90
    wingR.rotation.z = (Math.PI / 180) * 100
    wingR.scale.z = 0.2
    wingR.position.set(-3, -0.4, 0.8)

    // エンジン（右）
    const engineR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 2, 6),
      this.mainMaterial
    )
    engineR.rotation.x = (Math.PI / 180) * 90
    engineR.position.set(-3, -1.1, 1.4)

    // 翼（左）
    const wingL = wingR.clone()
    wingL.rotation.z = (Math.PI / 180) * -100
    wingL.position.set(3, -0.4, 0.8)

    // エンジン（左）
    const engineL = engineR.clone()
    engineL.position.set(3, -1.1, 1.4)

    // 尾翼（右）
    const backWingR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, 2, 6),
      this.subMaterial
    )
    backWingR.rotation.x = (Math.PI / 180) * 90
    backWingR.rotation.z = (Math.PI / 180) * 100
    backWingR.scale.z = 0.3
    backWingR.position.set(-1.3, 0.3, -2.5)

    // 尾翼（左）
    const backWingL = backWingR.clone()
    backWingL.rotation.z = (Math.PI / 180) * -100
    backWingL.position.set(1.3, 0.3, -2.5)

    // 尾翼（中）
    const backWingC = backWingR.clone()
    backWingC.rotation.x = (Math.PI / 180) * -20
    backWingC.rotation.z = 0
    backWingC.rotation.y = (Math.PI / 180) * 90
    backWingC.position.set(0, 1, -2.5)

    // プロペラ（右）
    this.fanR = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 1),
      this.subMaterial
    )
    this.fanR.position.set(0, 1.1, 0)
    engineR.add(this.fanR)

    // プロペラ（左）
    this.fanL = this.fanR.clone()
    engineL.add(this.fanL)

    this.innerGroup.add(
      head,
      body,
      wingR,
      engineR,
      backWingR,
      wingL,
      engineL,
      backWingL,
      backWingC
    )

    this.direction = new THREE.Vector3(0, 0, 1)
  }

  public update(position: THREE.Vector3) {
    this.fanR.rotation.y += 1
    this.fanL.rotation.y += 1

    // 次に描画される位置
    const newPosition = position

    // 前回の向きベクトルを保存する
    const prevDirection = this.direction.clone()

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
    this.mainMaterial.wireframe = value
    this.subMaterial.wireframe = value
  }

  public changeMainColor(value: number) {
    this.mainMaterial.color.set(value)
  }
  public changeSubColor(value: number) {
    this.subMaterial.color.set(value)
  }

  public changeAxis(vec: THREE.Vector3) {
    this.innerGroup.rotateOnAxis(vec, Math.PI / 2)
  }
}
