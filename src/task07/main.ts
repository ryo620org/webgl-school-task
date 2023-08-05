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

    let keysPressed = {
      ArrowRight: false,
      ArrowLeft: false,
      ArrowUp: false,
      ArrowDown: false,
    }
    let interval = 0

    function updatePosition() {
      let x = 0,
        y = 0
      if (keysPressed.ArrowRight) x += 0.1
      if (keysPressed.ArrowLeft) x -= 0.1
      if (keysPressed.ArrowUp) y -= 0.1
      if (keysPressed.ArrowDown) y += 0.1
      app.move(x, y)
    }

    document.addEventListener('keydown', function (event) {
      if (keysPressed.hasOwnProperty(event.key)) {
        // @ts-ignore
        keysPressed[event.key] = true

        if (!interval) {
          interval = setInterval(updatePosition, 50)
        }
      }
    })

    document.addEventListener('keyup', function (event) {
      if (keysPressed.hasOwnProperty(event.key)) {
        // @ts-ignore
        keysPressed[event.key] = false

        if (Object.values(keysPressed).every((v) => !v)) {
          clearInterval(interval)
          interval = 0
        }
      }
    })
  },
  false
)
