'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Sparkles, Briefcase, Home, Target, Heart, GraduationCap } from 'lucide-react';

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  color?: string;
  taskData?: {
    title?: string;
    description?: string;
    priority?: string;
    estimatedMinutes?: number;
  };
  checklistItems?: string[];
  isSystem: boolean;
  usageCount: number;
}

interface TemplatesGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: TaskTemplate) => void;
}

// Pre-built system templates
const SYSTEM_TEMPLATES: TaskTemplate[] = [
  // Work
  {
    id: 'sys-meeting-prep',
    name: 'Meeting Preparation',
    description: 'Prepare for an important meeting',
    category: 'work',
    icon: 'solar:users-group-rounded-linear',
    color: '#3B82F6',
    taskData: { priority: 'HIGH', estimatedMinutes: 30 },
    checklistItems: ['Review agenda', 'Prepare talking points', 'Gather relevant documents', 'Test video/audio', 'Join 5 minutes early'],
    isSystem: true,
    usageCount: 0,
  },
  {
    id: 'sys-weekly-review',
    name: 'Weekly Review',
    description: 'Review your week and plan ahead',
    category: 'work',
    icon: 'solar:calendar-linear',
    color: '#8B5CF6',
    taskData: { priority: 'MEDIUM', estimatedMinutes: 60 },
    checklistItems: ['Review completed tasks', 'Update project status', 'Clear inbox', 'Plan next week priorities', 'Schedule important meetings'],
    isSystem: true,
    usageCount: 0,
  },
  {
    id: 'sys-report',
    name: 'Create Report',
    description: 'Structure for creating reports',
    category: 'work',
    icon: 'solar:document-text-linear',
    color: '#10B981',
    taskData: { priority: 'HIGH', estimatedMinutes: 120 },
    checklistItems: ['Gather data', 'Analyze findings', 'Create outline', 'Write draft', 'Add visuals', 'Review and edit', 'Get feedback'],
    isSystem: true,
    usageCount: 0,
  },
  // Personal
  {
    id: 'sys-morning-routine',
    name: 'Morning Routine',
    description: 'Start your day right',
    category: 'personal',
    icon: 'solar:sun-linear',
    color: '#F59E0B',
    taskData: { priority: 'MEDIUM', estimatedMinutes: 45 },
    checklistItems: ['Wake up early', 'Drink water', 'Exercise/stretch', 'Healthy breakfast', 'Review daily goals'],
    isSystem: true,
    usageCount: 0,
  },
  {
    id: 'sys-grocery',
    name: 'Grocery Shopping',
    description: 'Weekly grocery list template',
    category: 'personal',
    icon: 'solar:cart-linear',
    color: '#22C55E',
    taskData: { priority: 'LOW', estimatedMinutes: 60 },
    checklistItems: ['Check pantry', 'Make list', 'Check coupons/deals', 'Go shopping', 'Put away groceries'],
    isSystem: true,
    usageCount: 0,
  },
  // Goals
  {
    id: 'sys-goal-setting',
    name: 'Set a New Goal',
    description: 'SMART goal planning template',
    category: 'goals',
    icon: 'solar:target-linear',
    color: '#EF4444',
    taskData: { priority: 'HIGH', estimatedMinutes: 30 },
    checklistItems: ['Define Specific goal', 'Make it Measurable', 'Ensure it\'s Achievable', 'Check Relevance', 'Set Timeline', 'Create action steps'],
    isSystem: true,
    usageCount: 0,
  },
  {
    id: 'sys-habit-tracker',
    name: 'Build a Habit',
    description: 'Track and build new habits',
    category: 'goals',
    icon: 'solar:refresh-linear',
    color: '#06B6D4',
    taskData: { priority: 'MEDIUM', estimatedMinutes: 15 },
    checklistItems: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    isSystem: true,
    usageCount: 0,
  },
  // Health
  {
    id: 'sys-workout',
    name: 'Workout Session',
    description: 'Plan your exercise routine',
    category: 'health',
    icon: 'solar:dumbbell-linear',
    color: '#EC4899',
    taskData: { priority: 'MEDIUM', estimatedMinutes: 60 },
    checklistItems: ['Warm up (10 min)', 'Main workout (40 min)', 'Cool down (5 min)', 'Stretching (5 min)', 'Log workout'],
    isSystem: true,
    usageCount: 0,
  },
  {
    id: 'sys-meal-prep',
    name: 'Meal Prep',
    description: 'Weekly meal preparation',
    category: 'health',
    icon: 'solar:chef-hat-linear',
    color: '#14B8A6',
    taskData: { priority: 'LOW', estimatedMinutes: 120 },
    checklistItems: ['Plan meals for week', 'Create shopping list', 'Buy ingredients', 'Prep vegetables', 'Cook proteins', 'Package meals'],
    isSystem: true,
    usageCount: 0,
  },
  // Learning
  {
    id: 'sys-learn-skill',
    name: 'Learn New Skill',
    description: 'Structure for learning anything',
    category: 'learning',
    icon: 'solar:book-linear',
    color: '#6366F1',
    taskData: { priority: 'MEDIUM', estimatedMinutes: 60 },
    checklistItems: ['Research resources', 'Create learning plan', 'Study session 1', 'Practice exercises', 'Review and reflect'],
    isSystem: true,
    usageCount: 0,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'work', name: 'Work', icon: Briefcase },
  { id: 'personal', name: 'Personal', icon: Home },
  { id: 'goals', name: 'Goals', icon: Target },
  { id: 'health', name: 'Health', icon: Heart },
  { id: 'learning', name: 'Learning', icon: GraduationCap },
];

export function TemplatesGallery({ open, onOpenChange, onSelectTemplate }: TemplatesGalleryProps) {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('all');
  const [selectedTemplate, setSelectedTemplate] = React.useState<TaskTemplate | null>(null);

  const filteredTemplates = SYSTEM_TEMPLATES.filter(template => {
    const matchesSearch = !search || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || template.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUse = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="size-5 text-primary" />
            Template Gallery
          </DialogTitle>
          
          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-48 border-r p-4 shrink-0">
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <cat.icon className="size-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => handleSelect(template)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="size-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: template.color + '20' }}
                        >
                          <Icon
                            icon={template.icon || 'solar:document-linear'}
                            className="size-5"
                            style={{ color: template.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {template.checklistItems?.length || 0} items
                            </Badge>
                            {template.taskData?.estimatedMinutes && (
                              <span className="text-[10px] text-muted-foreground">
                                ~{template.taskData.estimatedMinutes}min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Icon icon="solar:box-linear" className="size-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No templates found</p>
              </div>
            )}
          </ScrollArea>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="w-72 border-l p-4 shrink-0 bg-muted/20">
              <div className="space-y-4">
                <div
                  className="size-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedTemplate.color + '20' }}
                >
                  <Icon
                    icon={selectedTemplate.icon || 'solar:document-linear'}
                    className="size-8"
                    style={{ color: selectedTemplate.color }}
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>

                {selectedTemplate.checklistItems && selectedTemplate.checklistItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Checklist Items
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedTemplate.checklistItems.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="size-4 rounded border border-muted-foreground/30" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full" onClick={handleUse}>
                  Use Template
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TemplatesGallery;
