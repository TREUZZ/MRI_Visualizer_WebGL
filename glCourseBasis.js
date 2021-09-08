
// =====================================================
var gl;
var shadersLoaded = 0;
var vertShaderTxt;
var fragShaderTxt;
var shaderProgram = null;
var vertexBuffer;
var colorBuffer;
var tableau = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var objMatrix = mat4.create();
mat4.identity(objMatrix);

// =====================================================
function webGLStart() {
	var canvas = document.getElementById("WebGL-test");
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;

	initGL(canvas);
	initBuffers();
	initTextureGlobal();
	loadShaders('shader');


	gl.clearColor(0.8, 0.8, 0.8, 1.0);
	gl.enable(gl.DEPTH_TEST);
	//On autorise la transparence
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

	tick();
}

// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
// =====================================================
function initBuffers() {
	// Vertices (array)
	// Nous les avons modifiés pour que les coordonnées correspondent à nos images IRM (=texture)
	vertices = [
		//Premiere face (avec texture)
		-0.6, -0.6, 0.0,
		-0.6,  0.6, 0.0,
		 0.6,  0.6, 0.0,
		 0.6, -0.6, 0.0];
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	vertexBuffer.itemSize = 3;
	vertexBuffer.numItems = 4;

	// Texture coords (array)
	texcoords = [
		// Texture première face (=deux triangles pour un rectangle)
		  0.0, 0.0,
		  0.0, 1.0,
		  1.0, 1.0,
		  1.0, 0.0];
	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
	texCoordBuffer.itemSize = 2;
	texCoordBuffer.numItems = 4;
	
	// Index buffer (array)
	var indices = [ 0, 1, 2, 3, 2, 0];
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	indexBuffer.itemSize = 1;
	indexBuffer.numItems = indices.length;
	
}
// ======================================================
// Cette fonction permet la création du tableau de textures
// en appliquant pour chaque texture la fonction d'initialisation de la texture en question
function initTextureGlobal(){

	//On remplit notre tableau de texture avec une boucle de 155 car 155 images disponibles
	//Cela est possible car nos images suivent le pattern : "img/IMG{numéro}.jpg"
	idTexturesArray = [];
	for (let index = 0; index < 155; index++) {
		idTexturesArray.push(`img/IMG${index}.jpg`);
	}

	idTexturesArray.forEach(name => {
		texture=gl.createTexture();
		tableau.push(texture);
		initTexture(name, texture);
	});
}


// =====================================================
// On rentre en paramètre le chemin d'accès de l'image à assigner à la texture
// Et l'objet de texture à modifier (présente dans notre tableau de texture)
function initTexture(name, texture)
{
	var texImage = new Image();
	texImage.src = name;

	texture.image = texImage;
	

	texImage.onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		//On autorise les images non carrées
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		
		gl.uniform1i(shaderProgram.samplerUniform, 0);
		gl.activeTexture(gl.TEXTURE0);
	}
}


// =====================================================
function loadShaders(shader) {
	loadShaderText(shader,'.vs');
	loadShaderText(shader,'.fs');
}

// =====================================================
function loadShaderText(filename,ext) {   // technique car lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
			if(ext=='.vs') { vertShaderTxt = xhttp.responseText; shadersLoaded ++; }
			if(ext=='.fs') { fragShaderTxt = xhttp.responseText; shadersLoaded ++; }
			if(shadersLoaded==2) {
				initShaders(vertShaderTxt,fragShaderTxt);
				shadersLoaded=0;
			}
    }
  }
  xhttp.open("GET", filename+ext, true);
  xhttp.send();
}

// =====================================================
function initShaders(vShaderTxt,fShaderTxt) {

	vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vshader, vShaderTxt);
	gl.compileShader(vshader);
	if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(vshader));
		return null;
	}

	fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fshader, fShaderTxt);
	gl.compileShader(fshader);
	if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(fshader));
		return null;
	}

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vshader);
	gl.attachShader(shaderProgram, fshader);

	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.texCoordsAttribute = gl.getAttribLocation(shaderProgram, "texCoords");
	gl.enableVertexAttribArray(shaderProgram.texCoordsAttribute);
	
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	shaderProgram.alpha =gl.getUniformLocation(shaderProgram, "alpha");
	shaderProgram.tresholdB=gl.getUniformLocation(shaderProgram, "tresholdB")
	shaderProgram.tresholdH=gl.getUniformLocation(shaderProgram, "tresholdH")
	

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
     	vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.texCoordsAttribute,
      	texCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

}


// =====================================================
function setMatrixUniforms(alpha, tresholdH, tresholdB) {
	if(shaderProgram != null) {
		gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		// On envoie l'alpha et le treshold aux shaders
		gl.uniform1f(shaderProgram.alpha, alpha);
		gl.uniform1f(shaderProgram.tresholdH, tresholdH);
		gl.uniform1f(shaderProgram.tresholdB, tresholdB);
	}
}

// =====================================================
// Fonction de traçage de toutes les coupes en même temps 
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Ceci permet de savoir quelle texture assigner à l'image à afficher
	textureIndex=0;

	var alpha = parseInt(document.getElementById("alpha").value)/100;
	var tresholdH = parseInt(document.getElementById("tresholdH").value)/100;
	var tresholdB = parseInt(document.getElementById("tresholdB").value)/100;
	tableCol=[document.getElementById('col1').value, document.getElementById('col2').value, document.getElementById('col3').value, document.getElementById('col4').value];

	if(shaderProgram != null) {
		//ici est égale à 155, permet d'avoir le nb total de coupes
		nbPlanTotal = idTexturesArray.length;
		
		// loop  : [borne inf; borne sup; pas] permettant la formation du cube
		// ici le pas est égal à 0.8/nbPlanTotal permettant de garder la forme cubique avec le nombre de coupes voulu.
		for (let index = -0.4; index <= 0.4; index+=0.8/nbPlanTotal) {
			
			gl.bindTexture(gl.TEXTURE_2D, tableau[textureIndex])
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

			mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
			mat4.identity(mvMatrix);
			mat4.translate(mvMatrix, [0.0, 0.0, -2.0]);
			mat4.multiply(mvMatrix, objMatrix);
			//On translate chaque image identique par l'index = au décalage pour chaque images
			mat4.translate(mvMatrix, [0.0, 0.0, index]);

			setMatrixUniforms(alpha, tresholdH, tresholdB, tableCol);

			//envoie à la GPU pour dessiner les triangles
			gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
			// Utilisé au cas ou moins de textures sont présentes que le nombre demandé
			// inutile ici car la boucle est calculée sur la base de la taille de notre
			// tableau de textures
			if (textureIndex == nbPlanTotal-1) {
				textureIndex = 0;
			} else {
				textureIndex++;
			}
			
		}
	}
}

//Fonction de draw permettant de dessiner les coupes uniques.
function drawnSceneSingle(){
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Ceci permet de savoir quelle texture assigner à l'image à afficher

	var alpha = parseInt(document.getElementById("alpha").value)/100;
	var tresholdH = parseInt(document.getElementById("tresholdH").value)/100;
	var tresholdB = parseInt(document.getElementById("tresholdB").value)/100;
	textureIndex = document.getElementById("slice").value;


	if(shaderProgram != null) {		
		gl.bindTexture(gl.TEXTURE_2D, tableau[textureIndex])
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0.0, 0.0, -2.0]);
		mat4.multiply(mvMatrix, objMatrix);

		setMatrixUniforms(alpha, tresholdH, tresholdB);

		//envoie à la GPU pour dessiner les triangles
		gl.drawElements(gl.TRIANGLES, indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}
}
