const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

if(!gl){
    throw new Error('WebGl not supported');
}

// Front|Left|Bot|Right|Top|Under
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

function repeat(n, pattern){
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}


const uvData = repeat(6, [
    // start at 0,0 and move sentido horario
    
    1, 1,
    1, 0,
    0, 1,

    0, 1,
    1, 0,
    0, 0
]);

// array de vetores normal
// Front|Left|Bot|Right|Top|Under
const normalData = [
    ...repeat(6, [ 0, 0, 1 ]), //+z
    ...repeat(6, [-1, 0, 0 ]), //-x
    ...repeat(6, [ 0, 0,-1 ]), //-z
    ...repeat(6, [ 1, 0, 0 ]), //+x
    ...repeat(6, [ 0, 1, 0 ]), //+y
    ...repeat(6, [ 0,-1, 0 ]), //-y
];

// BUFFERS
const positionBuffer = gl.createBuffer();   
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

const uvBuffer = gl.createBuffer();   
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvData), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();   
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);

// RESOURCE LOADING
// ================
function loadTexture(url){
    const texture = gl.createTexture();
    const image = new Image();

    image.onload = e => {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.generateMipmap(gl.TEXTURE_2D);
    };

    image.src = url;
    return texture;
}

// puxa da pasta texture, cheia de png
const brick = loadTexture(`texture/default_steel_block.png`);

gl.activeTexture(gl.TEXTURE0); // 1-96
gl.bindTexture(gl.TEXTURE_2D, brick);

// SHADER PROGRAM
// ==============
let uniformLocations;
(function shaderProgram() {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    // creating a light direction
    // matrix para atualizar a sombra no cubo
    gl.shaderSource(vertexShader, `
    precision mediump float;
    
    const vec3 lightDirection = normalize( vec3(0, 1.0, 1.0) );
    const float ambient = 0.1;

    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;
    
    varying vec2 vUV;
    varying float vBrightness;
    
    uniform mat4 matrix;
    uniform mat4 normalMatrix;
    
    void main(){
        vec3 worldNormal = (normalMatrix * vec4(normal, 1)).xyz;
        float diffuse = max(0.0, dot(worldNormal, lightDirection));

        vBrightness = diffuse + ambient;
        vUV = uv;
        gl_Position = matrix * vec4(position, 1);
    }    
    `);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;
    
    varying vec2 vUV;
    varying float vBrightness;

    uniform sampler2D textureID;
    
    void main() {
        vec4 texel = texture2D(textureID, vUV);
        texel.xyz *= vBrightness;
        gl_FragColor = texel;
    }    
    `);
    // R G B A
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));
    
    const program = gl.createProgram();
    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);
    
    gl.linkProgram(program);
       
    const positionLocation = gl.getAttribLocation(program, `position`);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    const uvLocation = gl.getAttribLocation(program, `uv`);
    gl.enableVertexAttribArray(uvLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    const normalLocation = gl.getAttribLocation(program, `normal`);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    
    // after program link and program use
    uniformLocations= {
        matrix: gl.getUniformLocation(program, `matrix`),
        normalMatrix: gl.getUniformLocation(program, `normalMatrix`),
        textureID: gl.getUniformLocation(program, `textureID`),
    };
    
    gl.uniform1i(uniformLocations.textureID, 0);
})();

// MATRICES
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix,
    75 * Math.PI /180, // field of view
    canvas.width/canvas.height,
    1e-4, // near cull distance
    1e4 // far cull distance "render distance"
);

const mvMatrix = mat4.create();
const mvpMatrix = mat4.create();

mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
mat4.invert(viewMatrix, viewMatrix);


const normalMatrix = mat4.create();


function animate(){
    requestAnimationFrame(animate);

    mat4.rotateX(modelMatrix,modelMatrix,Math.PI/100);
    mat4.rotateY(modelMatrix,modelMatrix,Math.PI/200);

    mat4.multiply(mvMatrix,viewMatrix, modelMatrix);   
    mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);

    mat4.invert(normalMatrix, mvMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix4fv(uniformLocations.normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
}

animate();

/*
the transformations applied to the matrix are replayed into the vertex in the reverse order

rotations and scales first, before translation
*/