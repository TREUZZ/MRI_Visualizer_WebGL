precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float alpha;
uniform float tresholdH;
uniform float tresholdB;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
	// On passe la couleur en niveau de gris sur une seule variable (float c)
	float c = texture2D(uSampler, vec2(tCoords.s, tCoords.t)).r;
	vec3 col = hsv2rgb( vec3( 1.0 - c , 1.0 , 0.5 ));
	// On enleve les niveaux de gris inférieurs à 20% de couleurs pour éliminer les pixels noirs de nos textures
	if(c < tresholdB) {
		discard;
	}
	if(c > tresholdH) {
		discard;
	}
	// On remplis maintenant la constante de couleur (gl_FragColor)
	gl_FragColor = vec4(col,alpha);
}