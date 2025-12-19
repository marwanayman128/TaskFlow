'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Lightbulb, ArrowRight, Plus, RefreshCw, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AISuggestion {
  title: string;
  reason: string;
  priority?: string;
  estimatedMinutes?: number;
}

interface AISuggestionsWidgetProps {
  onSelectSuggestion: (suggestion: AISuggestion) => void;
  context?: string;
  className?: string;
}

export function AISuggestionsWidget({ onSelectSuggestion, context, className }: AISuggestionsWidgetProps) {
  const [suggestions, setSuggestions] = React.useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSuggestions = async (type: string = 'next_tasks') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
      });

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSuggestions();
  }, [context]);

  if (error) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-center text-sm text-muted-foreground">
          <p>{error}</p>
          <Button variant="ghost" size="sm" onClick={() => fetchSuggestions()} className="mt-2">
            <RefreshCw className="size-4 mr-1" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-semibold text-sm">AI Suggestions</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchSuggestions()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No suggestions right now</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="w-full text-left p-3 rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Wand2 className="size-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {suggestion.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {suggestion.reason}
                      </p>
                      {(suggestion.priority || suggestion.estimatedMinutes) && (
                        <div className="flex items-center gap-2 mt-1.5">
                          {suggestion.priority && (
                            <Badge variant="secondary" className="text-[10px]">
                              {suggestion.priority}
                            </Badge>
                          )}
                          {suggestion.estimatedMinutes && (
                            <span className="text-[10px] text-muted-foreground">
                              ~{suggestion.estimatedMinutes}min
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Plus className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}

// Inline AI input suggestions
interface AIInputSuggestionsProps {
  value: string;
  onSelect: (suggestion: string) => void;
  type?: 'task_title' | 'subtasks';
}

export function AIInputSuggestions({ value, onSelect, type = 'task_title' }: AIInputSuggestionsProps) {
  const [suggestions, setSuggestions] = React.useState<{ title: string; reason: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Debounced fetch
  React.useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/ai/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, context: value }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, type]);

  if (suggestions.length === 0 && !isLoading) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border rounded-lg shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span>Getting suggestions...</span>
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion.title)}
              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <Sparkles className="size-3 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{suggestion.title}</p>
                {suggestion.reason && (
                  <p className="text-xs text-muted-foreground truncate">{suggestion.reason}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Smart task breakdown button
interface SmartBreakdownButtonProps {
  taskTitle: string;
  onBreakdown: (subtasks: { title: string; estimatedMinutes: number; priority: string }[]) => void;
}

export function SmartBreakdownButton({ taskTitle, onBreakdown }: SmartBreakdownButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBreakdown = async () => {
    if (!taskTitle.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'smart_breakdown', context: taskTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        onBreakdown(data.suggestions || []);
      }
    } catch (err) {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBreakdown}
      disabled={isLoading || !taskTitle.trim()}
      className="gap-1.5"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Wand2 className="size-4" />
      )}
      Break down with AI
    </Button>
  );
}

export default AISuggestionsWidget;
