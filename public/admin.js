document.addEventListener('DOMContentLoaded', function() {
  // DOM элементы
  const addAdminForm = document.getElementById('add-admin-form');
  const removeAdminForm = document.getElementById('remove-admin-form');
  const blockIpForm = document.getElementById('block-ip-form');
  const unblockIpForm = document.getElementById('unblock-ip-form');
  const logoutBtn = document.getElementById('logout-btn');
  const adminsList = document.getElementById('admins-list');
  const visitsLog = document.getElementById('visits-log');

  // Загрузка данных
  loadAdmins();
  loadBlockedIPs();
  loadVisitLogs();

  // Добавление администратора
  if (addAdminForm) {
    addAdminForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('admin-name').value;
      const username = document.getElementById('admin-username').value;
      const role = document.getElementById('admin-role').value;

      try {
        const response = await fetch('/api/admins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, username, role })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Администратор добавлен');
          addAdminForm.reset();
          loadAdmins();
        } else {
          alert(data.error || 'Ошибка при добавлении');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при добавлении');
      }
    });
  }

  // Удаление администратора
  if (removeAdminForm) {
    removeAdminForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const adminId = document.getElementById('admin-to-remove').value;
      
      if (!adminId) {
        alert('Выберите администратора');
        return;
      }

      if (confirm('Вы уверены, что хотите удалить этого администратора?')) {
        try {
          const response = await fetch(`/api/admins/${adminId}`, {
            method: 'DELETE'
          });

          const data = await response.json();
          
          if (response.ok) {
            alert('Администратор удален');
            loadAdmins();
          } else {
            alert(data.error || 'Ошибка при удалении');
          }
        } catch (error) {
          console.error('Ошибка:', error);
          alert('Ошибка при удалении');
        }
      }
    });
  }

  // Блокировка IP
  if (blockIpForm) {
    blockIpForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const ip = document.getElementById('ip-to-block').value;
      const reason = document.getElementById('block-reason').value;

      if (!ip) {
        alert('Введите IP-адрес');
        return;
      }

      try {
        const response = await fetch('/api/blocked-ips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ip, reason })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('IP-адрес заблокирован');
          blockIpForm.reset();
          loadBlockedIPs();
        } else {
          alert(data.error || 'Ошибка при блокировке');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при блокировке');
      }
    });
  }

  // Разблокировка IP
  if (unblockIpForm) {
    unblockIpForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const ip = document.getElementById('ip-to-unblock').value;
      
      if (!ip) {
        alert('Выберите IP-адрес');
        return;
      }

      if (confirm(`Разблокировать IP-адрес ${ip}?`)) {
        try {
          const response = await fetch(`/api/blocked-ips/${ip}`, {
            method: 'DELETE'
          });

          const data = await response.json();
          
          if (response.ok) {
            alert('IP-адрес разблокирован');
            loadBlockedIPs();
          } else {
            alert(data.error || 'Ошибка при разблокировке');
          }
        } catch (error) {
          console.error('Ошибка:', error);
          alert('Ошибка при разблокировке');
        }
      }
    });
  }

  // Выход
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Вы уверены, что хотите выйти?')) {
        window.location.href = 'main.html';
      }
    });
  }

  // Функции загрузки данных
  async function loadAdmins() {
    try {
      const response = await fetch('/api/admins');
      const admins = await response.json();
      
      if (adminsList) {
        if (admins.length > 0) {
          adminsList.innerHTML = admins.map(admin => `
            <div class="admin-card">
              <div class="admin-avatar">${admin.name.charAt(0)}</div>
              <div class="admin-info">
                <h4>${admin.name}</h4>
                <p>${admin.role || 'Модератор'}</p>
                <p>${admin.username}</p>
              </div>
            </div>
          `).join('');
          
          // Обновляем select для удаления
          const adminSelect = document.getElementById('admin-to-remove');
          if (adminSelect) {
            adminSelect.innerHTML = '<option value="">-- Выберите --</option>' + 
              admins.map(admin => 
                `<option value="${admin.id}">${admin.name} (${admin.username})</option>`
              ).join('');
          }
        } else {
          adminsList.innerHTML = '<p>Нет администраторов</p>';
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки администраторов:', error);
    }
  }

  async function loadBlockedIPs() {
    try {
      const response = await fetch('/api/blocked-ips');
      const ips = await response.json();
      
      const ipSelect = document.getElementById('ip-to-unblock');
      if (ipSelect) {
        ipSelect.innerHTML = '<option value="">-- Выберите --</option>' + 
          ips.map(ip => 
            `<option value="${ip.ip}">${ip.ip} (${ip.reason || 'без причины'})</option>`
          ).join('');
      }
    } catch (error) {
      console.error('Ошибка загрузки IP:', error);
    }
  }

  async function loadVisitLogs() {
    try {
      const response = await fetch('/api/visit-logs');
      const logs = await response.json();
      
      if (visitsLog) {
        if (logs.length > 0) {
          visitsLog.innerHTML = logs.map(log => `
            <div class="log-entry">
              <strong>${new Date(log.visited_at).toLocaleString()}</strong><br>
              IP: ${log.ip}<br>
              Страница: ${log.page || 'Главная'}<br>
              Устройство: ${log.user_agent || 'Неизвестно'}
            </div>
          `).join('');
        } else {
          visitsLog.innerHTML = '<p>Нет данных о посещениях</p>';
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
    }
  }
});
