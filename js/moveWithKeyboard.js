
var gl;
var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrixStack = [];
var shaderProgram;
var rCube = 0; // track rotation of cube
var lastTime = 0;
var textures;
var xRot = 0;
var xSpeed = 0;
var yRot = 0;
var ySpeed = 0;
var z = -5.0;
var filter = 0; // range from 0 to 2 to represent the 3 filters used on texture
var currentlyPressedKeys = {};

function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl")
				|| canvas.getContext("experimental-webgl");
		gl.viewPortWidth = canvas.width;
		gl.viewPortHeight = canvas.height;
	} catch (e) {
	}

	if (!gl) {
		alert("Could not initialise WebGL");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript)
		return null;

	var str = "";
	var k = shaderScript.firstChild;

	while (k) {
		if (k.nodeType == 3)
			str += k.textContent;

		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment")
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	else if (shaderScript.type == "x-shader/x-vertex")
		shader = gl.createShader(gl.VERTEX_SHADER);
	else
		return null;

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
			"aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram,
			"aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,
			"uMVMatrix");
}

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;

	if (String.fromCharCode(event.keyCode) == "F") {
		filter += 1;

		if (filter == 3)
			filter = 0;

		filterString = filterString.substring(0, filterString.length - 1);
		console.log(filterString);
		filterString += filter;
		console.log(filterString);
		document.getElementById("filter").innerHTML = filterString;
		console.log(document.getElementById("filter").innerHTML);
	}
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
	// "W" key
	if (currentlyPressedKeys[87])
		z -= 0.05;

	// "S" key
	if (currentlyPressedKeys[83])
		z += 0.05;

	// "Up" key
	if (currentlyPressedKeys[38])
		xSpeed -= 1;

	// "Down" key
	if (currentlyPressedKeys[40])
		xSpeed += 1;

	// "Left" key
	if (currentlyPressedKeys[37])
		ySpeed -= 1;

	// "Right" key
	if (currentlyPressedKeys[39])
		ySpeed += 1;
}

function degToRad(degrees) {
	return (degrees / 180) * Math.PI;
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function initBuffers() {
	// initialise cube vertex buffer
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	vertices = [
	// Front face
	-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
	// Back face
	-1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
	// Top face
	-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
	// Bottom face
	-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
	// Right face
	1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
	// Left face
	-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = 24;

	// initialise cube texture buffer
	cubeVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	var textureCoords = [
	// Front face
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// Back face
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
	// Top face
	0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
	// Bottom face
	1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	// Right face
	1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
	// Left face
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 ];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),
			gl.STATIC_DRAW);
	cubeVertexTextureCoordBuffer.itemSize = 2;
	cubeVertexTextureCoordBuffer.numItems = 24;

	// initialise cube index buffer
	cubeVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	var cubeVertexIndices = [ 0, 1, 2, 0, 2, 3, // Front face
	4, 5, 6, 4, 6, 7, // Back face
	8, 9, 10, 8, 10, 11, // Top face
	12, 13, 14, 12, 14, 15, // Bottom face
	16, 17, 18, 16, 18, 19, // Right face
	20, 21, 22, 20, 22, 23 // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),
			gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;
}

function handleLoadedTexture(textures) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	gl.bindTexture(gl.TEXTURE_2D, textures[0]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
			textures[0].image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	gl.bindTexture(gl.TEXTURE_2D, textures[1]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
			textures[1].image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	gl.bindTexture(gl.TEXTURE_2D, textures[2]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
			textures[2].image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.bindTexture(gl.TEXTURE_2D, null);

	// use the loaded texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textures[filter]);
	gl.uniform1i(shaderProgram.samplerUniform, 0);
}

textures = Array();
function initTexture() {
	var textureImage = new Image();

	for (var i = 0; i < 3; i++) {
		var texture = gl.createTexture();
		texture.image = textureImage;
		textures.push(texture);
	}

	textureImage.onload = function() {
		handleLoadedTexture(textures);
	}

	// IMPORTANT: image size MUST BE in POWER-OF-2!!!
	textureImage.src = "resources/AfricanEbonyBoards.png";
}

function drawScene() {
	gl.viewport(0, 0, gl.viewPortWidth, gl.viewPortHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	mat4.perspective(45, gl.viewPortWidth / gl.viewPortHeight, 0.1, 100.0,
			pMatrix);
	mat4.identity(mvMatrix);

	// draw cube and animate
	mat4.translate(mvMatrix, [ 0.0, 0.0, z ]);

	mat4.rotate(mvMatrix, degToRad(xRot), [ 1, 0, 0 ]);
	mat4.rotate(mvMatrix, degToRad(yRot), [ 0, 1, 0 ]);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute,
			cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems,
			gl.UNSIGNED_SHORT, 0);
}

function animate() {
	var date = new Date();
	var timeNow = date.getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

		xRot += (xSpeed * elapsed) / 1000.0;
		yRot += (ySpeed * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}

function tick() {
	requestAnimFrame(tick);
	handleKeys();
	drawScene();
	animate();
}

function webGLStart() {
	var canvas = document.getElementById("movement");
	filterString = document.getElementById("filter").innerHTML;

	initGL(canvas);
	initShaders();
	initBuffers();
	initTexture();

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	tick();
}