precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float alpha;
uniform float tresholdH;
uniform float tresholdB;

void main(void) {
	// On passe la couleur en niveau de gris sur une seule variable (float c)
	float c = texture2D(uSampler, vec2(tCoords.s, tCoords.t)).r;
	// On enleve les niveaux de gris inférieurs à 20% de couleurs pour éliminer les pixels noirs de nos textures
	if(c > tresholdH) {
		discard;
	}
	if(c < tresholdB) {
		discard;
	}
	// On remplis maintenant la constante de couleur (gl_FragColor)
	gl_FragColor = vec4(vec3(c),alpha);
}