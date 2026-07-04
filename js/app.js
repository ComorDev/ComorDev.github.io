document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('open-projects-widget');
    const closeBtn = document.getElementById('close-projects-widget');
    const widget = document.getElementById('projects-widget');
    const overlay = document.getElementById('widget-overlay');

    // Функция открытия виджета
    function openWidget() {
        widget.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл сайта
    }

    // Функция закрытия виджета
    function closeWidget() {
        widget.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем скролл
    }

    // Обработчики событий
    if (openBtn) openBtn.addEventListener('click', openWidget);
    if (closeBtn) closeBtn.addEventListener('click', closeWidget);
    
    // Закрытие по клику вне виджета (на затемненный фон)
    if (overlay) overlay.addEventListener('click', closeWidget);
    
    // Закрытие по клавише Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && widget.classList.contains('active')) {
            closeWidget();
        }
    });
});