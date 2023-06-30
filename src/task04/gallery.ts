import * as THREE from 'three'
import { PicturePlane } from './picture-plane'
import { listPicture } from './data/listPicture'
import { getMonthString } from './lib/getMonthString'
import anime from 'animejs'
import { Picture } from './models/picture'

export class Gallery extends THREE.Group {
  private static RADIUS = 24 as const
  private static LOWER_LIMIT = 1000 as const
  private static UPPER_LIMIT = 3000 as const
  private static DEFAULT_SPEED = 0.0002 as const
  private static ADDED_SPEED = 0.003 as const
  private static DECAY = 0.05 as const

  public picturePlanes: PicturePlane[]
  private camera: THREE.PerspectiveCamera
  private lastScroll: number = Gallery.LOWER_LIMIT
  private speed: number = Gallery.DEFAULT_SPEED
  private activeId = 0

  constructor(camera: THREE.PerspectiveCamera) {
    super()

    this.camera = camera
    this.picturePlanes = []

    const artistName = document.getElementById('artistName') as HTMLElement
    const description = document.getElementById('description') as HTMLElement
    const cursor = document.getElementById('cursor') as HTMLElement
    const cursorInner = document.getElementById('cursorInner') as HTMLElement
    const pictureId = document.getElementById('pictureId') as HTMLElement
    const date = document.getElementById('date') as HTMLAnchorElement

    const setPicture = (picture: Picture) => {
      this.activeId = picture.id
      artistName.innerText = picture.artist
      description.innerText = picture.description
      pictureId.innerText = ('000' + picture.id).slice(-3)
      cursorInner.innerText = ('000' + picture.id).slice(-3)

      anime({
        targets: [pictureId, artistName, description, date],
        opacity: {
          value: [0, 1],
          easing: 'linear',
          duration: 200,
        },
        translateX: {
          value: [20, 0],
          easing: 'easeOutCirc',
          duration: 300,
        },
        delay: anime.stagger(50),
      })
      const d = picture.date
      date.href = picture.url
      date.innerText = `${getMonthString(
        d.getMonth()
      )} ${d.getDate()}, ${d.getFullYear()}`
    }

    // PicturePlaneを生成する
    const count = listPicture.length
    setPicture(listPicture[0])
    listPicture.map(async (picture, index) => {
      const pictureFrame = new PicturePlane(picture)
      const rad = ((2 * Math.PI) / count) * index
      pictureFrame.position.set(
        -3,
        Math.sin(rad) * Gallery.RADIUS,
        Math.cos(rad) * Gallery.RADIUS
      )
      pictureFrame.rotation.x = -rad
      this.add(pictureFrame)
      this.picturePlanes.push(pictureFrame)
    })

    // 衝突判定をリッスン
    const raycaster = new THREE.Raycaster()
    window.addEventListener('click', (mouseEvent) => {
      const x = (mouseEvent.clientX / window.innerWidth) * 2.0 - 1.0
      const y = (mouseEvent.clientY / window.innerHeight) * 2.0 - 1.0
      const v = new THREE.Vector2(x, -y)
      raycaster.setFromCamera(v, this.camera)
      const intersects = raycaster.intersectObjects(this.picturePlanes)
      if (intersects.length > 0) {
        const picturePlane = intersects[0].object.parent

        if (!(picturePlane instanceof PicturePlane)) return

        let startRotation = this.rotation.x
        let targetRotation = -picturePlane.rotation.x - 0.6
        if (this.rotation.x - targetRotation > Math.PI) {
          startRotation -= 2 * Math.PI
        } else if (this.rotation.x - targetRotation < -Math.PI) {
          startRotation += 2 * Math.PI
        }
        anime({
          targets: this.rotation,
          x: [startRotation, targetRotation],
          duration: 500,
          easing: 'easeOutCubic',
        })

        if (this.activeId === picturePlane.picture.id) return
        setPicture(picturePlane.picture)
      }
    })

    // mousemove
    window.addEventListener('mousemove', (mouseEvent) => {
      if (!cursor) return
      cursor.style.transform = `translate(${mouseEvent.clientX}px, ${mouseEvent.clientY}px)`
    })

    // 間引いたマウスイベント（重そうなので）
    window.addEventListener('mousemove', (mouseEvent) => {
      const x = (mouseEvent.clientX / window.innerWidth) * 2.0 - 1.0
      const y = (mouseEvent.clientY / window.innerHeight) * 2.0 - 1.0
      const v = new THREE.Vector2(x, -y)
      raycaster.setFromCamera(v, this.camera)
      const intersects = raycaster.intersectObjects(this.picturePlanes)

      if (intersects.length > 0) {
        // cursor 表示

        const picturePlane = intersects[0].object.parent

        if (!(picturePlane instanceof PicturePlane)) return
        const globalPosition = picturePlane.getWorldPosition(
          new THREE.Vector3()
        )
        cursor.dataset.cursorTarget = globalPosition.z > 0 ? 'near' : 'far'
        cursorInner.innerText = ('000' + picturePlane.picture.id).slice(-3)
      } else {
        // cursor 非表示
        cursor.dataset.cursorTarget = 'none'
      }
    })

    const range = Gallery.UPPER_LIMIT - Gallery.LOWER_LIMIT
    // 初期位置を設定する
    window.scrollTo(0, this.lastScroll)
    // スクロール範囲外まで余裕を持って body の高さを設定する
    const bodyHeight =
      Gallery.UPPER_LIMIT + window.innerHeight + Gallery.LOWER_LIMIT
    document.body.style.height = `${bodyHeight}px`

    window.addEventListener('scroll', () => {
      let scroll = window.scrollY || document.documentElement.scrollTop

      if (scroll > this.lastScroll) {
        // 下にスクロール
        this.speed -= Gallery.ADDED_SPEED

        if (scroll >= Gallery.UPPER_LIMIT) {
          window.scrollTo(0, scroll - range)
          this.lastScroll = scroll - range
        } else {
          this.lastScroll = scroll
        }
      } else if (scroll < this.lastScroll) {
        // 上にスクロール
        this.speed += Gallery.ADDED_SPEED

        if (scroll <= Gallery.LOWER_LIMIT) {
          window.scrollTo(0, scroll + range)
          this.lastScroll = scroll + range
        } else {
          this.lastScroll = scroll
        }
      }
    })
  }

  update() {
    if (Gallery.DEFAULT_SPEED !== this.speed) {
      const delta = this.speed - Gallery.DEFAULT_SPEED
      if (Math.abs(delta) > Number.EPSILON) {
        this.speed -= delta * Gallery.DECAY
      } else {
        this.speed = Gallery.DEFAULT_SPEED
      }
    }

    // 回転の正規化（0 - 2pi に収める）
    this.rotation.x += this.speed
    if (this.rotation.x > 2 * Math.PI) {
      this.rotation.x -= 2 * Math.PI
    } else if (this.rotation.x < -2 * Math.PI) {
      this.rotation.x += 2 * Math.PI
    }

    // ここのPicturePlaneを update
    this.picturePlanes.forEach((picturePlane) => {
      picturePlane.update()
    })
  }
}
