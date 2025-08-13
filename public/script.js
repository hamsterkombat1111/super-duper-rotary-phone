document.addEventListener('DOMContentLoaded', function() {
    // Переключение вкладок
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок и вкладок
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            // Показываем соответствующую вкладку
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Если это вкладка администраторов, загружаем список
            if (tabId === 'tab3') {
                loadAdminsList();
            }
        });
    });
    
    // Попап сюрприза
    const surpriseBtn = document.getElementById('surprise-btn');
    const surprisePopup = document.getElementById('surprise-popup');
    const closePopup = document.querySelector('.close-popup');
    
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', function() {
            surprisePopup.style.display = 'flex';
        });
    }
    
    if (closePopup) {
        closePopup.addEventListener('click', function() {
            surprisePopup.style.display = 'none';
        });
    }
    
    // Модальное окно входа
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            loginModal.style.display = 'flex';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }
    
    // Закрытие модальных окон при клике вне их
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === surprisePopup) {
            surprisePopup.style.display = 'none';
        }
    });
    
    // Форма входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Проверка учетных данных
            if (username === 'admin' && password === 'qwerqwer') {
                alert('Успешный вход!');
                window.location.href = 'admin.html';
            } else {
                alert('Неверный логин или пароль!');
            }
        });
    }
    
    // Загрузка списка администраторов
    function loadAdminsList() {
        const adminsList = document.getElementById('admins-list');
        
        // Здесь должен быть запрос к базе данных
        // Для демонстрации используем моковые данные
        const mockAdmins = [
            { name: "Админ 1", role: "Главный админ", username: "@admin1" },
            { name: "Админ 2", role: "Модератор", username: "@admin2" },
            { name: "Админ 3", role: "Модератор", username: "@admin3" }
        ];
        
        if (adminsList) {
            if (mockAdmins.length > 0) {
                adminsList.innerHTML = mockAdmins.map(admin => `
                    <div class="admin-card">
                        <div class="admin-avatar">${admin.name.charAt(0)}</div>
                        <div class="admin-info">
                            <h4>${admin.name}</h4>
                            <p>${admin.role}</p>
                            <p>${admin.username}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                adminsList.innerHTML = '<p>Нет данных об администраторах</p>';
            }
        }
    }
    
    // Логирование посещения страницы
    logVisit();
    
    function logVisit() {
        // Здесь должен быть код для отправки данных о посещении на сервер
        // Можем использовать navigator для получения информации о браузере
        const userAgent = navigator.userAgent;
        
        // Отправляем данные на сервер
        fetch('/log-visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: window.location.pathname,
                userAgent: userAgent,
                timestamp: new Date().toISOString()
            })
        }).catch(error => console.error('Ошибка логирования:', error));
    }
});