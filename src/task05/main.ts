import { App } from './app'

window.addEventListener(
  'DOMContentLoaded',
  async () => {
    const app = new App('app')

    await app.loadShader()
    app.initGeometry()
    app.isRender = true
    app.render()
  },
  false
)
