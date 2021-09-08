precision mediump float;

varying vec2 tCoords;

uniform sampler2D uSampler;

uniform float alpha;
uniform float tresholdH;
uniform float tresholdB;

float col1;
float col2;
float col3;
float col4;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {

	col1 = 0.9;
	col2 = 0.7;
	col3 = 0.5;
	col4 = 0.3;


	// On passe la couleur en niveau de gris sur une seule variable (float c)
	float cp = texture2D(uSampler, vec2(tCoords.s, tCoords.t)).r;
	int c = int(cp*100.0);

	// On enleve les niveaux de gris inférieurs à 20% de couleurs pour éliminer les pixels noirs de nos textures
	if(cp < tresholdB) {
		discard;
	}
	if(cp > tresholdH) {
		discard;
	}

	if(c < 25){
		cp = col1;
	}else if (c < 50){
		cp = col2;
	} else if (c < 75){
		cp = col3;
	}else{
		cp = col4;
	}

	vec3 col = hsv2rgb( vec3( cp , 1.0 , 0.5 ));

	// On remplis maintenant la constante de couleur (gl_FragColor)
	gl_FragColor = vec4(col,alpha);
}