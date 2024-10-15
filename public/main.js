const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('WebGl not supported');
}
<<<<<<< Updated upstream

/* 
vertexData = [...]; 1
=======
>>>>>>> Stashed changes


const vertexData = [ //triangulo 2D
    0, 1, 0, 
    1,-1, 0, 
   -1,-1, 0, 
];

const colorData = [
    1, 0, 0, //red   V1.color
    0, 1, 0, //green V2.color
    0, 0, 1  //blue  V3.color
];

// BUFFERS

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);


const vertexShader = gl.createShader(gl.VERTEX_SHADER);

// VERTEX ATTRIBUTES
// cor adicionada
// precisão dos numeros float, lowp, mediump, highp
// varying é a transição entre as cores do triângulo
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

void main(){
    vColor = color;
    gl_Position = vec4(position, 1);
}    
`);

gl.compileShader(vertexShader);

// botando cor
// locando precisão de float
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;

varying vec3 vColor;

void main(){ 
    gl_FragColor = vec4(vColor, 1); 
}    
`);
// R G B A
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program,vertexShader);
gl.attachShader(program,fragmentShader);

gl.linkProgram(program);


const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getAttribLocation(program, `color`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

// tell gl which program to use
gl.useProgram(program);

gl.drawArrays(gl.TRIANGLES, 0, 3);
