import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Play, Clock, Award, CheckCircle2, Lock,
  ChevronRight, Star, Users, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';

const levelColors = {
  basic: 'bg-secondary/10 text-secondary',
  intermediate: 'bg-primary/10 text-primary',
  advanced: 'bg-accent/10 text-accent',
};

const Academy = () => {
  const { api, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, progressRes] = await Promise.all([
        api.get('/academy/courses'),
        api.get('/academy/progress')
      ]);
      setCourses(coursesRes.data.courses || []);
      
      // Convert progress array to object
      const progressMap = {};
      (progressRes.data.progress || []).forEach(p => {
        progressMap[p.course_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCourse = async (courseId) => {
    try {
      await api.post(`/academy/progress/${courseId}`, { completed_lessons: 1 });
      toast.success('¡Curso iniciado!');
      fetchData();
    } catch (error) {
      toast.error('Error al iniciar el curso');
    }
  };

  const completeLesson = async (courseId) => {
    const course = courses.find(c => c.course_id === courseId);
    const currentProgress = progress[courseId]?.completed_lessons || 0;
    const newProgress = Math.min(currentProgress + 1, course.lessons);
    const isCompleted = newProgress >= course.lessons;

    try {
      await api.post(`/academy/progress/${courseId}`, {
        completed_lessons: newProgress,
        is_completed: isCompleted
      });
      
      if (isCompleted) {
        toast.success('🎉 ¡Felicidades! Has completado el curso');
      } else {
        toast.success('Lección completada');
      }
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar progreso');
    }
  };

  const completedCourses = courses.filter(c => progress[c.course_id]?.is_completed).length;
  const inProgressCourses = courses.filter(c => 
    progress[c.course_id] && 
    progress[c.course_id].completed_lessons > 0 && 
    !progress[c.course_id].is_completed
  ).length;

  if (selectedCourse) {
    const courseProgress = progress[selectedCourse.course_id];
    const completedLessons = courseProgress?.completed_lessons || 0;
    const progressPercent = (completedLessons / selectedCourse.lessons) * 100;

    return (
      <DashboardLayout>
        <Toaster position="top-center" theme="dark" />
        <div className="p-4 md:p-6 lg:p-8">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Volver a Academia
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                <div className="aspect-video relative">
                  <img 
                    src={selectedCourse.image_url} 
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[selectedCourse.level]}`}>
                      {selectedCourse.level === 'basic' ? 'Básico' : 
                       selectedCourse.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h1 className="font-heading text-xl font-bold text-white mb-2">
                    {selectedCourse.title}
                  </h1>
                  <p className="text-muted-foreground text-sm mb-6">{selectedCourse.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="text-white">{completedLessons}/{selectedCourse.lessons} lecciones</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedCourse.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {selectedCourse.lessons} lecciones
                    </span>
                  </div>

                  {courseProgress?.is_completed ? (
                    <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-secondary" />
                      <span className="text-secondary font-medium">Curso completado</span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full btn-primary-glow"
                      onClick={() => completeLesson(selectedCourse.course_id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {completedLessons === 0 ? 'Comenzar curso' : 'Continuar'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Lessons */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-xl font-semibold text-white mb-4">
                Contenido del curso
              </h2>
              <div className="space-y-3">
                {Array.from({ length: selectedCourse.lessons }).map((_, index) => {
                  const lessonNum = index + 1;
                  const isCompleted = lessonNum <= completedLessons;
                  const isCurrent = lessonNum === completedLessons + 1;
                  const isLocked = lessonNum > completedLessons + 1;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-card p-4 flex items-center justify-between ${
                        isCurrent ? 'border-primary/30' : ''
                      } ${isLocked ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-secondary/20' : 
                          isCurrent ? 'bg-primary/20' : 'bg-white/5'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <span className="text-sm font-medium text-white">{lessonNum}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">Lección {lessonNum}</p>
                          <p className="text-sm text-muted-foreground">
                            ~{Math.ceil(selectedCourse.duration_minutes / selectedCourse.lessons)} min
                          </p>
                        </div>
                      </div>
                      {isCurrent && !isLocked && (
                        <Button 
                          size="sm" 
                          className="btn-primary-glow"
                          onClick={() => completeLesson(selectedCourse.course_id)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-center" theme="dark" />
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Academia Cima VE
          </h1>
          <p className="text-muted-foreground">
            Aprende a invertir con cursos diseñados para el contexto venezolano
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Cursos Disponibles</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">{courses.length}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">En Progreso</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">{inProgressCourses}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Completados</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">{completedCourses}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-muted-foreground">Certificaciones</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">{completedCourses}</p>
          </motion.div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => {
              const courseProgress = progress[course.course_id];
              const completedLessons = courseProgress?.completed_lessons || 0;
              const progressPercent = (completedLessons / course.lessons) * 100;
              const isCompleted = courseProgress?.is_completed;

              return (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setSelectedCourse(course)}
                  data-testid={`course-${course.course_id}`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[course.level]}`}>
                        {course.level === 'basic' ? 'Básico' : 
                         course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </span>
                      {course.is_free ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                          Gratis
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                          Premium
                        </span>
                      )}
                    </div>
                    {isCompleted && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.lessons} lecciones
                      </span>
                    </div>

                    {completedLessons > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="text-white">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Academy;
