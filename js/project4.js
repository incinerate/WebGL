	var gl;
	var teapotVertexPositionBuffer;
	var teapotVertexTextureCoordBuffer;
	var teapotVertexNormalBuffer;
	var teapotVertexIndexBuffer;
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();
	var mvMatrixStack = [];
	var lastTime = 0;
	var earthTexture;
	var galvanizedTexture;
    var teapotAngle = 0;
    
    var currentProgram;
    var shaderProgram;
    var perFragmentProgram;

	function initGL(canvas) {
		try{
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
//			canvas.width = window.innerWidth;
			gl.viewPortWidth = canvas.width;
			gl.viewPortHeight = canvas.height;
		} catch(e) {}

		if(!gl) {
			alert("Could not initialise WebGL");
		}
	}

	function getShader(gl, id) {
		var shaderScript, theSource, currentChild, shader;
  
		shaderScript = document.getElementById(id);

		if (!shaderScript) {
		return null;
		}

		theSource = "";
		currentChild = shaderScript.firstChild;

		while(currentChild) {
			if (currentChild.nodeType == currentChild.TEXT_NODE) {
			  theSource += currentChild.textContent;
			}

			currentChild = currentChild.nextSibling;
		}

		if(shaderScript.type == "x-shader/x-fragment")
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		else if(shaderScript.type == "x-shader/x-vertex")
			shader = gl.createShader(gl.VERTEX_SHADER);
		else
			return null;

		gl.shaderSource(shader, theSource);
		gl.compileShader(shader);

		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;			
	}
	
	 function createProgram(fragmentShaderID, vertexShaderID) {
	        var fragmentShader = getShader(gl, fragmentShaderID);
	        var vertexShader = getShader(gl, vertexShaderID);

	        var program = gl.createProgram();
	        gl.attachShader(program, vertexShader);
	        gl.attachShader(program, fragmentShader);
	        gl.linkProgram(program);

	        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	            alert("Could not initialise shaders");
	        }

	        program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
	        gl.enableVertexAttribArray(program.vertexPositionAttribute);

	        program.vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
	        gl.enableVertexAttribArray(program.vertexNormalAttribute);

	        program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
	        gl.enableVertexAttribArray(program.textureCoordAttribute);

	        program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	        program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	        program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
	        program.samplerUniform = gl.getUniformLocation(program, "uSampler");
	        program.materialShininessUniform = gl.getUniformLocation(program, "uMaterialShininess");
	        program.showSpecularHighlightsUniform = gl.getUniformLocation(program, "uShowSpecularHighlights");
	        program.useTexturesUniform = gl.getUniformLocation(program, "uUseTextures");
	        program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
	        program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
	        program.pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
	        program.pointLightingColorUniform = gl.getUniformLocation(program, "uPointLightingColor");
	        program.pointLightingSpecularColorUniform = gl.getUniformLocation(program, "uPointLightingSpecularColor");
	        program.pointLightingColor = gl.getUniformLocation(program, "uPointLightingColor");
	        program.pointLightingDiffuseColorUniform = gl.getUniformLocation(program, "uPointLightingDiffuseColor");
	        return program;
	    }

		function initShaders() {
			shaderProgram = createProgram("shader-fs", "shader-vs");
	        perFragmentProgram = createProgram("per-fragment-lighting-fs", "per-fragment-lighting-vs");
		}



	/*function initShaders() {
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

        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

        shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
        gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

        shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "uMaterialShininess");
        shaderProgram.showSpecularHighlightsUniform = gl.getUniformLocation(shaderProgram, "uShowSpecularHighlights");
        shaderProgram.useTexturesUniform = gl.getUniformLocation(shaderProgram, "uUseTextures");
        shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
        shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
        shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
        shaderProgram.pointLightingSpecularColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingSpecularColor");
        shaderProgram.pointLightingDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingDiffuseColor");
	}*/

	function handleLoadedTexture(texture) {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function initTextures() {
		earthTexture = gl.createTexture();
        earthTexture.image = new Image();
        earthTexture.image.onload = function () {
            handleLoadedTexture(earthTexture)
        }

        //IMPORTANT: image size MUST BE in POWER-OF-2!!!
        earthTexture.image.src = "texture/earth.jpg";

        galvanizedTexture = gl.createTexture();
        galvanizedTexture.image = new Image();
        galvanizedTexture.image.onload = function () {
            handleLoadedTexture(galvanizedTexture)
        }

        //IMPORTANT: image size MUST BE in POWER-OF-2!!!
        galvanizedTexture.image.src = "texture/galvanized.jpg";
	}

    function degToRad(degrees) {
    	return (degrees / 180) * Math.PI;
    }

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

	function setMatrixUniforms() {
		
		mat4.translate(mvMatrix, [-10, 0, 0.0], mvMatrix);
        
		gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix);
	}
	function setMatrixUniforms1() {
		
		mat4.translate(mvMatrix, [20, 0, 0.0], mvMatrix);
        
		gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix);
	}
    function handleLoadedTeapot(teapotData) {
        teapotVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexPositions), gl.STATIC_DRAW);
        teapotVertexPositionBuffer.itemSize = 3;
        teapotVertexPositionBuffer.numItems = teapotData.vertexPositions.length / 3;

        teapotVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexNormals), gl.STATIC_DRAW);
        teapotVertexNormalBuffer.itemSize = 3;
        teapotVertexNormalBuffer.numItems = teapotData.vertexNormals.length / 3;

        teapotVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(teapotData.vertexTextureCoords), gl.STATIC_DRAW);
        teapotVertexTextureCoordBuffer.itemSize = 2;
        teapotVertexTextureCoordBuffer.numItems = teapotData.vertexTextureCoords.length / 2;

        teapotVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(teapotData.indices), gl.STATIC_DRAW);
        teapotVertexIndexBuffer.itemSize = 1;
        teapotVertexIndexBuffer.numItems = teapotData.indices.length;

