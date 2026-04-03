import { useState, useCallback, useEffect, useMemo } from 'react';
import { Aura, GameState, Gauntlet, Potion } from './types';
import { AURAS, GAUNTLETS, POTIONS } from './constants';
import RollDisplay from './components/RollDisplay';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  History, 
  Trophy, 
  Zap, 
  Info, 
  Package, 
  FlaskConical, 
  Shield, 
  BookOpen, 
  Play, 
  Star,
  Search
} from 'lucide-react';

type Tab = 'inventory' | 'potions' | 'gauntlets' | 'brewer' | 'index' | 'auto' | 'blessing';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('rolling_rampage_state');
    if (saved) return JSON.parse(saved);
    return {
      totalRolls: 0,
      totalStats: 0,
      baseLuck: 1,
      effectiveLuck: 1,
      inventory: {},
      bestAura: null,
      unlockedGauntlets: [],
      activePotions: [],
      discoveredAuras: [],
      blessingActive: false,
      blessingCooldown: 0,
    };
  });

  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [currentAura, setCurrentAura] = useState<Aura | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<Aura[]>([]);
  const [autoRollEnabled, setAutoRollEnabled] = useState(false);
  const [autoRollSpeed, setAutoRollSpeed] = useState(2000); // ms
  const [searchTerm, setSearchTerm] = useState('');

  // Persist state
  useEffect(() => {
    localStorage.setItem('rolling_rampage_state', JSON.stringify(gameState));
  }, [gameState]);

  // Calculate effective luck
  const effectiveLuck = useMemo(() => {
    let luck = gameState.baseLuck;
    
    // Gauntlet bonuses
    gameState.unlockedGauntlets.forEach(gid => {
      const g = GAUNTLETS.find(gaunt => gaunt.id === gid);
      if (g?.reward.luck) luck += g.reward.luck;
    });

    // Potion bonuses
    gameState.activePotions.forEach(p => {
      const pot = POTIONS.find(potion => potion.id === p.id);
      if (pot) luck *= pot.effect.luck;
    });

    // Blessing bonus
    if (gameState.blessingActive) luck *= 2;

    return luck;
  }, [gameState]);

  const roll = useCallback(() => {
    if (isRolling) return;
    
    setIsRolling(true);
    
    setTimeout(() => {
      const luck = effectiveLuck;
      const sortedAuras = [...AURAS].sort((a, b) => b.chance - a.chance);
      let rolledAura = sortedAuras[0];
      
      for (let i = sortedAuras.length - 1; i >= 0; i--) {
        const aura = sortedAuras[i];
        const rollValue = Math.random() * aura.chance;
        if (rollValue <= luck) {
          rolledAura = aura;
          break;
        }
      }

      setCurrentAura(rolledAura);
      setIsRolling(false);
      
      setGameState(prev => {
        const newInventory = { ...prev.inventory };
        newInventory[rolledAura.id] = (newInventory[rolledAura.id] || 0) + 1;
        
        const isNewBest = !prev.bestAura || rolledAura.chance > prev.bestAura.chance;
        const newDiscovered = prev.discoveredAuras.includes(rolledAura.id) 
          ? prev.discoveredAuras 
          : [...prev.discoveredAuras, rolledAura.id];

        // Update active potions
        const newPotions = prev.activePotions.map(p => ({
          ...p,
          remainingRolls: p.remainingRolls - 1
        })).filter(p => p.remainingRolls > 0);
        
        return {
          ...prev,
          totalRolls: prev.totalRolls + 1,
          totalStats: prev.totalStats + rolledAura.chance,
          inventory: newInventory,
          bestAura: isNewBest ? rolledAura : prev.bestAura,
          discoveredAuras: newDiscovered,
          activePotions: newPotions
        };
      });

      setHistory(prev => [rolledAura, ...prev].slice(0, 5));
    }, 400);
  }, [isRolling, effectiveLuck]);

  // Auto roll effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRollEnabled && !isRolling) {
      interval = setInterval(roll, autoRollSpeed);
    }
    return () => clearInterval(interval);
  }, [autoRollEnabled, isRolling, roll, autoRollSpeed]);

  const attemptBlessing = () => {
    if (Date.now() < gameState.blessingCooldown) return;
    
    const success = Math.random() > 0.5;
    setGameState(prev => ({
      ...prev,
      blessingActive: success,
      blessingCooldown: Date.now() + (success ? 300000 : 600000) // 5m success, 10m fail
    }));
  };

  const brewPotion = (potion: Potion) => {
    // Check requirements
    const canBrew = Object.entries(potion.requirements).every(([id, count]) => (gameState.inventory[id] || 0) >= count);
    if (!canBrew) return;

    setGameState(prev => {
      const newInv = { ...prev.inventory };
      Object.entries(potion.requirements).forEach(([id, count]) => {
        newInv[id] -= count;
      });
      return {
        ...prev,
        inventory: newInv,
        activePotions: [...prev.activePotions, { id: potion.id, remainingRolls: potion.effect.duration }]
      };
    });
  };

  const craftGauntlet = (gauntlet: Gauntlet) => {
    if (gameState.unlockedGauntlets.includes(gauntlet.id)) return;
    const canCraft = Object.entries(gauntlet.requirements).every(([id, count]) => (gameState.inventory[id] || 0) >= count);
    if (!canCraft) return;

    setGameState(prev => {
      const newInv = { ...prev.inventory };
      Object.entries(gauntlet.requirements).forEach(([id, count]) => {
        newInv[id] -= count;
      });
      return {
        ...prev,
        inventory: newInv,
        unlockedGauntlets: [...prev.unlockedGauntlets, gauntlet.id]
      };
    });
  };

  const StatsCard = ({ label, value, subValue }: { label: string, value: string | number, subValue?: string }) => (
    <div className="bg-gray-900/60 border border-white/5 p-4 rounded-2xl">
      <p className="text-[10px] uppercase text-white/40 tracking-[0.2em] mb-1">{label}</p>
      <p className="text-xl font-black tracking-tight">{value}</p>
      {subValue && <p className="text-[10px] text-indigo-400 mt-1">{subValue}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-[#f9fafb] font-sans selection:bg-indigo-500/30 pb-20">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Top Section: Preview & Roll */}
        <section className="flex flex-col items-center gap-6">
          <RollDisplay aura={currentAura} isRolling={isRolling} totalRolls={gameState.totalRolls} />
          
          <div className="flex gap-4">
            <button
              onClick={roll}
              disabled={isRolling}
              className={`
                relative group px-12 py-4 rounded-2xl font-black text-lg tracking-widest uppercase transition-all duration-300
                ${isRolling 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20'}
              `}
            >
              <span className="flex items-center gap-3">
                ROLL <span className="text-[10px] opacity-50">[Space]</span>
              </span>
            </button>
            <button className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              Quick <span className="opacity-50">[Q]</span>
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Total Stats" value={gameState.totalStats.toLocaleString()} />
          <StatsCard label="Total Rolls" value={gameState.totalRolls.toLocaleString()} />
          <StatsCard label="Base Luck" value={`${gameState.baseLuck}x`} />
          <StatsCard label="Effective Luck" value={`${effectiveLuck.toFixed(1)}x`} subValue={gameState.blessingActive ? '+100% Blessing Active' : undefined} />
        </section>

        {/* Tabs Navigation */}
        <nav className="flex flex-wrap gap-2 p-1.5 bg-gray-900/80 border border-white/5 rounded-2xl backdrop-blur-md">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package, count: (Object.values(gameState.inventory) as number[]).filter(v => v > 0).length },
            { id: 'potions', label: 'Potions', icon: FlaskConical, count: gameState.activePotions.length },
            { id: 'gauntlets', label: 'Gauntlets', icon: Shield },
            { id: 'brewer', label: 'Brewer', icon: FlaskConical },
            { id: 'index', label: 'Aura Index', icon: BookOpen, count: gameState.discoveredAuras.length },
            { id: 'auto', label: 'Auto Roll', icon: Play },
            { id: 'blessing', label: 'Blessing', icon: Star },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'}
              `}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-black/20 px-1.5 py-0.5 rounded-md text-[8px]">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section className="bg-gray-900/40 border border-white/5 rounded-3xl p-8 min-h-[400px] backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Inventory</h3>
                    <p className="text-[10px] opacity-30">{(Object.values(gameState.inventory) as number[]).reduce((a, b) => a + b, 0)} total, {(Object.values(gameState.inventory) as number[]).filter(v => v > 0).length} unique</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {AURAS.filter(a => gameState.inventory[a.id] > 0).map(aura => (
                      <div key={aura.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center group hover:border-white/20 transition-all">
                        <div className={`w-8 h-8 rounded-full mb-3 shadow-lg ${aura.color.replace('text', 'bg')}`} />
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${aura.color}`}>{aura.name}</p>
                        <p className="text-[9px] opacity-40 mb-2">1 in {aura.chance.toLocaleString()}</p>
                        <div className="mt-auto flex items-center justify-between w-full pt-2 border-t border-white/5">
                          <span className="text-[10px] font-mono">x{gameState.inventory[aura.id]}</span>
                          <button className="text-[8px] uppercase font-bold text-indigo-400 hover:text-indigo-300">Equip</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'gauntlets' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6">Gauntlets</h3>
                  {GAUNTLETS.map(g => {
                    const isUnlocked = gameState.unlockedGauntlets.includes(g.id);
                    const canCraft = Object.entries(g.requirements).every(([id, count]) => (gameState.inventory[id] || 0) >= count);
                    return (
                      <div key={g.id} className={`p-6 rounded-2xl border ${isUnlocked ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/5'} flex justify-between items-center`}>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-black text-lg tracking-tight">{g.name}</h4>
                            {isUnlocked && <span className="text-[8px] bg-indigo-500 px-1.5 py-0.5 rounded uppercase tracking-widest">Equipped</span>}
                          </div>
                          <div className="flex gap-2 mb-3">
                            {Object.entries(g.requirements).map(([id, count]) => (
                              <span key={id} className={`text-[9px] px-2 py-0.5 rounded-full bg-black/40 border border-white/5 ${(gameState.inventory[id] || 0) >= count ? 'text-green-400' : 'text-red-400'}`}>
                                {gameState.inventory[id] || 0}/{count} {AURAS.find(a => a.id === id)?.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Reward: {g.description}</p>
                        </div>
                        <button 
                          disabled={isUnlocked || !canCraft}
                          onClick={() => craftGauntlet(g)}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isUnlocked ? 'bg-indigo-500/20 text-indigo-400 cursor-default' : canCraft ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        >
                          {isUnlocked ? 'Unlocked' : 'Craft Gauntlet'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'brewer' && (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Brewer</h3>
                    <p className="text-xs text-white/30 mt-1">Consume auras from your inventory to brew powerful potions.</p>
                  </div>
                  {POTIONS.map(p => {
                    const canBrew = Object.entries(p.requirements).every(([id, count]) => (gameState.inventory[id] || 0) >= count);
                    return (
                      <div key={p.id} className="p-6 rounded-2xl border border-white/5 bg-white/5 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-lg tracking-tight mb-2">{p.name}</h4>
                          <div className="flex gap-2 mb-3">
                            {Object.entries(p.requirements).map(([id, count]) => (
                              <span key={id} className={`text-[9px] px-2 py-0.5 rounded-full bg-black/40 border border-white/5 ${(gameState.inventory[id] || 0) >= count ? 'text-green-400' : 'text-red-400'}`}>
                                {gameState.inventory[id] || 0}/{count} {AURAS.find(a => a.id === id)?.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">{p.description}</p>
                        </div>
                        <button 
                          disabled={!canBrew}
                          onClick={() => brewPotion(p)}
                          className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${canBrew ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        >
                          Brew
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'index' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Aura Index</h3>
                      <p className="text-[10px] text-white/30 mt-1">{gameState.discoveredAuras.length} / {AURAS.length} discovered</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                      <input 
                        type="text" 
                        placeholder="Search auras..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] focus:outline-none focus:border-indigo-500/50 w-48"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {AURAS.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase())).map(aura => {
                      const isDiscovered = gameState.discoveredAuras.includes(aura.id);
                      return (
                        <div key={aura.id} className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${isDiscovered ? 'border-white/10 bg-white/5' : 'border-white/5 opacity-40 grayscale'}`}>
                          <div className={`w-8 h-8 rounded-full mb-3 ${isDiscovered ? aura.color.replace('text', 'bg') : 'bg-gray-800'}`} />
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDiscovered ? aura.color : 'text-white/20'}`}>
                            {isDiscovered ? aura.name : '???'}
                          </p>
                          <p className="text-[9px] opacity-40">1 in {isDiscovered ? aura.chance.toLocaleString() : '???'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'auto' && (
                <div className="space-y-8 max-w-xl mx-auto py-8">
                  <div className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <div>
                      <h3 className="font-black text-lg tracking-tight">Auto Roll</h3>
                      <p className="text-xs text-white/40">Automatically manifests auras at set intervals.</p>
                    </div>
                    <button 
                      onClick={() => setAutoRollEnabled(!autoRollEnabled)}
                      className={`w-14 h-7 rounded-full relative transition-all ${autoRollEnabled ? 'bg-indigo-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${autoRollEnabled ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-2">Select Speed</p>
                    {[
                      { id: 5000, label: 'Slow (5s)', req: 0 },
                      { id: 2000, label: 'Normal (2s)', req: 100 },
                      { id: 500, label: 'Fast (0.5s)', req: 1000 },
                      { id: 200, label: 'Very Fast (0.2s)', req: 25000 },
                      { id: 75, label: 'Ultra (0.075s)', req: 600000 },
                    ].map(speed => {
                      const isLocked = gameState.totalRolls < speed.req;
                      return (
                        <button
                          key={speed.id}
                          disabled={isLocked}
                          onClick={() => setAutoRollSpeed(speed.id)}
                          className={`
                            w-full flex justify-between items-center p-4 rounded-xl border transition-all
                            ${autoRollSpeed === speed.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}
                            ${isLocked ? 'opacity-30 cursor-not-allowed' : ''}
                          `}
                        >
                          <span className="text-xs font-bold uppercase tracking-widest">{speed.label}</span>
                          {isLocked && <span className="text-[8px] opacity-50">Req: {speed.req.toLocaleString()} rolls</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'blessing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-8 max-w-lg mx-auto text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <Star className="w-10 h-10 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter mb-2 uppercase">Blessing Altar</h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                      Invoke the altar for a chance at divine fortune. On success, gain <span className="text-indigo-400 font-bold">+100% luck</span> for 5 minutes. On failure, try again in 10 minutes.
                    </p>
                  </div>

                  <div className="w-full space-y-4">
                    <button 
                      disabled={Date.now() < gameState.blessingCooldown}
                      onClick={attemptBlessing}
                      className={`
                        w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all
                        ${Date.now() < gameState.blessingCooldown 
                          ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] shadow-xl shadow-indigo-500/20'}
                      `}
                    >
                      {Date.now() < gameState.blessingCooldown 
                        ? `Cooldown: ${Math.ceil((gameState.blessingCooldown - Date.now()) / 60000)}m` 
                        : 'Attempt Blessing'}
                    </button>
                    <div className="grid grid-cols-2 gap-4 text-[8px] uppercase font-bold tracking-widest opacity-30">
                      <p>50% Success Rate</p>
                      <p>5 Min Blessing</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Recent History Bar */}
        <section className="bg-gray-900/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 opacity-40">
              <History className="w-3 h-3" />
              <span className="text-[10px] uppercase font-black tracking-widest">History</span>
            </div>
            <div className="flex gap-2">
              {history.map((aura, i) => (
                <div key={i} className={`w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-[10px] font-black ${aura.color} bg-white/5`} title={aura.name}>
                  {aura.name[0]}
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] opacity-30 uppercase font-bold tracking-widest">
            v0.2.0 Manifestation Engine
          </div>
        </section>
      </main>
    </div>
  );
}
