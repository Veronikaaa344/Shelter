import React from 'react';
import { Search, X, Bell } from 'lucide-react';
import HoldSOSButton from '../HoldSOSButton/HoldSOSButton';

const MainHeader = React.memo(({ 
    searchTerm, 
    setSearchTerm, 
    setShowSOS 
}) => {
    return (
        <header className="h-24 px-8 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-[#0b0f1a]/60 border-b border-slate-800/50">
            <div className="flex items-center gap-4 bg-slate-900/40 px-6 py-3 rounded-full border border-slate-800 w-full max-w-md focus-within:border-emerald-500 transition-colors group shadow-inner">
                <Search size={18} className="text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Пошук..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-600 font-medium"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>
            <div className="flex items-center gap-6">
                <HoldSOSButton onActivate={() => setShowSOS(true)} />
                <div className="relative p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white">
                    <Bell size={22} />
                    <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-[#0b0f1a]"></div>
                </div>
            </div>
        </header>
    );
});

export default MainHeader;
