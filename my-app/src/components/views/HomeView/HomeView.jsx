import React from 'react';
import { 
    Wind, Brain, Lightbulb, PenLine, MessageCircle, Search, Layout, Activity 
} from 'lucide-react';

const HomeView = ({ 
    searchTerm, 
    navigateTo, 
    simulatorScenariosList, 
    setSimulatorScenarioId, 
    setIsFindDifferencesMode, 
    setIsSortingMode, 
    setIsSimulatorMode 
}) => {
    const baseCards = [
      { title: "Дихання", cat: "Практика", icon: <Wind/>, color: "from-emerald-500 to-emerald-600", onClick: () => navigateTo('practice') },
      { title: "Діагностика", cat: "Тестування", icon: <Brain/>, color: "from-blue-500 to-blue-600", onClick: () => navigateTo('testing') },
      { title: "Поради", cat: "Корисні поради", icon: <Lightbulb/>, color: "from-orange-500 to-orange-600", onClick: () => navigateTo('advice') },
      { title: "Щоденник", cat: "Рефлексія", icon: <PenLine/>, color: "from-purple-500 to-purple-600", onClick: () => navigateTo('diary') },
      { title: "Чат-тренування", cat: "Практика", icon: <MessageCircle/>, color: "from-rose-500 to-rose-600", onClick: () => navigateTo('chat') },
      { title: "Відмінності", cat: "Практика", icon: <Search/>, color: "from-teal-500 to-teal-600", onClick: () => { 
          const diffScenario = simulatorScenariosList.find(s => s.type === 'findDifferences' || (s.name && s.name.toLowerCase().includes('відмін')));
          if (diffScenario) setSimulatorScenarioId(diffScenario._id);
          setIsFindDifferencesMode(true); 
      } },
      { title: "Сортування", cat: "Практика", icon: <Layout/>, color: "from-amber-500 to-amber-600", onClick: () => { 
          const sortScenario = simulatorScenariosList.find(s => s.type === 'sorting' || (s.name && s.name.toLowerCase().includes('сорт')));
          if (sortScenario) setSimulatorScenarioId(sortScenario._id);
          setIsSortingMode(true); 
      } }
    ];

    const simulatorCards = simulatorScenariosList.map((scenario, i) => {
      const colors = [
        "from-indigo-500 to-indigo-600",
        "from-violet-500 to-violet-600",
        "from-fuchsia-500 to-fuchsia-600",
        "from-cyan-500 to-cyan-600"
      ];
      return {
        title: scenario.title || `Тренажер ${i + 1}`,
        cat: "Симулятор",
        icon: <Activity/>,
        color: colors[i % colors.length],
        onClick: () => {
          setSimulatorScenarioId(scenario._id);
          setIsSimulatorMode(true);
        }
      };
    });

    const cards = [...baseCards, ...simulatorCards].filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="p-8 space-y-10 animate-in fade-in duration-700">
        <section>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            {searchTerm ? `Пошук: "${searchTerm}"` : "Час для спокою"}
          </h1>
          {!searchTerm && <p className="text-slate-500 max-w-xl text-xl italic font-medium">Ваш ментальний баланс сьогодні в нормі. Саме час для невеликих вправ.</p>}
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, i) => (
            <div 
              key={i} 
              onClick={card.onClick} 
              className="group relative h-80 robust-card cursor-pointer shadow-2xl"
            >
              <div className={`card-bg-layer bg-gradient-to-br ${card.color} opacity-90`}></div>
              
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500"></div>
              
              <div className="relative p-10 h-full flex flex-col justify-between text-white z-10">
                  <div className="p-4 bg-white/20 rounded-2xl w-fit backdrop-blur-md shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:bg-white/30 group-hover:rotate-12">
                    {card.icon}
                  </div>
                  <div className="transition-all duration-500 group-hover:translate-x-2">
                    <p className="text-[10px] font-black uppercase mb-1 opacity-70 tracking-widest">{card.cat}</p>
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter leading-none group-hover:text-white drop-shadow-md">
                      {card.title}
                    </h4>
                  </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          ))}
        </div>
      </div>
    );
};

export default HomeView;
