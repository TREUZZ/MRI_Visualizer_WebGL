
attribute vec3 aVertexPosition;
attribute vec2 texCoords;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 tCoords;

void main(void) {
	tCoords = texCoords;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
