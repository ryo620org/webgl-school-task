import { App } from './app'

window.addEventListener(
  'DOMContentLoaded',
  () => {
    const app = new App()
    app.render()

    const topViewButton = document.getElementById('topViewButton')
    topViewButton?.addEventListener('click', () => {
      app.changeTopView()
    })
    const frontViewButton = document.getElementById('frontViewButton')
    frontViewButton?.addEventListener('click', () => {
      app.changeFrontView()
    })
    const sideViewButton = document.getElementById('sideViewButton')
    sideViewButton?.addEventListener('click', () => {
      app.changeSideView()
    })
  },
  false
)
