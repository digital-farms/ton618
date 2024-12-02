uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    // Добавляем небольшую деформацию поверхности
    vec3 newPosition = position;
    float displacement = sin(position.x * 10.0 + time) * 0.1
                      + cos(position.y * 10.0 + time) * 0.1;
    newPosition += normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
