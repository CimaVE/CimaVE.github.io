import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Plus, Trash2, Calendar, DollarSign, 
  Plane, Home, GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import BottomNav from '../components/layout/BottomNav';
import { showGoalProgress, showGoalCompleted } from '../utils/notifications';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const categoryIcons = {
  emergency: DollarSign,
  travel: Plane,
  property: Home,
  education: GraduationCap,
  custom: Target,
};

const Goals = () => {
  const { api } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    deadline: '',
    category: 'custom',
    is_shared: false
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount || !newGoal.deadline) {
      toast.error('Completa todos los campos');
      return;
    }

    try {
      await api.post('/goals', {
        ...newGoal,
        target_amount: parseFloat(newGoal.target_amount)
      });
      toast.success('Objetivo creado');
      setDialogOpen(false);
      setNewGoal({ title: '', target_amount: '', deadline: '', category: 'custom', is_shared: false });
      fetchGoals();
    } catch (error) {
      toast.error('Error al crear el objetivo');
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await api.delete(`/goals/${goalId}`);
      toast.success('Objetivo eliminado');
      fetchGoals();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const addFunds = async (goalId, amount) => {
    const goal = goals.find(g => g.goal_id === goalId);
    if (!goal) return;

    const newAmount = (goal.current_amount || 0) + amount;
    const isCompleted = newAmount >= goal.target_amount;

    try {
      await api.put(`/goals/${goalId}`, { current_amount: newAmount });
      toast.success(`$${amount} agregados`);
      
      // Show notification
      if (isCompleted) {
        showGoalCompleted(goal.title);
      } else if (newAmount / goal.target_amount >= 0.5) {
        showGoalProgress(goal.title, newAmount, goal.target_amount);
      }
      
      fetchGoals();
    } catch (error) {
      toast.error('Error al agregar fondos');
    }
  };

  const totalSaved = goals.reduce((acc, g) => acc + (g.current_amount || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <Toaster position="top-center" theme="dark" />
      <div className="px-5 pt-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Objetivos</h1>
            <p className="text-sm text-white/40 mt-1">Define metas y sigue tu progreso</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary text-sm" data-testid="create-goal-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo objetivo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111111] border-[#1a1a1a]">
              <DialogHeader>
                <DialogTitle className="text-lg text-white">Crear objetivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Nombre</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ej: Viaje a Europa"
                    className="bg-[#0A0A0A] border-[#1a1a1a] text-white placeholder:text-white/30"
                    data-testid="goal-title-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Monto (USD)</label>
                  <Input
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    placeholder="5000"
                    className="bg-[#0A0A0A] border-[#1a1a1a] text-white placeholder:text-white/30"
                    data-testid="goal-amount-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Fecha límite</label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="bg-[#0A0A0A] border-[#1a1a1a] text-white"
                    data-testid="goal-deadline-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Categoría</label>
                  <Select 
                    value={newGoal.category} 
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                  >
                    <SelectTrigger className="bg-[#0A0A0A] border-[#1a1a1a] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#1a1a1a]">
                      <SelectItem value="emergency" className="text-white/70 focus:bg-white/5 focus:text-white">Emergencia</SelectItem>
                      <SelectItem value="travel" className="text-white/70 focus:bg-white/5 focus:text-white">Viaje</SelectItem>
                      <SelectItem value="property" className="text-white/70 focus:bg-white/5 focus:text-white">Propiedad</SelectItem>
                      <SelectItem value="education" className="text-white/70 focus:bg-white/5 focus:text-white">Educación</SelectItem>
                      <SelectItem value="custom" className="text-white/70 focus:bg-white/5 focus:text-white">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createGoal} className="w-full btn-primary" data-testid="submit-goal-btn">
                  Crear objetivo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Objetivos</p>
            <p className="text-xl font-semibold text-white">{goals.length}</p>
          </div>
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Ahorrado</p>
            <p className="text-xl font-semibold text-[#22C55E]">${totalSaved.toLocaleString()}</p>
          </div>
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Meta total</p>
            <p className="text-xl font-semibold text-white">${totalTarget.toLocaleString()}</p>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-minimal h-24 animate-pulse" />
            ))}
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const Icon = categoryIcons[goal.category] || Target;
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <motion.div
                  key={goal.goal_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="card-minimal p-5"
                  data-testid={`goal-${goal.goal_id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded bg-[#8B1538]/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#8B1538]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-white">{goal.title}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGoal(goal.goal_id)}
                            className="w-7 h-7 -mr-2 text-white/30 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <p className="text-xs text-white/40 flex items-center gap-1 mb-3">
                          <Calendar className="w-3 h-3" />
                          {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
                        </p>
                        <Progress value={progress} className="h-1.5 bg-[#1a1a1a] mb-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/50">
                            ${(goal.current_amount || 0).toLocaleString()} / ${goal.target_amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-white">{progress.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 ml-14">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFunds(goal.goal_id, 50)}
                      className="text-xs h-7 bg-transparent border-[#1a1a1a] hover:bg-white/5 text-white/70"
                    >
                      +$50
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addFunds(goal.goal_id, 100)}
                      className="text-xs h-7 bg-transparent border-[#1a1a1a] hover:bg-white/5 text-white/70"
                    >
                      +$100
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-minimal p-12 text-center"
          >
            <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white mb-1">Sin objetivos</h3>
            <p className="text-sm text-white/40 mb-4">
              Crea tu primer objetivo y comienza a ahorrar con propósito.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Crear objetivo
            </Button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Goals;
