import { WebGLApp } from './webgl-app'

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const webglApp = new WebGLApp()
    webglApp.render()

    // リサイズ購読
    window.addEventListener(
      'resize',
      () => {
        webglApp.resizeRenderer()
      },
      false
    )
  },
  false
)
