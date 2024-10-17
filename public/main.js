const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('WebGl not supported');
}


const vertexData = [ //cubo 1x1x1
    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5, 
];


function randomColor(){
    return [Math.random(), Math.random(), Math.random()];
}


let colorData = [];
for(let face = 0; face < 6; face++){
    let faceColor = randomColor();
    for(let vertex = 0; vertex < 6; vertex++){
        colorData.push(...faceColor);
    }
}

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

gl.enable(gl.DEPTH_TEST);

// after program link and program use
const uniformLocations= {
    matrix: gl.getUniformLocation(program, `matrix`),
};


const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
    75 * Math.PI /180, // field of view
    canvas.width/canvas.height,
    1e-4, // near cull distance
    1e4 // far cull distance "render distance"
)

const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

mat4.translate(modelMatrix, modelMatrix, [-1.5, 0, -2]);
//mat4.scale(modelMatrix,modelMatrix,[0.5,0.5,0.5]);

mat4.translate(viewMatrix,viewMatrix, [-3,0,1]);
mat4.invert(viewMatrix, viewMatrix);

function animate(){
    requestAnimationFrame(animate);
/*
    mat4.rotateX(matrix,matrix,Math.PI/2 /70);
    mat4.rotateY(matrix,matrix,Math.PI/2 /70);
    mat4.rotateZ(matrix,matrix,Math.PI/2 /70);
*/ 


    mat4.multiply(mvMatrix,viewMatrix, modelMatrix);   
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

animate();

/*
the transformations applied to the matrix are replayed into the vertex in the reverse order

rotations and scales first, before translation
*/

