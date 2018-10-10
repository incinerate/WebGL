/**
 * Generate 3D Triangle;
 */
var InitDemo = function() {
    var canvas = document.getElementById('project2');
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50;
    var gl = canvas.getContext('webgl');

    if(!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");

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
        0.0, 0.5,	 1.0,1.0,0.0,
        -0.5, -0.5,  0.7,0.0,1.0,
        0, -0.5,	 0.1,1.0,0.6,
        
        //X,Y        R, G, B
        -0.5, 0.5,	 1.0,1.0,0.7,
        -1.0, 1,   0.75,0.3,1.0,
        -0.5, 1,	 0.4,0.8,0.6,
        
        //X,Y        R, G, B
        0.5, 0.5,	 0.75,1.0,0.7,
        1.0, 1,    	 0.3,0.5,0.0,
        0.5, 1,	 0.4,0.8,1.0,
        
        //X,Y        R, G, B
        -0.5, -0.5,	 0.2,0.1,0.0,
        -1.0, -1,    0.7,0.8,0.0,
        -0.5, -1,	 0.35,0.24,1.0,
        
        //X,Y        R, G, B
        0.5, -0.5,	 0.5,1.0,0.2,
        1.0, -1,     0.6,0.5,1.0,
        0.5, -1,	 0.1,0.4,1.0,
        
        //X,Y        R, G, B
        0, 0.5,	 0.25,0.5,0.3,
        0.5, -0.5,    0.9,0.1,0.0,
        0, -0.5,	 0.4,0.4,1.0
    ];

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    

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
    
    var num = document.getElementById("ObjNumber").value;
    console.log(num);
    
//    tick();
    
    gl.drawArrays(gl.TRIANGLES, 0, num*3);
    
//    animate();
    
};

var lastTime = 0;	var xRot = 0;		var xSpeed = 30;

function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		//update the rotation to the current time.
		xRot += (xSpeed * elapsed) / 1000.0;
		if( xRot > 360 ){
			xRot -= 360;
		}
	}
	lastTime = timeNow;
}


