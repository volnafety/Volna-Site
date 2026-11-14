    function toggleAccordion(header) {
        const item = header.parentElement;
        item.classList.toggle('active');
        const span = header.querySelector('span');
        span.textContent = item.classList.contains('active') ? '−' : '+';
      }

      // Плавная прокрутка
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
          });
        });
      });

      // ==========================================
      // АНИМАЦИЯ ПРИ ПРОКРУТКЕ
      // ==========================================
      document.addEventListener("DOMContentLoaded", function() {
      // Находим все секции и карточки
      const elementsToAnimate = document.querySelectorAll('section, .card');

      // Скрываем их
      elementsToAnimate.forEach(el => {
          el.style.opacity = '0';
          el.style.transform = 'translateY(60px)';
          el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      });

      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.style.opacity = '1';
                  entry.target.style.transform = 'translateY(0)';
                  observer.unobserve(entry.target);
              }
          });
      }, {
          threshold: 0.1
      });

      elementsToAnimate.forEach(el => {
          observer.observe(el);
      });
  });

// ==========================================
// ЗАГРУЗКА ОТЧЕТОВ И ПРОСМОТР ФОТО
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.getElementById('publicGallery');
    if (!gallery) return; 

    let images = JSON.parse(localStorage.getItem('volna_reports') || '[]');
    
    images.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.maxWidth = '200px';
        img.style.borderRadius = '8px';
        img.style.border = '2px solid #00AA55';
        img.style.cursor = 'pointer'; // Курсор-рука, чтобы было понятно, что можно кликнуть
        
        // При клике на фото — открываем на весь экран
        img.onclick = function() {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImg');
            modal.style.display = 'flex'; // Показываем окно
            modalImg.src = this.src;      // Подставляем картинку
        };

        gallery.appendChild(img);
    });
});

// Функция закрытия окна
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}