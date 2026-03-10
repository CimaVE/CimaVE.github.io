import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Plus, Trash2, Calendar, DollarSign, Users, 
  TrendingUp, Plane, Home, GraduationCap, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
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

const categoryColors = {
  emergency: 'text-destructive bg-destructive/10',
  travel: 'text-accent bg-accent/10',
  property: 'text-primary bg-primary/10',
  education: 'text-secondary bg-secondary/10',
  custom: 'text-purple-500 bg-purple-500/10',
};

const Goals = () => {
  const { api, user } = useAuth();
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
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await api.post('/goals', {
        ...newGoal,
        target_amount: parseFloat(newGoal.target_amount)
      });
      toast.success('Objetivo creado exitosamente');
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
      toast.error('Error al eliminar el objetivo');
    }
  };

  const addFunds = async (goalId, amount) => {
    const goal = goals.find(g => g.goal_id === goalId);
    if (!goal) return;

    try {
      await api.put(`/goals/${goalId}`, {
        current_amount: (goal.current_amount || 0) + amount
      });
      toast.success(`$${amount} agregados al objetivo`);
      fetchGoals();
    } catch (error) {
      toast.error('Error al agregar fondos');
    }
  };

  const totalGoalValue = goals.reduce((acc, g) => acc + (g.current_amount || 0), 0);
  const totalTargetValue = goals.reduce((acc, g) => acc + g.target_amount, 0);

  return (
    <DashboardLayout>
      <Toaster position="top-center" theme="dark" />
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white mb-2">
              Modo Objetivo
            </h1>
            <p className="text-muted-foreground">
              Define metas financieras y sigue tu progreso hacia ellas
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow" data-testid="create-goal-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Objetivo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0B0E14] border-white/10">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl text-white">Crear Objetivo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Nombre del objetivo</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ej: Viaje a Europa"
                    className="bg-white/5 border-white/10"
                    data-testid="goal-title-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Monto objetivo (USD)</label>
                  <Input
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                    placeholder="5000"
                    className="bg-white/5 border-white/10"
                    data-testid="goal-amount-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Fecha límite</label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    className="bg-white/5 border-white/10"
                    data-testid="goal-deadline-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Categoría</label>
                  <Select 
                    value={newGoal.category} 
                    onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0E14] border-white/10">
                      <SelectItem value="emergency">Fondo de Emergencia</SelectItem>
                      <SelectItem value="travel">Viaje</SelectItem>
                      <SelectItem value="property">Propiedad</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createGoal} className="w-full btn-primary-glow" data-testid="submit-goal-btn">
                  Crear Objetivo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Objetivos Activos</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">{goals.length}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Ahorrado</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">${totalGoalValue.toLocaleString()}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Meta Total</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">${totalTargetValue.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-32 animate-pulse" />
            ))}
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const Icon = categoryIcons[goal.category] || Target;
              const colorClass = categoryColors[goal.category] || categoryColors.custom;
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <motion.div
                  key={goal.goal_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                  data-testid={`goal-${goal.goal_id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-white">{goal.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencido'}
                            </span>
                            {goal.is_shared && (
                              <span className="text-sm text-purple-400 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                Compartido
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.goal_id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            ${(goal.current_amount || 0).toLocaleString()} de ${goal.target_amount.toLocaleString()}
                          </span>
                          <span className="font-medium text-white">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFunds(goal.goal_id, 50)}
                        className="border-white/10"
                      >
                        +$50
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFunds(goal.goal_id, 100)}
                        className="border-white/10"
                      >
                        +$100
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-white mb-2">
              No tienes objetivos activos
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crea tu primer objetivo financiero y comienza a ahorrar con propósito. 
              Define metas para viajes, emergencias, educación o lo que necesites.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="btn-primary-glow">
              <Plus className="w-4 h-4 mr-2" />
              Crear mi primer objetivo
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Goals;
