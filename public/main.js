const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('WebGl not supported');
}

// uma caixa tem 6 faces quadradas = 12 triangulos = 36 vértices
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

/*
const colorData = [
    1, 0, 0, //red   V1.color
    0, 1, 0, //green V2.color
    0, 0, 1  //blue  V3.color
];
*/

// 3 numero aleatorios em um array
function randomColor(){
    return [Math.random(), Math.random(), Math.random()];
}

/* para triângulo
let colorDate = [
    ...randomColor(),
    ...randomColor(),
    ...randomColor(),
];
*/

let colorData = [];
for(let face = 0; face < 6; face++){
    let faceColor = randomColor();
    for(let vertex = 0; vertex < 6; vertex++){
        colorData.push(...faceColor); //36 cores, mas vão repetir 6 vezes pra cada face
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
// adiciona profundidade, não tem sobreposição de cores, não exatamente o eixo-z
// basicamente é o recorte dos triangulos no pipeline gráfico
gl.enable(gl.DEPTH_TEST);

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
    mat4.rotateX(matrix,matrix,Math.PI/2 /70);
    mat4.rotateY(matrix,matrix,Math.PI/2 /70);
    //mat4.rotateZ(matrix,matrix,Math.PI/2 /70);
    
    gl.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

animate();

/*
the transformations applied to the matrix are replayed into the vertex in the reverse order

rotations and scales first, before translation
*/

