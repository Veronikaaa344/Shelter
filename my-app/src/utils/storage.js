// Утиліта для безпечної роботи з localStorage, особливо на macOS

class SafeStorage {
    constructor() {
        this.isAvailable = this.checkStorageAvailability();
        this.memoryStorage = {};
    }

    checkStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage не доступний, використовуємо memory storage:', e.message);
            return false;
        }
    }

    setItem(key, value) {
        try {
            if (this.isAvailable) {
                localStorage.setItem(key, value);
            } else {
                this.memoryStorage[key] = value;
            }
        } catch (e) {
            console.warn(`Не вдалося зберегти ${key} в localStorage, використовуємо memory storage:`, e.message);
            this.memoryStorage[key] = value;
        }
    }

    getItem(key) {
        try {
            if (this.isAvailable) {
                return localStorage.getItem(key);
            } else {
                return this.memoryStorage[key] || null;
            }
        } catch (e) {
            console.warn(`Не вдалося отримати ${key} з localStorage, використовуємо memory storage:`, e.message);
            return this.memoryStorage[key] || null;
        }
    }

    removeItem(key) {
        try {
            if (this.isAvailable) {
                localStorage.removeItem(key);
            } else {
                delete this.memoryStorage[key];
            }
        } catch (e) {
            console.warn(`Не вдалося видалити ${key} з localStorage, використовуємо memory storage:`, e.message);
            delete this.memoryStorage[key];
        }
    }

    clear() {
        try {
            if (this.isAvailable) {
                localStorage.clear();
            } else {
                this.memoryStorage = {};
            }
        } catch (e) {
            console.warn('Не вдалося очистити localStorage, використовуємо memory storage:', e.message);
            this.memoryStorage = {};
        }
    }

    // Додатковий метод для перевірки доступності
    isLocalStorageAvailable() {
        return this.isAvailable;
    }
}

// Створюємо глобальний екземпляр
const safeStorage = new SafeStorage();

// Експортуємо як заміну localStorage
export default safeStorage;
