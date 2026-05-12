import { api } from './api/api';

// Скрипт для просмотра и исправления данных из БД
const DBManager = () => {
  const [data, setData] = React.useState({
    materials: [],
    scenarios: [],
    userProfiles: []
  });

  React.useEffect(() => {
    console.log('📊 Загружаю данные из БД...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('\n📚 Загружаю материалы...');
      const materials = await api.getMaterials();
      console.log('✅ Материалы загружены:', materials.length);
      
      console.log('\n📋 Загружаю сценарии...');
      const scenarios = await api.getScenarios();
      console.log('✅ Сценарии загружены:', scenarios.length);
      
      console.log('\n👥 Загружаю профили пользователей...');
      // Попробуем получить всех пользователей (если API поддерживает)
      try {
        const profiles = await api.getAllProfiles ? api.getAllProfiles() : [];
        console.log('✅ Профили загружены:', profiles.length);
        
        setData({
          materials,
          scenarios,
          userProfiles: profiles
        });
      } catch (error) {
        console.log('⚠️ Не удалось загрузить профили, используем только текущий профиль');
        const currentProfile = await api.getProfile();
        setData({
          materials,
          scenarios,
          userProfiles: currentProfile ? [currentProfile] : []
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
    }
  };

  const updateMaterial = async (materialId, updates) => {
    try {
      console.log(`🔧 Обновляю материал ${materialId}:`, updates);
      await api.updateMaterial(materialId, updates);
      console.log('✅ Материал обновлен');
      loadData(); // Перезагружаем данные
    } catch (error) {
      console.error('❌ Ошибка обновления материала:', error);
    }
  };

  const updateScenario = async (scenarioId, updates) => {
    try {
      console.log(`🔧 Обновляю сценарий ${scenarioId}:`, updates);
      await api.updateScenario(scenarioId, updates);
      console.log('✅ Сценарий обновлен');
      loadData(); // Перезагружаем данные
    } catch (error) {
      console.error('❌ Ошибка обновления сценария:', error);
    }
  };

  const updateUserProfile = async (userId, updates) => {
    try {
      console.log(`🔧 Обновляю профиль пользователя ${userId}:`, updates);
      await api.updateProfile(updates);
      console.log('✅ Профиль обновлен');
      loadData(); // Перезагружаем данные
    } catch (error) {
      console.error('❌ Ошибка обновления профиля:', error);
    }
  };

  const replaceRussianText = (text) => {
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
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f8fafc'
    }}>
      <h2 style={{ 
        color: '#1f2937', 
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        📊 Менеджер базы данных
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Материалы */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          padding: '15px', 
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>📚 Материалы ({data.materials.length})</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {data.materials.map((material, index) => (
              <div key={material._id} style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                margin: '5px 0',
                backgroundColor: /[а-яё]/i.test(material.title) ? '#ffebee' : '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{index + 1}. {material.title}</strong>
                    <br />
                    <small>Тип: {material.type} | Категория: {material.category}</small>
                  </div>
                  <button 
                    onClick={() => {
                      const newTitle = replaceRussianText(material.title);
                      updateMaterial(material._id, { title: newTitle });
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔧 Исправить
                  </button>
                </div>
                {/[а-яё]/i.test(material.title) && (
                  <div style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                    ⚠️ Обнаружен русский текст!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Сценарии */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          padding: '15px', 
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>📋 Сценарии ({data.scenarios.length})</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {data.scenarios.map((scenario, index) => (
              <div key={scenario._id} style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                margin: '5px 0',
                backgroundColor: /[а-яё]/i.test(scenario.name || scenario.title) ? '#ffebee' : '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{index + 1}. {scenario.name || scenario.title}</strong>
                    <br />
                    <small>Категория: {scenario.category} | Тип: {scenario.type}</small>
                  </div>
                  <button 
                    onClick={() => {
                      const newName = replaceRussianText(scenario.name || scenario.title);
                      updateScenario(scenario._id, { name: newName });
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔧 Исправить
                  </button>
                </div>
                {/[а-яё]/i.test(scenario.name || scenario.title) && (
                  <div style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                    ⚠️ Обнаружен русский текст!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Профили пользователей */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          padding: '15px', 
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>👥 Профили пользователей ({data.userProfiles.length})</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {data.userProfiles.map((profile, index) => (
              <div key={profile._id || index} style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                margin: '5px 0',
                backgroundColor: /[а-яё]/i.test(profile.username) ? '#ffebee' : '#f9fafb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{index + 1}. {profile.username}</strong>
                    <br />
                    <small>Email: {profile.email || 'Не указан'}</small>
                  </div>
                  <button 
                    onClick={() => {
                      const newUsername = replaceRussianText(profile.username);
                      updateUserProfile(profile._id, { username: newUsername });
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    🔧 Исправить
                  </button>
                </div>
                {/[а-яё]/i.test(profile.username) && (
                  <div style={{ color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                    ⚠️ Обнаружен русский текст!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px',
        justifyContent: 'center'
      }}>
        <button 
          onClick={loadData}
          style={{
            padding: '15px 30px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          🔄 Обновить данные
        </button>
        
        <button 
          onClick={() => {
            console.log('📊 Сохраняю отчет в консоль...');
            console.log('=== ОТЧЕТ ПО ДАННЫМ БД ===');
            console.log('📚 Материалы:');
            data.materials.forEach((material, index) => {
              const hasRussian = /[а-яё]/i.test(material.title);
              console.log(`${index + 1}. ${material.title} ${hasRussian ? '🔴 РУССКИЙ' : '✅ УКРАИНСКИЙ'}`);
            });
            
            console.log('📋 Сценарии:');
            data.scenarios.forEach((scenario, index) => {
              const hasRussian = /[а-яё]/i.test(scenario.name || scenario.title);
              console.log(`${index + 1}. ${scenario.name || scenario.title} ${hasRussian ? '🔴 РУССКИЙ' : '✅ УКРАИНСКИЙ'}`);
            });
            
            console.log('👥 Профили пользователей:');
            data.userProfiles.forEach((profile, index) => {
              const hasRussian = /[а-яё]/i.test(profile.username);
              console.log(`${index + 1}. ${profile.username} ${hasRussian ? '🔴 РУССКИЙ' : '✅ УКРАИНСКИЙ'}`);
            });
          }}
          style={{
            padding: '15px 30px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📊 Сохранить отчет
        </button>
      </div>
    </div>
  );
};

export default DBManager;
