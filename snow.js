// Инициализация WebGL для снега на сайте
// Проверяем, на какой странице мы находимся
function shouldSnow() {
    let hash = window.location.hash; // Берем часть ссылки после #
    
    // Если мы на странице правил, FAQ, новостей или контактов — снег отключаем
    if (hash === '#rules' || hash === '#faq' || hash === '#news' || hash === '#contacts') {
        return false;
    }
    return true; // На главной — включаем
}

// Если снег не нужен, вообще не создаем холст
if (!shouldSnow()) {
    console.log("Снег отключен на этой странице.");
} else {
    // ... (весь остальной код снега должен быть внутри этого else)
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.width = window.innerHeight;
canvas.height = window.innerHeight;
canvas.style.height = '100vh';
canvas.style.zIndex = '9999'; // Позади всего контента сайта
canvas.style.pointerEvents = 'none'; // Чтобы не мешал кликать по ссылкам
document.body.appendChild(canvas);

const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false});

const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

// СЮДА ВСТАВЬ СВОЙ КОД СНЕГА ИЗ SHADERTOY (только саму функцию mainImage, заменив iTime на u_time, iResolution на u_resolution)
const fragmentShaderSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 uv = fragCoord / u_resolution.xy;
// uv.x *= u_resolution.x / u_resolution.y;

        vec3 snow = vec3(0.0);
        float t = u_time * 0.1;

        for(float i = 0.0; i < 100.0; i++) { // Твой SNOW_AMOUNT
            float randomX = rand(vec2(i, 1.0));
            float randomY = rand(vec2(i, 2.0));
            float randomSize = rand(vec2(i, 3.0)) * 0.009 + 0.004;
            float randomSpeed = rand(vec2(i, 5.0)) * 0.5 + 0.5;
            float randomWind = rand(vec2(i, 6.0)) * 0.1 - 0.05;

            float y = fract(randomY - t * randomSpeed);
            float x = randomX + randomWind * sin(t + i);

            vec2 snowPos = vec2(x, y);
            float dist = length(uv - snowPos);
            float twinkle = 0.7 + 0.3 * sin(u_time * 3.0 + i);
            float circle = smoothstep(randomSize, 0.0, dist);
            snow += vec3(circle) * twinkle;
        }

// vec3 sky = vec3(0.05, 0.1, 0.2); 
        // Если экран широкий, сжимаем X, чтобы круги стали круглыми
        vec2 finalUV = gl_FragCoord.xy / u_resolution.xy;
        finalUV.x *= u_resolution.x / u_resolution.y;
        
        // Пересчитываем цвет для правильных пропорций
        gl_FragColor = vec4(snow, snow.r * 0.64);
    }
`;

// (дальше идет стандартный код WebGL для компиляции шейдера...)
// Стандартный код компиляции шейдеров WebGL
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Квадрат на весь экран
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

// Локации для передачи времени и разрешения экрана
const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

// Функция отрисовки (анимация)
function render(time) {
    
    time *= 0.001; // переводим миллисекунды в секунды
    
    // Подгоняем канвас под размер окна
    const width = gl.canvas.clientWidth;
    const height = gl.canvas.clientHeight;
    if (gl.canvas.width !== width || gl.canvas.height !== height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
        gl.viewport(0, 0, width, height);
    }

    // Передаем данные в шейдер
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, width, height);

    // Рисуем
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
    }
}

// Запускаем
requestAnimationFrame(render);