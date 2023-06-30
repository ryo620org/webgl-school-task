import * as THREE from 'three'

export async function loadTexture(path: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader()
    loader.load(
      path,
      (texture) => {
        resolve(texture)
      },
      undefined,
      (error) => {
        reject(new Error(error.message))
      }
    )
  })
}
