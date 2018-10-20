	var gl;
	var teapotVertexPositionBuffer;
	var teapotVertexTextureCoordBuffer;
	var teapotVertexNormalBuffer;
	var teapotVertexIndexBuffer;
	var laptopVertexPositionBuffer;
	var laptopVertexTextureCoordBuffer;
	var laptopVertexNormalBuffer;
	var laptopVertexIndexBuffer;
	var mvMatrix = mat4.create();
	var pMatrix = mat4.create();
	var mvMatrixStack = [];
	var currentProgram;
    var perVertexProgram;
    var perFragmentProgram;
	var lastTime = 0;
	var teapotTexture;
	var laptopTexture;
	var teapotRotationMatrix = mat4.create();
	mat4.identity(teapotRotationMatrix);
	var teapotAngle = 0;
	var laptopAngle = 0;

	function initGL(canvas) {
		try{
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
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
        program.useTexturesUniform = gl.getUniformLocation(program, "uUseTextures");
        program.useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
        program.ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
        program.pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
        program.pointLightingColorUniform = gl.getUniformLocation(program, "uPointLightingColor");

        
        program.materialShininessUniform = gl.getUniformLocation(program, "uMaterialShininess");
        program.showSpecularHighlightsUniform = gl.getUniformLocation(program, "uShowSpecularHighlights");
        program.pointLightingSpecularColorUniform = gl.getUniformLocation(program, "uPointLightingSpecularColor");
        program.pointLightingColor = gl.getUniformLocation(program, "uPointLightingColor");
        program.pointLightingDiffuseColorUniform = gl.getUniformLocation(program, "uPointLightingDiffuseColor");
       
        program.ptLight1Uniform = gl.getUniformLocation(program, "uPtLight1On");
        program.ptLight2Uniform = gl.getUniformLocation(program, "uPtLight2On");
        program.ptLight3Uniform = gl.getUniformLocation(program, "uPtLight3On");
        program.ptLight4Uniform = gl.getUniformLocation(program, "uPtLight4On");
        program.ptLight5Uniform = gl.getUniformLocation(program, "uPtLight5On");
        
        program.uPtLight1LocUniform = gl.getUniformLocation(program, "uPtLight1Loc");
        program.uPtLight1ColUniform = gl.getUniformLocation(program, "uPtLight1Col");
        program.uPtLight2LocUniform = gl.getUniformLocation(program, "uPtLight2Loc");
        program.uPtLight2ColUniform = gl.getUniformLocation(program, "uPtLight2Col");
        program.uPtLight3LocUniform = gl.getUniformLocation(program, "uPtLight3Loc");
        program.uPtLight3ColUniform = gl.getUniformLocation(program, "uPtLight3Col");
        program.uPtLight4LocUniform = gl.getUniformLocation(program, "uPtLight4Loc");
        program.uPtLight4ColUniform = gl.getUniformLocation(program, "uPtLight4Col");
        program.uPtLight5LocUniform = gl.getUniformLocation(program, "uPtLight5Loc");
        program.uPtLight5ColUniform = gl.getUniformLocation(program, "uPtLight5Col");

        
        return program;
    }

	function initShaders() {
		perVertexProgram = createProgram("per-vertex-lighting-fs", "per-vertex-lighting-vs");
        perFragmentProgram = createProgram("per-fragment-lighting-fs", "per-fragment-lighting-vs");
	}

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
		teapotTexture = gl.createTexture();
        teapotTexture.image = new Image();
        teapotTexture.image.onload = function () {
            handleLoadedTexture(teapotTexture)
        }

        //IMPORTANT: image size MUST BE in POWER-OF-2!!!
        teapotTexture.image.src = "texture/moon.jpg";

        laptopTexture = gl.createTexture();
        laptopTexture.image = new Image();
        laptopTexture.image.onload = function () {
            handleLoadedTexture(laptopTexture)
        }

        //IMPORTANT: image size MUST BE in POWER-OF-2!!!
        laptopTexture.image.src = "texture/earth.jpg";
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
		
//		mat4.scale(pMatrix, [1, 1, 1],pMatrix);
		gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);

		var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix);
	}

	function initBuffers() {
		initCubeBuffers();
		initSphereBuffers();
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
	
	function loadObjs() {
//		LoadPLY("bunny.ply");
        var request = new XMLHttpRequest();
        request.open("GET", "models/Teapot.json");
        request.onreadystatechange = function() {
            //if file is completely loaded
            if(request.readyState == 4)
                handleLoadedTeapot(JSON.parse(request.responseText));
        }
        request.send();
        
        var request1 = new XMLHttpRequest();
        request1.open("GET", "models/macbook.json");
        request1.onreadystatechange = function() {
        	//if file is completely loaded
        	if(request1.readyState == 4)
        		handleLoadedLaptop(JSON.parse(request1.responseText));
        }
        request1.send();
    }

	function drawScene() {
		gl.viewport(0, 0, gl.viewPortWidth, gl.viewPortHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//FOV, aspect ratio, near clipping plane, far clipping plane, projection matrix
		mat4.perspective(45, gl.viewPortWidth / gl.viewPortHeight, 0.1, 100.0, pMatrix);

        //Use the appropriate shader program depending on the status of the Per-fragment Lighting checkbox
        var perFragmentLighting = document.getElementById("perFragmentLighting").checked;
        if(perFragmentLighting)
            currentProgram = perFragmentProgram;
        else
            currentProgram = perVertexProgram;
        gl.useProgram(currentProgram);
        
        //Toggle to show specular highlights or not
        var specularHighlights = document.getElementById("specular").checked;
        gl.uniform1i(currentProgram.showSpecularHighlightsUniform, specularHighlights);
        
        var ptLight1 = document.getElementById("ptLight1").checked;
        gl.uniform1i(currentProgram.ptLight1Uniform, ptLight1);
        var ptLight2 = document.getElementById("ptLight2").checked;
        gl.uniform1i(currentProgram.ptLight2Uniform, ptLight2);
        var ptLight3 = document.getElementById("ptLight3").checked;
        gl.uniform1i(currentProgram.ptLight3Uniform, ptLight3);
        var ptLight4 = document.getElementById("ptLight4").checked;
        gl.uniform1i(currentProgram.ptLight4Uniform, ptLight4);
        var ptLight5 = document.getElementById("ptLight5").checked;
        gl.uniform1i(currentProgram.ptLight5Uniform, ptLight5);
        
        if(ptLight1){
        	gl.uniform3f(
    			currentProgram.uPtLight1LocUniform,
    			Math.random()*100,
    			Math.random()*100,
    			Math.random()*100
    		);
        	gl.uniform3f(
        		currentProgram.uPtLight1ColUniform,
        		1.0,
        		1.0,
        		0
        	);
        }
        
        if(ptLight2){
        	gl.uniform3f(
    			currentProgram.uPtLight2LocUniform,
    			Math.random()*100,
    			Math.random()*100,
    			Math.random()*100
    		);
        	gl.uniform3f(
        		currentProgram.uPtLight2ColUniform,
        		1.0,
        		0,
        		1.0
        	);
        }
        
        if(ptLight3){
        	gl.uniform3f(
    			currentProgram.uPtLight3LocUniform,
    			Math.random()*100,
    			Math.random()*100,
    			Math.random()*100
    		);
        	gl.uniform3f(
        		currentProgram.uPtLight3ColUniform,
        		0,
        		1.0,
        		0
        	);
        }
        
        if(ptLight4){
        	gl.uniform3f(
    			currentProgram.uPtLight4LocUniform,
    			Math.random()*100,
    			Math.random()*100,
    			Math.random()*100
    		);
        	gl.uniform3f(
        		currentProgram.uPtLight4ColUniform,
        		0.5,
        		0.5,
        		0.5
        	);
        }
        
        if(ptLight5){
        	gl.uniform3f(
    			currentProgram.uPtLight5LocUniform,
    			Math.random()*100,
    			Math.random()*100,
    			Math.random()*100
    		);
        	gl.uniform3f(
        		currentProgram.uPtLight5ColUniform,
        		0,
        		0,
        		1
        	);
        }

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

			//Push point light color to vertex shader
			gl.uniform3f(
				currentProgram.pointLightingColorUniform,
				parseFloat(document.getElementById("pointR").value),
				parseFloat(document.getElementById("pointG").value),
				parseFloat(document.getElementById("pointB").value)
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

        //Toggle to use textures or not
        var textures = document.getElementById("textures").checked;
        gl.uniform1i(currentProgram.useTexturesUniform, textures);

		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0, 0, -60]);
        mat4.rotate(mvMatrix, degToRad(30), [1, 0, 0]);
		
		//Save current model-view matrix
		mvPushMatrix();
		mat4.rotate(mvMatrix, degToRad(teapotAngle), [0, 1, 0]);
		mat4.translate(mvMatrix, [2.5, 0, 0]);
		//Use the teapot texture
		gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, teapotTexture);
        gl.uniform1i(currentProgram.samplerUniform, 0);
        
        gl.uniform1f(currentProgram.materialShininessUniform, parseFloat(document.getElementById("shininess").value));

        //Draw the teapot
        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        //Restore model-view matrix
        mvPopMatrix();

        //Save current model-view matrix
        mvPushMatrix();
        mat4.identity(mvMatrix);
        mat4.rotate(mvMatrix, degToRad(teapotAngle), [0, 0, 1]);
        mat4.translate(mvMatrix, [-2.5, 0, -10]);

        //Draw the laptop
        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexPositionBuffer);
        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, laptopVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexTextureCoordBuffer);
        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, laptopVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexNormalBuffer);
        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, laptopVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //Use the laptop texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, laptopTexture);
        gl.uniform1i(currentProgram.samplerUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laptopVertexIndexBuffer);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, laptopVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        //Restore model-view matrix
        mvPopMatrix();
	}	
        
