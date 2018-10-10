var gl;
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvMatrixStack = [];
var program;
var lastTime = 0;
var xRot = 0;
var yRot = 0;
var currentlyPressedKeys = {};
var num = 1;
var xSpeed = new Array(6);
var ySpeed = new Array(6);
var x,y;

function startup(){
	
    var canvas = document.getElementById('myGLCanvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-160;
    xSpeed.fill(0);
    ySpeed.fill(0);
    gl = createGLContext(canvas);
    
    program = initShaders(gl,"vertex-shader","fragment-shader"); 
    gl.useProgram(program);

  // Specify the color for clearing <canvas>
  gl.clearColor(1, 1, 1, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  console.log("startup");
  tick();
 }

function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]); 
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    //X,Y        R, G, B
    0.0, 0.25,	 1.0,1.0,0.0,
    -0.25, -0.25,  0.7,0.0,1.0,
    0, -0.25,	 0.1,1.0,0.6,
    
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
    0, 0.25,	 0.25,0.5,0.3,
    0.25, -0.25,    0.9,0.1,0.0,
    0, -0.25,	 0.4,0.4,1.0
  ]);
  
  var n = 18; // The number of vertices
  
  var triangleVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

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

}

function tick() {
	requestAnimFrame(tick);
    y = document.getElementById('positionY').value;
    x = document.getElementById('positionX').value;
    while(Math.abs(x*1/1)>1){
    	x = x*0.1;
    }
    while(Math.abs(y*1/1)>1){
    	y = y*0.1;
    }
	handleKeys();
	drawScene();
	animate();
}

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
	 
	    num = document.getElementById("ObjNumber").value;
//	    console.log(num);
	    if(null == num) num = 1; 

		//"Up" key
		if(currentlyPressedKeys[38])
			xSpeed[num-1] += .01;

		//"Down" key
		if(currentlyPressedKeys[40])
			xSpeed[num-1] -= .01;

		//"Left" key
		if(currentlyPressedKeys[37])
			ySpeed[num-1] -= .01;

		//"Right" key
		if(currentlyPressedKeys[39])
			ySpeed[num-1] += .01;
	}

function drawScene(){
	  // Write the positions of vertices to a vertex shader
	  initVertexBuffers(gl);
	 
	  for (var i = 1; i <= num*1; i++) {
		  var u_Translation = gl.getUniformLocation(program, 'u_Translation');
		  if (!u_Translation) {
		    console.log('Failed to get the storage location of u_Translation');
		    return;
		  }
		  if(i == num*1){
			  if(x!="Please insert number" && y!="Please insert number"){
				  gl.uniform4f(u_Translation, x*1.000+ySpeed[i-1], y*1.000+xSpeed[i-1], 0.0, 0.0);
				  document.getElementById('positionY').value = y*1.000+xSpeed[i-1];
				  document.getElementById('positionX').value = x*1.000+ySpeed[i-1];
				  gl.drawArrays(gl.TRIANGLES, 3*(num-1) , 3);
			  }else{
				  
				  gl.uniform4f(u_Translation, ySpeed[i-1], xSpeed[i-1], 0.0, 0.0);
				  document.getElementById('positionY').value = xSpeed[i-1];
				  document.getElementById('positionX').value = ySpeed[i-1];
				  gl.drawArrays(gl.TRIANGLES, 3*(i-1) , 3);
				
			  }
		  }else {
			  gl.uniform4f(u_Translation, ySpeed[i-1], xSpeed[i-1], 0.0, 0.0);
			  gl.drawArrays(gl.TRIANGLES, 3*(i-1) , 3);
		  }
		  xSpeed[i-1] = 0;
		  ySpeed[i-1] = 0;
	  }
	  
}

function animate() {
	var date = new Date();
	var timeNow = date.getTime();
	if(lastTime != 0) {
		var elapsed = timeNow - lastTime;

		xRot += (xSpeed[num] * elapsed) / 1000.0;
        yRot += (ySpeed[num] * elapsed) / 1000.0;
	}
	lastTime = timeNow;
}