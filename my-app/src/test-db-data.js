import React from 'react';
import { api } from './api/api';

// Тестовый файл для проверки данных из базы данных
const TestDBData = () => {
  const [materials, setMaterials] = React.useState([]);
  const [scenarios, setScenarios] = React.useState([]);
  const [userStats, setUserStats] = React.useState(null);
  const [diaryEntries, setDiaryEntries] = React.useState([]);

  React.useEffect(() => {
    // Загрузка материалов
    api.getMaterials()
      .then((data) => {
        console.log('📊 Материалы из БД:', data);
        setMaterials(data);
        
        // Проверка на русский текст в материалах
        data.forEach((material, index) => {
          console.log(`Материал ${index + 1}:`, material.title);
          if (material.title && /[а-яё]/i.test(material.title)) {
            console.log('🔴 НАЙДЕН РУССКИЙ ТЕКТ в материале:', material.title);
          }
          if (material.description && /[а-яё]/i.test(material.description)) {
            console.log('🔴 НАЙДЕН РУССКИЙ ТЕКТ в описании материала:', material.description);
          }
        });
      })
      .catch((err) => console.error('Ошибка загрузки материалов:', err));

    // Загрузка сценариев
    api.getScenarios()
      .then((data) => {
        console.log('📋 Сценарии из БД:', data);
        setScenarios(data);
        
        // Проверка на русский текст в сценариях
        data.forEach((scenario, index) => {
          console.log(`Сценарий ${index + 1}:`, scenario.name || scenario.title);
          if ((scenario.name || scenario.title) && /[а-яё]/i.test(scenario.name || scenario.title)) {
            console.log('🔴 НАЙДЕН РУССКИЙ ТЕКТ в сценарии:', scenario.name || scenario.title);
          }
          
          // Проверка текста в узлах сценария
          if (scenario.nodes) {
            scenario.nodes.forEach((node, nodeIndex) => {
              if (node.text && /[а-яё]/i.test(node.text)) {
                console.log(`🔴 НАЙДЕН РУССКИЙ ТЕКТ в узле ${nodeIndex + 1}:`, node.text);
              }
              
              // Проверка опций
              if (node.options) {
                node.options.forEach((option, optionIndex) => {
                  if (option.text && /[а-яё]/i.test(option.text)) {
                    console.log(`🔴 НАЙДЕН РУССКИЙ ТЕКТ в опции ${optionIndex + 1}:`, option.text);
                  }
                });
              }
            });
          }
        });
      })
      .catch((err) => console.error('Ошибка загрузки сценариев:', err));

    // Загрузка статистики пользователя
    const userId = localStorage.getItem('userId');
    if (userId) {
      api.getUserStats(userId)
        .then((data) => {
          console.log('📈 Статистика пользователя из БД:', data);
          setUserStats(data);
          
          // Проверка на русский текст в статистике
          if (data.username && /[а-яё]/i.test(data.username)) {
            console.log('🔴 НАЙДЕН РУССКИЙ ТЕКТ в имени пользователя:', data.username);
          }
        })
        .catch((err) => console.error('Ошибка загрузки статистики:', err));
    }
  }, []);

  const replaceRussianText = (text) => {
    // Замена русских букв на украинские
    const russianToUkrainian = {
      'а': 'а', 'б': 'б', 'в': 'в', 'г': 'г', 'д': 'д',
      'е': 'е', 'ё': 'є', 'ж': 'ж', 'з': 'з', 'и': 'и',
      'й': 'й', 'к': 'к', 'л': 'л', 'м': 'м', 'н': 'н',
      'о': 'о', 'п': 'п', 'р': 'р', 'с': 'с', 'т': 'т',
      'у': 'у', 'ф': 'ф', 'х': 'х', 'ц': 'ц', 'ч': 'ч',
      'ш': 'ш', 'щ': 'щ', 'ъ': 'ь', 'ы': 'и', 'ь': 'ь',
      'э': 'е', 'ю': 'ю', 'я': 'я',
      'А': 'А', 'Б': 'Б', 'В': 'В', 'Г': 'Г', 'Д': 'Д',
      'Е': 'Е', 'Ё': 'Є', 'Ж': 'Ж', 'З': 'З', 'И': 'И',
      'Й': 'Й', 'К': 'К', 'Л': 'Л', 'М': 'М', 'Н': 'Н',
      'О': 'О', 'П': 'П', 'Р': 'Р', 'С': 'С', 'Т': 'Т',
      'У': 'У', 'Ф': 'Ф', 'Х': 'Х', 'Ц': 'Ц', 'Ч': 'Ч',
      'Ш': 'Ш', 'Щ': 'Щ', 'Ъ': 'Ь', 'Ы': 'І', 'Ь': 'Ь',
      'Э': 'Е', 'Ю': 'Ю', 'Я': 'Я'
    };
    
    let result = text;
    Object.keys(russianToUkrainian).forEach(russianChar => {
      const ukrainianChar = russianToUkrainian[russianChar];
      const regex = new RegExp(russianChar, 'gi');
      result = result.replace(regex, ukrainianChar);
    });
    
    return result;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔍 Тестовые данные из базы данных</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>📊 Материалы ({materials.length})</h3>
        {materials.map((material, index) => (
          <div key={material._id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '5px 0',
            backgroundColor: /[а-яё]/i.test(material.title) ? '#ffebee' : '#f5f5f5'
          }}>
            <strong>{index + 1}. {material.title}</strong>
            <br />
            <small>Тип: {material.type} | Категория: {material.category}</small>
            {/[а-яё]/i.test(material.title) && (
              <div style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ Обнаружен русский текст!
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>📋 Сценарии ({scenarios.length})</h3>
        {scenarios.map((scenario, index) => (
          <div key={scenario._id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '5px 0',
            backgroundColor: /[а-яё]/i.test(scenario.name || scenario.title) ? '#ffebee' : '#f5f5f5'
          }}>
            <strong>{index + 1}. {scenario.name || scenario.title}</strong>
            <br />
            <small>Категория: {scenario.category} | Тип: {scenario.type}</small>
            {/[а-яё]/i.test(scenario.name || scenario.title) && (
              <div style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ Обнаружен русский текст!
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>📈 Статистика пользователя</h3>
        {userStats && (
          <div style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '5px 0',
            backgroundColor: userStats.username && /[а-яё]/i.test(userStats.username) ? '#ffebee' : '#f5f5f5'
          }}>
            <strong>Имя: {userStats.username}</strong>
            {userStats.username && /[а-яё]/i.test(userStats.username) && (
              <div style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                ⚠️ Обнаружен русский текст в имени!
                <br />
                <button 
                  onClick={() => {
                    const newName = replaceRussianText(userStats.username);
                    api.updateProfile({ username: newName })
                      .then(() => {
                        console.log('✅ Имя обновлено:', newName);
                        window.location.reload();
                      })
                      .catch(err => console.error('Ошибка обновления имени:', err));
                  }}
                  style={{ 
                    padding: '5px 10px', 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  🔄 Заменить на украинский
                </button>
              </div>
            )}
            <br />
            <strong>Уровень устойчивости: {userStats.resilience?.current || 0}%</strong>
            <br />
            <strong>Всего сессий: {userStats.totalSessions || 0}</strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>🔧 Инструменты</h3>
        <button 
          onClick={() => {
            console.log('🔄 Начинаю замену русского текста...');
            // Здесь можно добавить логику для массовой замены
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔄 Заменить весь русский текст
        </button>
        
        <button 
          onClick={() => {
            console.log('📊 Сохраняю отчет в консоль...');
            console.log('=== ОТЧЕТ ПО РУССКОМУ ТЕКСТУ ===');
            materials.forEach((material, index) => {
              if (/[а-яё]/i.test(material.title)) {
                console.log(`МАТЕРИАЛ ${index + 1}: ${material.title}`);
              }
            });
            scenarios.forEach((scenario, index) => {
              if (/[а-яё]/i.test(scenario.name || scenario.title)) {
                console.log(`СЦЕНАРИЙ ${index + 1}: ${scenario.name || scenario.title}`);
              }
            });
          }}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#FF9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Сохранить отчет
        </button>
      </div>
    </div>
  );
};

export default TestDBData;
