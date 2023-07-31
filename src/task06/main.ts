import { App } from './app'
import { Pane } from 'tweakpane'

window.addEventListener(
  'DOMContentLoaded',
  async () => {
    const app = new App('app')

    await app.loadShader()
    app.setupGeometry()
    app.setupLocation()
    app.isRender = true
    app.render()

    // Tweakpane を使った GUI の設定
    const pane = new Pane()
    const parameter = {
      culling: true,
      depthTest: true,
      rotation: false,
    }

    // バックフェイスカリングの有効・無効
    pane.addInput(parameter, 'culling').on('change', (v) => {
      app.setCulling(v.value)
    })
    // 深度テストの有効・無効
    pane.addInput(parameter, 'depthTest').on('change', (v) => {
      app.setDepthTest(v.value)
    })
    // 回転の有無
    pane.addInput(parameter, 'rotation').on('change', (v) => {
      app.setRotation(v.value)
    })
  },
  false
)
