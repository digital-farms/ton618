// Загрузка шейдеров
async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

// Создание и настройка планеты
class Planet {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        
        // Фиксированные размеры
        this.width = 800;
        this.height = 800;
        
        // Настройка камеры
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.camera.position.z = 2;

        // Настройка рендерера
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: true
        });
        
        // Установка фиксированного размера
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.clock = new THREE.Clock();
        this.uniforms = {
            time: { value: 0 }
        };

        this.init();
    }

    async init() {
        // Загрузка шейдеров
        const vertexShader = await loadShader('./src/js/shaders/vertex.glsl');
        const fragmentShader = await loadShader('./src/js/shaders/fragment.glsl');

        // Создание геометрии и материала
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            transparent: true
        });

        // Создание меша
        this.planet = new THREE.Mesh(geometry, material);
        this.scene.add(this.planet);

        // Запуск анимации
        this.animate();
    }

    onWindowResize() {
        // Размер остается фиксированным
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Обновление времени для шейдеров
        this.uniforms.time.value = this.clock.getElapsedTime();

        // Плавное вращение планеты
        this.planet.rotation.y += 0.001;

        this.renderer.render(this.scene, this.camera);
    }
}

// Создание планеты при загрузке страницы
window.addEventListener('load', () => {
    new Planet('planet-canvas');
});
