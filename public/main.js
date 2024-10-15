const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('WebGl not supported');
}
<<<<<<< Updated upstream

/* 
vertexData = [...]; 1

create buffer 2
load vertexData into buffer
=======
>>>>>>> Stashed changes

create vertex shader3
create fragment shader
create program
attach shaders to program

enable vertex attributes 4

draw 5
*/

// 1
const vertexData = [ //triangulo 2D
    0, 1, 0, 
    1,-1, 0, 
   -1,-1, 0, 
];

// 2
const buffer = gl.createBuffer();
// gl to bind to this particular buffer
// array of vertex info
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
// load into the current bound buffer
// data -> float32array
// how often to rewrite the content of this buffer (static - won't rewrite, dynamic - to rewrite often)
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

// 3
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
// specify the source code
gl.shaderSource(vertexShader, `
attribute vec3 position;
void main(){
    gl_Position = vec4(position, 1);
}    
`);
// gl will compile
gl.compileShader(vertexShader);

// botando cor
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
void main(){
    gl_FragColor = vec4(1, 0, 0, 1); 
}    
`);
// R G B A
gl.compileShader(fragmentShader);

// creating the program and attach all shaders
const program = gl.createProgram();
gl.attachShader(program,vertexShader);
gl.attachShader(program,fragmentShader);
// ties everything
gl.linkProgram(program);

// 4
// all atributes: coordinates(position), color, normal
//specify the program and the name of the define atribute in the shader "attribute vec3 position"
// gl.getAttribLocation will return a number assigned by WebGl to the attribute
const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
// describe to WebGL how it should retrive attribute data from the current bound buffer
// position, how many elements at a time, type, normalized, stride,offset
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// tell gl which program to use
gl.useProgram(program);

// 5
gl.drawArrays(gl.TRIANGLES, 0, 3);
