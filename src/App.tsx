
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Users, 
  Calendar as CalendarIcon, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  AlertCircle,
  Hash,
  ArrowRight
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  isAfter,
  isBefore,
  startOfToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { api } from './services/api';
import { Group, CalendarEvent, EventType } from './types';

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // New Event State
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'class' as EventType,
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: '',
    location: ''
  });

  const activeGroup = useMemo(() => 
    groups.find(g => g.id === activeGroupId), 
    [groups, activeGroupId]
  );

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
      if (data.length > 0 && !activeGroupId) {
        setActiveGroupId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load groups');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const g = await api.createGroup(newGroupName);
      setGroups([...groups, g]);
      setActiveGroupId(g.id);
      setIsAddingGroup(false);
      setNewGroupName('');
    } catch (err) {
      alert('Erro ao criar grupo');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const g = await api.joinGroup(joinCode);
      await loadGroups();
      setActiveGroupId(g.id);
      setIsJoiningGroup(false);
      setJoinCode('');
    } catch (err) {
      alert('Código inválido ou grupo não encontrado');
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroupId || !newEvent.title) return;
    try {
      const event = await api.addEvent(activeGroupId, newEvent);
      setGroups(groups.map(g => 
        g.id === activeGroupId 
          ? { ...g, events: [...g.events, event] } 
          : g
      ));
      setIsAddingEvent(false);
      setNewEvent({
        title: '',
        type: 'class',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        description: '',
        location: ''
      });
    } catch (err) {
      alert('Erro ao adicionar evento');
    }
  };

  const renderHeader = () => (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">A</div>
        <span className="font-extrabold text-lg tracking-tight text-slate-900">AcademiaSync</span>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsJoiningGroup(true)}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Entrar via Código
        </button>
        <button 
          onClick={() => setIsAddingGroup(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
        >
          Novo Grupo
        </button>
      </div>
    </header>
  );

  const renderSidebar = () => (
    <nav className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <span className="font-bold text-lg tracking-tight">AcademiaSync</span>
      </div>
      
      <div className="px-4 py-2 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Meus Grupos</p>
        <div className="space-y-1">
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group",
                activeGroupId === group.id 
                  ? "bg-indigo-50 text-indigo-700 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 font-medium"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                activeGroupId === group.id ? "bg-indigo-500" : "bg-slate-200 group-hover:bg-slate-300"
              )} />
              <span className="text-sm truncate">{group.name}</span>
            </button>
          ))}
          {groups.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Sem grupos</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-100">
        <button 
          onClick={() => setIsAddingGroup(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors text-slate-700"
        >
          <Plus className="w-4 h-4" />
          Novo Grupo
        </button>
      </div>
    </nav>
  );

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              Hoje
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const hasEvents = activeGroup?.events.filter(e => isSameDay(parseISO(e.date), day)) || [];
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "min-h-[120px] p-2 border-r border-b border-slate-100 relative group transition-colors hover:bg-slate-50/30",
                  !isSameMonth(day, monthStart) && "bg-slate-50/50 opacity-40",
                  idx % 7 === 6 && "border-r-0"
                )}
              >
                <div className="flex justify-start items-start mb-1">
                  <span className={cn(
                    "text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
                    isSameDay(day, new Date()) 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-600"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                  {hasEvents.map(event => (
                    <div 
                      key={event.id}
                      className={cn(
                        "text-[10px] p-1.5 rounded-lg border flex flex-col gap-0.5 transition-all truncate",
                        event.type === 'class' && "bg-blue-50 border-blue-100 text-blue-700",
                        event.type === 'exam' && "bg-amber-50 border-amber-100 text-amber-700",
                        event.type === 'assignment' && "bg-rose-50 border-rose-100 text-rose-700",
                        event.type === 'other' && "bg-emerald-50 border-emerald-100 text-emerald-700"
                      )}
                    >
                      <span className="font-bold leading-tight">{event.title}</span>
                      <span className="opacity-70 font-medium">{format(parseISO(event.date), 'HH:mm')}</span>
                    </div>
                  ))}
                </div>
                {!isSameMonth(day, monthStart) && <div className="absolute inset-0 pointer-events-none bg-slate-50/20" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    const today = startOfToday();
    const futureEvents = activeGroup?.events
      .filter(e => isAfter(parseISO(e.date), today) || isSameDay(parseISO(e.date), today))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()) || [];

    return (
      <div className="flex flex-col gap-6 w-full lg:w-72">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
            Próximas Entregas
            {futureEvents.length > 0 && (
              <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md text-[9px] font-extrabold letter tracking-normal">
                {futureEvents.length} PENDENTES
              </span>
            )}
          </h3>
          <div className="space-y-5">
            {futureEvents.slice(0, 5).map(event => (
              <motion.div 
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                key={event.id} 
                className="flex gap-4 group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase leading-none mb-0.5">{format(parseISO(event.date), 'MMM', { locale: ptBR })}</span>
                  <span className="text-sm font-bold leading-none text-slate-800">{format(parseISO(event.date), 'dd')}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight text-slate-800 truncate">{event.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">
                    {event.type} • {format(parseISO(event.date), 'HH:mm')}
                  </p>
                </div>
              </motion.div>
            ))}
            {!activeGroupId && (
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-4">Selecione um grupo</p>
            )}
            {activeGroupId && futureEvents.length === 0 && (
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-4">Tudo em dia!</p>
            )}
          </div>
        </div>

        {activeGroup && (
          <div className="bg-indigo-600 rounded-2xl p-6 shadow-md text-white">
            <h3 className="text-xs font-bold mb-2 uppercase tracking-wide opacity-90">Informativo do Grupo</h3>
            <p className="text-xs leading-relaxed text-indigo-50/90 font-medium">
              Lembrem-se de verificar as datas de prova regularmente. O código deste grupo é <code className="font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-[11px]">{activeGroup.code}</code>.
            </p>
            <div className="mt-6 pt-4 border-t border-indigo-400/30 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <Hash className="w-3 h-3 text-indigo-100" />
              </div>
              <span className="text-[10px] font-bold text-indigo-100/80 uppercase tracking-widest">Automatizado</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                <div className="w-12 h-1 bg-indigo-500 rounded-full mb-8" />
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex overflow-hidden h-screen">
      {renderSidebar()}
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {renderHeader()}
        
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto p-8">
            {activeGroup ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 flex flex-col gap-8">
                  <div className="bg-white px-8 py-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeGroup.name}</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        Código de acesso: <span className="font-mono text-indigo-600 font-extrabold">{activeGroup.code}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddingEvent(true)}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Novo Evento
                    </button>
                  </div>
                  
                  <motion.div 
                    key={activeGroup.id}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {renderCalendar()}
                  </motion.div>
                </div>
                
                <div className="lg:col-span-4 lg:sticky lg:top-0">
                  {renderUpcomingEvents()}
                </div>
              </div>
            ) : (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-indigo-50 rounded-3xl flex items-center justify-center rotate-12" />
                  <CalendarIcon className="w-16 h-16 text-indigo-200 absolute inset-0 m-auto -rotate-12" />
                </div>
                <div className="max-w-sm">
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Otimize seus estudos.</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">Organize horários de aulas, provas e prazos de forma colaborativa com seus colegas de turma.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsAddingGroup(true)}
                    className="px-8 py-4 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-100 flex items-center gap-3 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Grupo
                  </button>
                  <button 
                    onClick={() => setIsJoiningGroup(true)}
                    className="px-8 py-4 bg-white text-slate-600 font-extrabold rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Hash className="w-5 h-5" />
                    Entrar em Grupo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal 
        isOpen={isAddingGroup} 
        onClose={() => setIsAddingGroup(false)} 
        title="Criar Novo Grupo"
      >
        <form onSubmit={handleCreateGroup} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Nome do Grupo</label>
            <input 
              autoFocus
              type="text" 
              placeholder="Ex: Ciência da Computação - 5º Semestre" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
            />
          </div>
          <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
            Confirmar Criação
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isJoiningGroup} 
        onClose={() => setIsJoiningGroup(false)} 
        title="Entrar em um Grupo"
      >
        <form onSubmit={handleJoinGroup} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Código de Acesso</label>
            <input 
              autoFocus
              type="text" 
              placeholder="Digite o código enviado pelo colega" 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold tracking-widest placeholder:font-medium placeholder:tracking-normal uppercase"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
            />
          </div>
          <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
            Entrar no Grupo
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isAddingEvent} 
        onClose={() => setIsAddingEvent(false)} 
        title="Novo Compromisso"
      >
        <form onSubmit={handleAddEvent} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Título</label>
            <input 
              autoFocus
              type="text" 
              required
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
              value={newEvent.title}
              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo</label>
              <select 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium capitalize"
                value={newEvent.type}
                onChange={e => setNewEvent({...newEvent, type: e.target.value as EventType})}
              >
                <option value="class">Aula</option>
                <option value="exam">Prova</option>
                <option value="assignment">Trabalho/Atividade</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data e Hora</label>
              <input 
                type="datetime-local" 
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-xs [&::-webkit-calendar-picker-indicator]:invert-[0.5]"
                value={newEvent.date}
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Local (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ex: Sala 302, Laboratório A..."
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm"
              value={newEvent.location}
              onChange={e => setNewEvent({...newEvent, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição (Opcional)</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-sm resize-none"
              value={newEvent.description}
              onChange={e => setNewEvent({...newEvent, description: e.target.value})}
            />
          </div>
          <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Salvar no Calendário
          </button>
        </form>
      </Modal>
    </div>
  );
}
