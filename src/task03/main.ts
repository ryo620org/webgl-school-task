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
    const checkbox = document.getElementById('firstPersonViewCheckbox')

    checkbox?.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement
      if (target.checked) {
        webglApp.changeView1st()
      } else {
        webglApp.changeView3rd()
      }
    })
  },
  false
)
