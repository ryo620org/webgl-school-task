import { App } from './app'

window.addEventListener(
  'DOMContentLoaded',
  async () => {
    const app = new App('app')

    await app.loadShader()
    await app.loadTexture()
    app.setupGeometry()
    app.setupLocation()
    app.render()
  },
  false
)
