// Генерация звезд на фоне
function createStars() {
    const starsContainer = document.querySelector('.stars');
    const numberOfStars = 30; // Небольшое количество звезд

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Случайное позиционирование
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Случайный размер (маленькие точки)
        const size = Math.random() * 2 + 1;
        
        // Случайная длительность мерцания
        const duration = Math.random() * 3 + 2;
        
        // Случайная задержка начала анимации
        const delay = Math.random() * 3;
        
        // Случайная интенсивность свечения
        const intensity = Math.random() * 0.5 + 0.3;

        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            --duration: ${duration}s;
            --delay: -${delay}s;
            --intensity: ${intensity};
        `;

        starsContainer.appendChild(star);
    }
}

// Создаем звезды при загрузке страницы
window.addEventListener('load', createStars);
