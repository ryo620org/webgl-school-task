import { App } from './app'

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const app = new App()
    app.render()
    // app.showHelper()
  },
  false
)