//        document.getElementById("loadingText").textContent = "";
    }
    function handleLoadedLaptop(laptopData) {
        laptopVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(laptopData.vertexNormals), gl.STATIC_DRAW);
        laptopVertexNormalBuffer.itemSize = 3;
        laptopVertexNormalBuffer.numItems = laptopData.vertexNormals.length / 3;

        laptopVertexTextureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(laptopData.vertexTextureCoords), gl.STATIC_DRAW);
        laptopVertexTextureCoordBuffer.itemSize = 2;
        laptopVertexTextureCoordBuffer.numItems = laptopData.vertexTextureCoords.length / 2;

        laptopVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(laptopData.vertexPositions), gl.STATIC_DRAW);
        laptopVertexPositionBuffer.itemSize = 3;
        laptopVertexPositionBuffer.numItems = laptopData.vertexPositions.length / 3;

        laptopVertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laptopVertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(laptopData.indices), gl.STREAM_DRAW);
        laptopVertexIndexBuffer.itemSize = 1;
        laptopVertexIndexBuffer.numItems = laptopData.indices.length;
    }

	function loadTeapot() {
		LoadPLY("bunny.ply");
        var request = new XMLHttpRequest();
        request.open("GET", "models/Teapot.json");
        request.onreadystatechange = function() {
            //if file is completely loaded
            if(request.readyState == 4)
                handleLoadedTeapot(JSON.parse(request.responseText));
        }
        request.send();
    }

	function drawScene() {
		gl.viewport(0, 0, gl.viewPortWidth, gl.viewPortHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//        if (teapotVertexPositionBuffer == null || teapotVertexNormalBuffer == null || teapotVertexTextureCoordBuffer == null || teapotVertexIndexBuffer == null) {
//            return;
//        }
        if (fileVertexPositionBuffer == null || fileVertexTextureBuffer == null || fileVertexNormalBuffer == null || fileVertexColorBuffer == null) {
            return;
        }

		//FOV, aspect ratio, near clipping plane, far clipping plane, projection matrix
		mat4.perspective(45, gl.viewPortWidth / gl.viewPortHeight, 0.1, 100.0, pMatrix);
		//Use the appropriate shader program depending on the status of the Per-fragment Lighting checkbox
		var perFragmentLighting = document.getElementById("perFragmentLighting").checked;
		if(perFragmentLighting)
			currentProgram = perFragmentProgram;
		else
			currentProgram = shaderProgram;
		gl.useProgram(currentProgram);

        //Toggle to show specular highlights or not
        var specularHighlights = document.getElementById("specular").checked;
        gl.uniform1i(currentProgram.showSpecularHighlightsUniform, specularHighlights);

		var lighting = document.getElementById("lighting").checked;
		gl.uniform1i(currentProgram.useLightingUniform, lighting);
		

		var lighting = document.getElementById("lighting").checked;
		gl.uniform1i(currentProgram.useLightingUniform, lighting);
		
		if(lighting) {
			//Push ambient light color to vertex shader
			gl.uniform3f(
				currentProgram.ambientColorUniform,
				parseFloat(document.getElementById("ambientR").value),
				parseFloat(document.getElementById("ambientG").value),
				parseFloat(document.getElementById("ambientB").value)
			);

			//Push point light location to vertex shader
			gl.uniform3f(
				currentProgram.pointLightingLocationUniform,
				parseFloat(document.getElementById("pointX").value),
				parseFloat(document.getElementById("pointY").value),
				parseFloat(document.getElementById("pointZ").value)
			);

			//Push point light specular color to vertex shader
			gl.uniform3f(
				currentProgram.pointLightingSpecularColorUniform,
				parseFloat(document.getElementById("pointSpecularR").value),
				parseFloat(document.getElementById("pointSpecularG").value),
				parseFloat(document.getElementById("pointSpecularB").value)
			);

            //Push point light diffuse color to vertex shader
            gl.uniform3f(
            	currentProgram.pointLightingDiffuseColorUniform,
                parseFloat(document.getElementById("pointDiffuseR").value),
                parseFloat(document.getElementById("pointDiffuseG").value),
                parseFloat(document.getElementById("pointDiffuseB").value)
            );
            //Push point light diffuse color to vertex shader
            gl.uniform3f(
            		currentProgram.pointLightingColorUniform,
            		parseFloat(document.getElementById("pointDiffuseR").value),
            		parseFloat(document.getElementById("pointDiffuseG").value),
            		parseFloat(document.getElementById("pointDiffuseB").value)
            );
		}

        var texture = document.getElementById("texture").value;
        gl.uniform1i(currentProgram.useTexturesUniform, texture != "none");

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0, 0, -40]);
        mat4.rotate(mvMatrix, degToRad(23.4), [1, 0, -1]);
        mat4.rotate(mvMatrix, degToRad(teapotAngle), [0, 1, 0]);
		
		gl.activeTexture(gl.TEXTURE0);
        if (texture == "earth") {
            gl.bindTexture(gl.TEXTURE_2D, earthTexture);
        } else if (texture == "galvanized") {
            gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
        }
        gl.uniform1i(currentProgram.samplerUniform, 0);

        gl.uniform1f(currentProgram.materialShininessUniform, parseFloat(document.getElementById("shininess").value));

        
        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
        setMatrixUniforms();
        
        gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
      
        gl.bindBuffer(gl.ARRAY_BUFFER, fileVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, fileVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, fileVertexTextureBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, fileVertexTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, fileVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, fileVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, fileVertexColorBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, fileVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
        
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fileVertexIndexBuffer);
        setMatrixUniforms1();
        gl.drawArrays(gl.TRIANGLES, 0, fileVertexPositionBuffer.numItems);
//        gl.drawElements(gl.TRIANGLES, fileVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	}

	function animate() {
		var currentTime = new Date().getTime();
		if(lastTime != 0) {
			var elapsed = currentTime - lastTime;

			teapotAngle += 0.05 * elapsed;
		}
		lastTime = currentTime;
	}

	function tick() {
		requestAnimFrame(tick);
		drawScene();
		animate();
	}

	function webGLStart() {
		var canvas = document.getElementById("canvas");

		initGL(canvas);
		initShaders();
		initTextures();
        loadTeapot();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		tick();
	}