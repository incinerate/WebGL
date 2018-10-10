var InitDemo = function() {
	
	function initBuffers() {
	    
	    // The number of vertices
	    var n = 4;

	    // Create a buffer object
	    var vertexBuffer = gl.createBuffer();
	    if (!vertexBuffer) {
	      console.log('Failed to create the buffer object');
	      return -1;
	    }
	    var triangleVertexColorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
		var matrix = [	0.5, 1,   0.5, +1.5,  1.0, 1.0,  1.0, +1.5,
					1.0,  0.5,  0.8, 1.0, 0.0,  0.35,  0.6, 0.9, 
					0.5,  0.2,  0.75, 0.25, 0.5,  0.8,  1.0, 0.4,
		  			];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(matrix), gl.STATIC_DRAW);

	   
		var linePosition = gl.getAttribLocation(program, 'linePosition');
	    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	    if (linePosition < 0) {
	      console.log('Failed to get the storage location of aPosition');
	      return -1;
	    }

	    gl.vertexAttribPointer(linePosition, 2, gl.FLOAT, gl.FALSE, 0, 0);
	    gl.vertexAttribPointer(
	            colorAttribLocation,
	            4,
	            gl.FLOAT,
	            gl.FALSE,
	            0,
	            0
	        );

	    // Enable the assignment to linePosition variable

	    // Enable the assignment to aPosition variable
	    gl.enableVertexAttribArray(linePosition);
	    gl.enableVertexAttribArray(colorAttribLocation);
	    

	    return n;
	  }
  // Get canvas element and check if WebGL enabled
  var vertElem = document.getElementById( "vertex-shader" );
  var fragElem = document.getElementById( "fragment-shader" );
  var canvas = document.getElementById("linestrip");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl = glUtils.checkWebGL(canvas),

  // Initialize the shaders and program
  vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, vertElem.text),
  fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, fragElem.text),
  program = glUtils.createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  var n = initBuffers();
    
  // Clear to black
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);
  
//  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Draw a line
  gl.drawArrays(gl.LINE_STRIP, 0, n);
};
