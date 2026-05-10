import React from 'react';
import { ChevronRight } from 'lucide-react';

const AdviceView = () => (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Поради та Знання</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: "Гігієна сну в стресі", cat: "Фізіологія", color: "border-blue-500/30 bg-blue-500/5" },
          { title: "Емоційний інтелект", cat: "Психологія", color: "border-purple-500/30 bg-purple-500/5" },
          { title: "Медітація для новачків", cat: "Практика", color: "border-emerald-500/30 bg-emerald-500/5" },
          { title: "Як працює кортизол", cat: "Наука", color: "border-orange-500/30 bg-orange-500/5" },
        ].map((advice, i) => (
          <div key={i} className={`p-10 robust-rounded-48 border-2 group cursor-pointer transition-all hover:scale-[1.02] ${advice.color} shadow-xl shadow-black/20 text-left`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{advice.cat}</p>
            <h4 className="text-xl font-bold text-white uppercase leading-none tracking-tight">{advice.title}</h4>
            <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-white transition-all italic">Читати статтю <ChevronRight size={14} /></div>
          </div>
        ))}
      </div>
    </div>
);

export default AdviceView;
