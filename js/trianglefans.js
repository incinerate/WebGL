/**
 * Generate 3D Triangle;
 */
var InitDemo = function() {
    console.log('triangles');

    var canvas = document.getElementById('triangle');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var gl = canvas.getContext('webgl');

    if(!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
//    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

//    gl.shaderSource(vertexShader, vertexShaderText);
//    gl.shaderSource(fragmentShader, fragmentShaderText);

//    gl.compileShader(vertexShader);
//    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
//        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
//        return;
//    }
//
//    gl.compileShader(fragmentShader);
//    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
//        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
//        return;
//    }

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
//    gl.attachShader(program, vertexShader);
//    gl.attachShader(program, fragmentShader);
//    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfo(program));
        return;
    }

    gl.validateProgram(program);
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfo(program));
        return;
    }
    
   

    var triangleVertices = [
        //X,Y        R, G, B
		0.0,  0.0,	 0.5,1.0,0.0,
		-.5, .5,     0.0,1.0,0.5,
  	    0.0, 1.0,	 0.0,0.0,1.0,
        
        //X,Y        R, G, B
  	    0.5, 0.5,	 0.0,1.0,0.5,
  	    1.0, 0.0,    0.0,1.0,1.0,
  	    0.5, -0.5,	 0.5,0.0,0.5,
  	    
  	    //X,Y        R, G, B
  	    0.0, -1.0,	 0.0,1.0,0.5,
  	   -0.5, -0.5,   0.5,0.0,1.0,
  	   -1.0, 0.0,	 0.5,1.0,0.5,
  	   
  	   -0.5, 0.5,    0.5,1.0,1.0
     
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
//    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineVertices), gl.STATIC_DRAW);

//    var linePosition = gl.getAttribLocation(program, 'linePosition');
//    if (linePosition < 0) 
//    	console.log('Failed to get the storage location of linePosition');
    	
    	
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    
//    gl.vertexAttribPointer(linePosition, 2, gl.FLOAT, gl.FALSE, 0, 0);

    gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        2, //number of elements per attribute
        gl.FLOAT, //type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, //size of an individual vertex
        0 //offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 10);
    
};