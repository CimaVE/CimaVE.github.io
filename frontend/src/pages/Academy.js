import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, CheckCircle2, Lock, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';

const Academy = () => {
  const { api } = useAuth();
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
      const progressMap = {};
      (progressRes.data.progress || []).forEach(p => progressMap[p.course_id] = p);
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      toast.success(isCompleted ? '¡Curso completado!' : 'Lección completada');
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const completedCourses = courses.filter(c => progress[c.course_id]?.is_completed).length;

  if (selectedCourse) {
    const courseProgress = progress[selectedCourse.course_id];
    const completedLessons = courseProgress?.completed_lessons || 0;
    const progressPercent = (completedLessons / selectedCourse.lessons) * 100;

    return (
      <DashboardLayout>
        <Toaster position="top-center" theme="dark" />
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
          <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-1 text-sm text-white/40 hover:text-white mb-6">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-minimal overflow-hidden">
                <div className="aspect-video bg-[#1a1a1a]">
                  <img src={selectedCourse.image_url} alt={selectedCourse.title} className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="p-5">
                  <span className={`text-xs px-2 py-0.5 rounded ${selectedCourse.level === 'basic' ? 'bg-[#22C55E]/10 text-[#22C55E]' : selectedCourse.level === 'intermediate' ? 'bg-[#8B1538]/10 text-[#8B1538]' : 'bg-white/10 text-white/70'}`}>
                    {selectedCourse.level === 'basic' ? 'Básico' : selectedCourse.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                  </span>
                  <h1 className="text-lg font-semibold text-white mt-3 mb-2">{selectedCourse.title}</h1>
                  <p className="text-sm text-white/50 mb-5">{selectedCourse.description}</p>
                  
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Progreso</span>
                      <span className="text-white">{completedLessons}/{selectedCourse.lessons}</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5 bg-[#1a1a1a]" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/40 mb-5">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedCourse.duration_minutes} min</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{selectedCourse.lessons} lecciones</span>
                  </div>

                  {courseProgress?.is_completed ? (
                    <div className="p-3 rounded bg-[#22C55E]/10 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-sm text-[#22C55E]">Completado</span>
                    </div>
                  ) : (
                    <Button className="w-full btn-primary text-sm" onClick={() => completeLesson(selectedCourse.course_id)}>
                      <Play className="w-4 h-4 mr-2" />
                      {completedLessons === 0 ? 'Comenzar' : 'Continuar'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-sm font-medium text-white mb-4">Contenido</h2>
              <div className="space-y-2">
                {Array.from({ length: selectedCourse.lessons }).map((_, index) => {
                  const lessonNum = index + 1;
                  const isCompleted = lessonNum <= completedLessons;
                  const isCurrent = lessonNum === completedLessons + 1;
                  const isLocked = lessonNum > completedLessons + 1;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`card-minimal p-4 flex items-center justify-between ${isCurrent ? 'border-[#8B1538]/30' : ''} ${isLocked ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${isCompleted ? 'bg-[#22C55E]/10' : isCurrent ? 'bg-[#8B1538]/10' : 'bg-[#1a1a1a]'}`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> : isLocked ? <Lock className="w-4 h-4 text-white/30" /> : <span className="text-xs text-white">{lessonNum}</span>}
                        </div>
                        <div>
                          <p className="text-sm text-white">Lección {lessonNum}</p>
                          <p className="text-xs text-white/40">~{Math.ceil(selectedCourse.duration_minutes / selectedCourse.lessons)} min</p>
                        </div>
                      </div>
                      {isCurrent && <Button size="sm" className="h-7 btn-primary text-xs" onClick={() => completeLesson(selectedCourse.course_id)}><Play className="w-3 h-3" /></Button>}
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
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-white">Academia</h1>
          <p className="text-sm text-white/40 mt-1">Aprende a invertir con cursos diseñados para ti</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Cursos</p>
            <p className="text-xl font-semibold text-white">{courses.length}</p>
          </div>
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Completados</p>
            <p className="text-xl font-semibold text-[#22C55E]">{completedCourses}</p>
          </div>
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">En progreso</p>
            <p className="text-xl font-semibold text-white">{courses.filter(c => progress[c.course_id] && !progress[c.course_id].is_completed).length}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="card-minimal h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => {
              const courseProgress = progress[course.course_id];
              const completedLessons = courseProgress?.completed_lessons || 0;
              const progressPercent = (completedLessons / course.lessons) * 100;

              return (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card-minimal overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedCourse(course)}
                  data-testid={`course-${course.course_id}`}
                >
                  <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
                    <img src={course.image_url} alt={course.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${course.level === 'basic' ? 'bg-[#22C55E]/90 text-white' : course.level === 'intermediate' ? 'bg-[#8B1538] text-white' : 'bg-white/90 text-black'}`}>
                        {course.level === 'basic' ? 'Básico' : course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                      </span>
                    </div>
                    {courseProgress?.is_completed && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-medium text-white mb-1 group-hover:text-[#8B1538] transition-colors">{course.title}</h3>
                    <p className="text-xs text-white/40 mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessons} lecciones</span>
                    </div>
                    {completedLessons > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/40">Progreso</span>
                          <span className="text-white">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1 bg-[#1a1a1a]" />
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
