// Управление громкостью звука с сохранением в куки
export const AudioManager = {
  // Получаем сохраненную громкость или устанавливаем по умолчанию
  getVolume: () => {
    const savedVolume = localStorage.getItem('audioVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.3; // Минимальная громкость по умолчанию
  },

  // Сохраняем громкость
  setVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume)); // Ограничиваем 0-1
    localStorage.setItem('audioVolume', clampedVolume.toString());
    
    // Применяем ко всем аудио элементам
    const audioElements = document.querySelectorAll('audio, video');
    audioElements.forEach(element => {
      element.volume = clampedVolume;
    });
    
    console.log(`🔊 Громкость установлена: ${Math.round(clampedVolume * 100)}%`);
  },

  // Показываем диалог подтверждения громкости
  requestAudioPermission: () => {
    return new Promise((resolve) => {
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 24px;
        z-index: 10000;
        color: white;
        font-family: Arial, sans-serif;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        max-width: 400px;
      `;

      dialog.innerHTML = `
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold;">
          🔊 Настройка звука
        </h3>
        <p style="margin: 0 0 20px 0; line-height: 1.5;">
          Перед воспроизведением звука, пожалуйста, установите комфортную громкость.
          Текущая громкость: <span id="volume-display">30%</span>
        </p>
        <input type="range" id="volume-slider" min="0" max="100" value="30" 
               style="width: 100%; margin: 0 0 20px 0;">
        <div style="display: flex; gap: 12px;">
          <button id="confirm-volume" style="
            background: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
          ">Применить</button>
          <button id="cancel-volume" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
          ">Отмена</button>
        </div>
      `;

      document.body.appendChild(dialog);

      const slider = document.getElementById('volume-slider');
      const display = document.getElementById('volume-display');
      const confirmBtn = document.getElementById('confirm-volume');
      const cancelBtn = document.getElementById('cancel-volume');

      // Обновляем отображение громкости
      const updateDisplay = () => {
        display.textContent = `${slider.value}%`;
      };

      slider.addEventListener('input', updateDisplay);
      updateDisplay();

      // Обработчики кнопок
      confirmBtn.addEventListener('click', () => {
        const volume = parseInt(slider.value) / 100;
        AudioManager.setVolume(volume);
        document.body.removeChild(dialog);
        resolve(true);
      });

      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(dialog);
        resolve(false);
      });

      // Закрытие при клике вне диалога
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          document.body.removeChild(dialog);
          resolve(false);
        }
      });
    });
  }
};
