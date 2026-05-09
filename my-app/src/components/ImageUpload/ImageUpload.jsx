import React, { useState } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ value, onChange, placeholder }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Перевірка типу файлу
        if (!file.type.startsWith('image/')) {
            setError('Будь ласка, виберіть зображення');
            return;
        }

        // Перевірка розміру файлу (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Розмір файлу не повинен перевищувати 5MB');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Створення URL для превью
            const previewUrl = URL.createObjectURL(file);
            onChange(previewUrl);
            setIsLoading(false);
        } catch (err) {
            setError('Помилка завантаження зображення');
            setIsLoading(false);
        }
    };

    const handleUrlChange = (e) => {
        onChange(e.target.value);
        setError('');
    };

    return (
        <div className="dr-image-upload">
            <div className="dr-upload-methods">
                <div className="dr-upload-url">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={handleUrlChange}
                        placeholder={placeholder || "https://example.com/image.jpg"}
                        className="dr-url-input"
                    />
                </div>
                <div className="dr-upload-divider">
                    <span>або</span>
                </div>
                <div className="dr-upload-file">
                    <label className="dr-file-label">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="dr-file-input"
                            disabled={isLoading}
                        />
                        <span className="dr-file-button">
                            {isLoading ? '⏳' : '📁'} Завантажити
                        </span>
                    </label>
                </div>
            </div>
            
            {error && (
                <div className="dr-upload-error">
                    <span className="dr-error-icon">⚠️</span>
                    {error}
                </div>
            )}
            
            {value && (
                <div className="dr-image-preview">
                    <img 
                        src={value} 
                        alt="Preview" 
                        className="dr-preview-image"
                        onError={() => setError('Не вдалося завантажити зображення')}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
