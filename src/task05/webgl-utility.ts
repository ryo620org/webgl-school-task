export class WebGLUtility {
  static createShaderObject(
    gl: WebGLRenderingContext,
    source: string,
    type: number
  ): WebGLShader {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('shader is null')

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error('compile failed')

    return shader
  }

  static createProgramObject(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = gl.createProgram()
    if (!program) throw new Error('program is null')

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error('program attach failed')

    return program
  }

  static createVBO(
    gl: WebGLRenderingContext,
    vertexArray: number[]
  ): WebGLBuffer {
    const vbo = gl.createBuffer()
    if (!vbo) throw new Error('buffer is null')

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexArray),
      gl.STATIC_DRAW
    )
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    return vbo
  }

  static enableAttribute(
    gl: WebGLRenderingContext,
    vbo: WebGLBuffer,
    attLocation: number,
    attStride: number
  ): void {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.enableVertexAttribArray(attLocation)
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0)
  }
}
