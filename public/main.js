const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('WebGl not supported');
}

//triangulo equilatero
//0, 1, 0, 0.87,0.5, 0, 0,0, 0, 
const vertexData = [ //triangulo 2D
    0, 0.707, 0, 
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

gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main(){
    vColor = color;
    gl_Position = matrix * vec4(position, 1);
}    
`);

gl.compileShader(vertexShader);

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

gl.useProgram(program);

// after program link and program use
const uniformLocations= {
    matrix: gl.getUniformLocation(program, `matrix`),
};

// matriz
const matrix = mat4.create();

// translação(output,input,translação)
mat4.translate(matrix, matrix, [.2, .5, 0]); // x = x + 2
// "zoom" scale
mat4.scale(matrix,matrix,[0.25,0.25,0.25]);

function animate(){
    requestAnimationFrame(animate);

    // rotação
    mat4.rotateZ(matrix,matrix,Math.PI/2 /70);
    
    gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

animate();

/*
the transformations applied to the matrix are replayed into the vertex in the reverse order

rotations and scales first, before translation
*/

