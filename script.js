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