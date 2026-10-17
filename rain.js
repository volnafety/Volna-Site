// Создаем холст для дождя
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '9998'; // Чуть позади снега (если снег есть)
canvas.style.pointerEvents = 'none';
canvas.style.backgroundColor = 'transparent';

// ВАЖНО: Задаем реальный размер холста
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

document.body.prepend(canvas);

const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });

const vertexSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// Шейдер дождя
const fragmentSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 uv = fragCoord / u_resolution.xy;

        vec3 rain = vec3(0.0);
        float t = u_time * 1.5; // Скорость дождя

        // Количество капель
        for(float i = 0.0; i < 100.0; i++) {
            float randomX = rand(vec2(i, 1.0));
            float randomY = rand(vec2(i, 2.0));
            
            // Дождь падает вниз с разной скоростью
            float speed = rand(vec2(i, 3.0)) * 0.5 + 0.5;
            float y = fract(randomY - t * speed);
            
            // Небольшой ветер
            float x = randomX + sin(t * 0.5) * 0.02; 

            // Капли вытянутые (дождь)
            vec2 rainPos = vec2(x, y);
            vec2 dist = uv - rainPos;
            
            // Делаем капли тонкими и длинными
            dist.x *= 20.0; // Растягиваем по горизонтали, чтобы сузить
            dist.y *= 0.5;  // Растягиваем по вертикали
            
            float drop = smoothstep(0.04, 0.0, length(dist));
            
            // Цвет дождя (голубовато-белый)
            rain += vec3(0.6, 0.7, 1.0) * drop;
        }

        // Прозрачность (40%)
        gl_FragColor = vec4(rain, rain.r * 0.4);
    }
`;

// Компиляция WebGL
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0,
]), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

function render(time) {
    time *= 0.001;
    
    // Обновляем размеры, если окно изменилось
    if (gl.canvas.width !== window.innerWidth || gl.canvas.height !== window.innerHeight) {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerHeight;
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    }

    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, window.innerWidth, window.innerHeight);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);