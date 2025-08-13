document.addEventListener('DOMContentLoaded', function() {
    // Загрузка списка администраторов для удаления
    loadAdminsForRemoval();
    
    // Загрузка списка заблокированных IP
    loadBlockedIPs();
    
    // Загрузка логов посещений
    loadVisitLogs();
    
    // Обработка формы добавления администратора
    const addAdminForm = document.getElementById('add-admin-form');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('admin-name').value;
            const username = document.getElementById('admin-username').value;
            const role = document.getElementById('admin-role').value;
            
            // Здесь должен быть запрос к серверу для добавления администратора
            // Для демонстрации просто показываем сообщение
            alert(`Администратор ${name} (@${username}) добавлен с ролью "${role}"`);
            
            // Очищаем форму
            addAdminForm.reset();
            
            // Обновляем список администраторов
            loadAdminsForRemoval();
        });
    }
    
    // Обработка формы удаления администратора
    const removeAdminForm = document.getElementById('remove-admin-form');
    if (removeAdminForm) {
        removeAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const adminToRemove = document.getElementById('admin-to-remove').value;
            
            if (adminToRemove && confirm(`Вы уверены, что хотите удалить администратора ${adminToRemove}?`)) {
                // Здесь должен быть запрос к серверу для удаления администратора
                alert(`Администратор ${adminToRemove} удален`);
                
                // Обновляем список администраторов
                loadAdminsForRemoval();
            }
        });
    }
    
    // Обработка формы блокировки IP
    const blockIpForm = document.getElementById('block-ip-form');
    if (blockIpForm) {
        blockIpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const ipToBlock = document.getElementById('ip-to-block').value;
            const reason = document.getElementById('block-reason').value;
            
            if (ipToBlock && confirm(`Заблокировать IP-адрес ${ipToBlock}?`)) {
                // Здесь должен быть запрос к серверу для блокировки IP
                alert(`IP-адрес ${ipToBlock} заблокирован. Причина: ${reason || 'не указана'}`);
                
                // Очищаем форму
                blockIpForm.reset();
                
                // Обновляем список заблокированных IP
                loadBlockedIPs();
            }
        });
    }
    
    // Обработка формы разблокировки IP
    const unblockIpForm = document.getElementById('unblock-ip-form');
    if (unblockIpForm) {
        unblockIpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const ipToUnblock = document.getElementById('ip-to-unblock').value;
            
            if (ipToUnblock && confirm(`Разблокировать IP-адрес ${ipToUnblock}?`)) {
                // Здесь должен быть запрос к серверу для разблокировки IP
                alert(`IP-адрес ${ipToUnblock} разблокирован`);
                
                // Обновляем список заблокированных IP
                loadBlockedIPs();
            }
        });
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                window.location.href = 'main.html';
            }
        });
    }
    
    // Функция загрузки администраторов для удаления
    function loadAdminsForRemoval() {
        const adminSelect = document.getElementById('admin-to-remove');
        
        // Здесь должен быть запрос к серверу для получения списка администраторов
        // Для демонстрации используем моковые данные
        const mockAdmins = [
            { id: 1, name: "Админ 1", username: "@admin1" },
            { id: 2, name: "Админ 2", username: "@admin2" },
            { id: 3, name: "Админ 3", username: "@admin3" }
        ];
        
        if (adminSelect) {
            // Очищаем существующие опции, кроме первой
            while (adminSelect.options.length > 1) {
                adminSelect.remove(1);
            }
            
            // Добавляем администраторов в список
            mockAdmins.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.username;
                option.textContent = `${admin.name} (${admin.username})`;
                adminSelect.appendChild(option);
            });
        }
    }
    
    // Функция загрузки заблокированных IP
    function loadBlockedIPs() {
        const ipSelect = document.getElementById('ip-to-unblock');
        
        // Здесь должен быть запрос к серверу для получения списка заблокированных IP
        // Для демонстрации используем моковые данные
        const mockBlockedIPs = [
            { ip: "192.168.1.100", reason: "Нарушение правил" },
            { ip: "10.0.0.15", reason: "Подозрительная активность" }
        ];
        
        if (ipSelect) {
            // Очищаем существующие опции, кроме первой
            while (ipSelect.options.length > 1) {
                ipSelect.remove(1);
            }
            
            // Добавляем IP в список
            mockBlockedIPs.forEach(ip => {
                const option = document.createElement('option');
                option.value = ip.ip;
                option.textContent = `${ip.ip} (${ip.reason})`;
                ipSelect.appendChild(option);
            });
        }
    }
    
    // Функция загрузки логов посещений
    function loadVisitLogs() {
        const logsContainer = document.getElementById('visits-log');
        
        // Здесь должен быть запрос к серверу для получения логов
        // Для демонстрации используем моковые данные
        const mockLogs = [
            { ip: "192.168.1.1", timestamp: "2023-05-15T10:30:00Z", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            { ip: "10.0.0.2", timestamp: "2023-05-15T11:15:00Z", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" },
            { ip: "172.16.0.5", timestamp: "2023-05-15T12:45:00Z", userAgent: "Mozilla/5.0 (Linux; Android 10; SM-G950F)" }
        ];
        
        if (logsContainer) {
            if (mockLogs.length > 0) {
                logsContainer.innerHTML = mockLogs.map(log => `
                    <div class="log-entry">
                        <strong>${new Date(log.timestamp).toLocaleString()}</strong><br>
                        IP: ${log.ip}<br>
                        User Agent: ${log.userAgent}
                    </div>
                `).join('');
            } else {
                logsContainer.innerHTML = '<p>Нет данных о посещениях</p>';
            }
        }
    }
});