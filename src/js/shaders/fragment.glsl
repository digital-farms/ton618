uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Simplex noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                       0.366025403784439,
                      -0.577350269189626,
                       0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    // Базовый цвет планеты
    vec3 baseColor = vec3(0.1, 0.1, 0.15);
    
    // Добавляем шум для создания текстуры
    float noise = snoise(vUv * 10.0 + time * 0.1);
    noise = (noise + 1.0) * 0.5;
    
    // Создаем градиент от центра
    float dist = length(vUv - vec2(0.5));
    float edge = smoothstep(0.4, 0.5, dist);
    
    // Атмосферный эффект
    float atmosphere = pow(1.0 - dist, 3.0);
    vec3 atmosphereColor = vec3(0.6, 0.8, 1.0);
    
    // Комбинируем все эффекты
    vec3 finalColor = mix(baseColor, vec3(1.0), noise * 0.3);
    finalColor = mix(finalColor, atmosphereColor, atmosphere * 0.3);
    finalColor = mix(finalColor, vec3(0.0), edge);
    
    // Добавляем пульсацию
    float pulse = sin(time) * 0.5 + 0.5;
    finalColor += atmosphereColor * pulse * 0.1;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
