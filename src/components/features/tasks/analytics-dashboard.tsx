'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, TrendingDown, Target, Clock, CheckCircle2, AlertTriangle, Flame, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    completionRate: number;
    tasksByPriority: Record<string, number>;
    createdThisPeriod: number;
    completedThisPeriod: number;
  };
  productivity?: {
    dailyCompletions: Array<{ date: string; label: string; completed: number; created: number }>;
    bestDay: { date: string; label: string; completed: number };
    avgTasksPerDay: number;
    currentStreak: number;
  };
  completion?: {
    onTimeRate: number;
    onTimeCount: number;
    lateCount: number;
    earlyCount: number;
    tasksByList: Array<{ name: string; color: string; count: number }>;
  };
  focus?: {
    totalMinutesTracked: number;
    totalHours: number;
    entriesCount: number;
    avgSessionMinutes: number;
    mostProductiveHour: { hour: number; minutes: number } | null;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [period, setPeriod] = React.useState<'week' | 'month' | 'quarter'>('week');
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/analytics?period=${period}&type=all`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <BarChart3 className="size-12 mx-auto mb-3 opacity-30" />
        <p>Unable to load analytics</p>
      </div>
    );
  }

  const maxDailyCompletion = Math.max(
    ...(data.productivity?.dailyCompletions.map(d => d.completed) || [1])
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track your productivity and task completion
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      {data.overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Completion Rate"
            value={`${data.overview.completionRate}%`}
            icon={<Target className="size-5" />}
            trend={data.overview.completionRate >= 70 ? 'up' : 'down'}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            title="Tasks Completed"
            value={data.overview.completedThisPeriod.toString()}
            subtitle={`of ${data.overview.createdThisPeriod} created`}
            icon={<CheckCircle2 className="size-5" />}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
          <StatCard
            title="In Progress"
            value={data.overview.inProgressTasks.toString()}
            icon={<Clock className="size-5" />}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            title="Overdue"
            value={data.overview.overdueTasks.toString()}
            icon={<AlertTriangle className="size-5" />}
            trend={data.overview.overdueTasks > 0 ? 'down' : undefined}
            color="text-destructive"
            bgColor="bg-destructive/10"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        {data.productivity && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
                {data.productivity.currentStreak > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Flame className="size-3 text-orange-500" />
                    {data.productivity.currentStreak} day streak
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32">
                {data.productivity.dailyCompletions.slice(-7).map((day, index) => (
                  <motion.div
                    key={day.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.completed / maxDailyCompletion) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-md min-h-[4px]",
                        day.completed > 0 ? "bg-primary" : "bg-muted"
                      )}
                      style={{ height: `${Math.max((day.completed / maxDailyCompletion) * 100, 4)}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground mt-1">{day.label}</span>
                    <span className="text-xs font-medium">{day.completed}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.productivity.avgTasksPerDay}</p>
                  <p className="text-xs text-muted-foreground">Avg per day</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{data.productivity.bestDay.completed}</p>
                  <p className="text-xs text-muted-foreground">Best day ({data.productivity.bestDay.label})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority Distribution */}
        {data.overview?.tasksByPriority && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasks by Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['HIGH', 'MEDIUM', 'LOW', 'NONE'] as const).map((priority) => {
                const count = data.overview!.tasksByPriority[priority] || 0;
                const total = data.overview!.totalTasks || 1;
                const percentage = Math.round((count / total) * 100);
                const colors = {
                  HIGH: { bg: 'bg-red-500', text: 'text-red-500' },
                  MEDIUM: { bg: 'bg-yellow-500', text: 'text-yellow-500' },
                  LOW: { bg: 'bg-green-500', text: 'text-green-500' },
                  NONE: { bg: 'bg-gray-400', text: 'text-gray-400' },
                };

                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize">{priority.toLowerCase()}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={cn("h-full rounded-full", colors[priority].bg)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Completion Rate Details */}
        {data.completion && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="relative size-32">
                  <svg className="size-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${data.completion.onTimeRate * 3.52} 352`}
                      className="text-green-500"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{data.completion.onTimeRate}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mt-2">
                <div>
                  <p className="text-lg font-bold text-green-500">{data.completion.earlyCount}</p>
                  <p className="text-xs text-muted-foreground">Early</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-blue-500">{data.completion.onTimeCount}</p>
                  <p className="text-xs text-muted-foreground">On Time</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-500">{data.completion.lateCount}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Focus Time */}
        {data.focus && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold">{data.focus.totalHours}</p>
                <p className="text-sm text-muted-foreground">hours tracked</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-medium">{data.focus.entriesCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. session</span>
                  <span className="font-medium">{data.focus.avgSessionMinutes} min</span>
                </div>
                {data.focus.mostProductiveHour && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Most productive</span>
                    <span className="font-medium">
                      {data.focus.mostProductiveHour.hour}:00
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks by List */}
        {data.completion?.tasksByList && data.completion.tasksByList.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasks by List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.completion.tasksByList.slice(0, 5).map((list, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="flex-1 text-sm truncate">{list.name}</span>
                    <span className="text-sm font-medium">{list.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color: string;
  bgColor: string;
}

function StatCard({ title, value, subtitle, icon, trend, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", bgColor, color)}>
            {icon}
          </div>
          {trend && (
            <div className={cn("flex items-center text-sm", trend === 'up' ? 'text-green-500' : 'text-red-500')}>
              {trend === 'up' ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">
            {title}
            {subtitle && <span className="block mt-0.5">{subtitle}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnalyticsDashboard;
