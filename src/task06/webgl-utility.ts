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

  static createIBO(
    gl: WebGLRenderingContext,
    indexArray: number[]
  ): WebGLBuffer {
    // 空のバッファオブジェクトを生成する
    const ibo = gl.createBuffer()
    if (!ibo) throw new Error('buffer is null')

    // バッファを gl.ELEMENT_ARRAY_BUFFER としてバインドする
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    // バインドしたバッファに Int16Array オブジェクトに変換した配列を設定する
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Int16Array(indexArray),
      gl.STATIC_DRAW
    )
    // 安全のために最後にバインドを解除してからバッファオブジェクトを返す
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return ibo
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

  static enableBuffer(
    gl: WebGLRenderingContext,
    vbo: WebGLBuffer[],
    attLocation: number[],
    attStride: number[],
    ibo: WebGLBuffer
  ) {
    for (let i = 0; i < vbo.length; ++i) {
      // 有効化したいバッファをまずバインドする
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i])
      // 頂点属性ロケーションの有効化を行う
      gl.enableVertexAttribArray(attLocation[i])
      // 対象のロケーションのストライドやデータ型を設定する
      gl.vertexAttribPointer(
        attLocation[i],
        attStride[i],
        gl.FLOAT,
        false,
        0,
        0
      )
    }
    if (ibo != null) {
      // IBO が与えられている場合はバインドする
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    }
  }
}