//        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexPositionBuffer);
//        gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, teapotVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexTextureCoordBuffer);
//        gl.vertexAttribPointer(currentProgram.textureCoordAttribute, teapotVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//        gl.bindBuffer(gl.ARRAY_BUFFER, teapotVertexNormalBuffer);
//        gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, teapotVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotVertexIndexBuffer);
//        setMatrixUniforms();
//        
//        gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        
      //Restore model-view matrix
//        mvPopMatrix();
        
      //Save current model-view matrix
//        mvPushMatrix();
        
//		mat4.identity(mvMatrix);
//		mat4.translate(mvMatrix, [0, 0, -5]);
//        mat4.rotate(mvMatrix, degToRad(30), [1, 0, 0]);
//
//      mat4.rotate(mvMatrix, degToRad(laptopAngle), [0, 1, 0]);
//      mat4.translate(mvMatrix, [-2.5, 0, 0]);
//        
//            gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexPositionBuffer);
//            gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, laptopVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//            gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexTextureCoordBuffer);
//            gl.vertexAttribPointer(currentProgram.textureCoordAttribute, laptopVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//            gl.bindBuffer(gl.ARRAY_BUFFER, laptopVertexNormalBuffer);
//            gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, laptopVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
//
//            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, laptopVertexIndexBuffer);
//            setMatrixUniforms();
//            gl.drawElements(gl.TRIANGLES, laptopVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
//          //Restore model-view matrix
//            mvPopMatrix();


	function animate() {
		var currentTime = new Date().getTime();
		if(lastTime != 0) {
			var elapsed = currentTime - lastTime;

			teapotAngle += 0.05 * elapsed;
			laptopAngle += 0.05 * elapsed;
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
		loadObjs();
//		initBuffers();

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);

		tick();
	}