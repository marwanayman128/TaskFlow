import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, eachDayOfInterval, format } from 'date-fns';

// GET /api/v1/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, all
    const type = searchParams.get('type') || 'overview'; // overview, productivity, completion, focus

    // Calculate date range
    let startDate: Date;
    let endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = startOfWeek(new Date());
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        break;
      case 'quarter':
        startDate = subDays(new Date(), 90);
        break;
      default:
        startDate = subDays(new Date(), 365);
    }

    const userId = session.user.id;
    const orgId = session.user.organizationId;

    // Base query for tasks
    const baseTaskQuery = {
      organizationId: orgId,
      createdById: userId,
      deletedAt: null,
    };

    let analytics: any = {};

    if (type === 'overview' || type === 'all') {
      // Task counts
      const totalTasks = await prisma.task.count({ where: baseTaskQuery });
      const completedTasks = await prisma.task.count({
        where: { ...baseTaskQuery, status: 'COMPLETED' },
      });
      const inProgressTasks = await prisma.task.count({
        where: { ...baseTaskQuery, status: 'IN_PROGRESS' },
      });
      const overdueTasksCount = await prisma.task.count({
        where: {
          ...baseTaskQuery,
          status: { not: 'COMPLETED' },
          dueDate: { lt: new Date() },
        },
      });

      // Tasks by priority
      const tasksByPriority = await prisma.task.groupBy({
        by: ['priority'],
        where: baseTaskQuery,
        _count: { id: true },
      });

      // Tasks completed this period
      const completedThisPeriod = await prisma.task.count({
        where: {
          ...baseTaskQuery,
          status: 'COMPLETED',
          completedAt: { gte: startDate, lte: endDate },
        },
      });

      // Tasks created this period
      const createdThisPeriod = await prisma.task.count({
        where: {
          ...baseTaskQuery,
          createdAt: { gte: startDate, lte: endDate },
        },
      });

      analytics.overview = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks: overdueTasksCount,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByPriority: tasksByPriority.reduce((acc, curr) => {
          acc[curr.priority] = curr._count.id;
          return acc;
        }, {} as Record<string, number>),
        createdThisPeriod,
        completedThisPeriod,
      };
    }

    if (type === 'productivity' || type === 'all') {
      // Daily completion trend
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyCompletions = await Promise.all(
        days.map(async (day) => {
          const dayStart = new Date(day);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);

          const completed = await prisma.task.count({
            where: {
              ...baseTaskQuery,
              completedAt: { gte: dayStart, lte: dayEnd },
            },
          });

          const created = await prisma.task.count({
            where: {
              ...baseTaskQuery,
              createdAt: { gte: dayStart, lte: dayEnd },
            },
          });

          return {
            date: format(day, 'yyyy-MM-dd'),
            label: format(day, 'EEE'),
            completed,
            created,
          };
        })
      );

      // Best day (most completions)
      const bestDay = dailyCompletions.reduce(
        (best, current) => (current.completed > best.completed ? current : best),
        dailyCompletions[0]
      );

      // Average tasks per day
      const avgTasksPerDay = Math.round(
        dailyCompletions.reduce((sum, d) => sum + d.completed, 0) / days.length
      );

      // Current streak
      let streak = 0;
      for (let i = dailyCompletions.length - 1; i >= 0; i--) {
        if (dailyCompletions[i].completed > 0) {
          streak++;
        } else if (i < dailyCompletions.length - 1) {
          break;
        }
      }

      analytics.productivity = {
        dailyCompletions,
        bestDay,
        avgTasksPerDay,
        currentStreak: streak,
      };
    }

    if (type === 'completion' || type === 'all') {
      // Average completion time (for completed tasks with due dates)
      const completedWithDue = await prisma.task.findMany({
        where: {
          ...baseTaskQuery,
          status: 'COMPLETED',
          dueDate: { not: null },
          completedAt: { not: null },
        },
        select: {
          dueDate: true,
          completedAt: true,
          createdAt: true,
        },
        take: 100,
      });

      let onTimeCount = 0;
      let lateCount = 0;
      let earlyCount = 0;

      completedWithDue.forEach(task => {
        if (task.completedAt && task.dueDate) {
          const diff = task.completedAt.getTime() - task.dueDate.getTime();
          if (diff < -86400000) earlyCount++; // More than 1 day early
          else if (diff > 86400000) lateCount++; // More than 1 day late
          else onTimeCount++;
        }
      });

      // Tasks by list
      const tasksByList = await prisma.task.groupBy({
        by: ['listId'],
        where: {
          ...baseTaskQuery,
          listId: { not: null },
        },
        _count: { id: true },
      });

      const listsWithCounts = await Promise.all(
        tasksByList.map(async (item) => {
          const list = await prisma.taskList.findUnique({
            where: { id: item.listId! },
            select: { name: true, color: true },
          });
          return {
            listId: item.listId,
            name: list?.name || 'Unknown',
            color: list?.color || '#6366F1',
            count: item._count.id,
          };
        })
      );

      analytics.completion = {
        onTimeRate: completedWithDue.length > 0
          ? Math.round(((onTimeCount + earlyCount) / completedWithDue.length) * 100)
          : 0,
        onTimeCount,
        lateCount,
        earlyCount,
        tasksByList: listsWithCounts,
      };
    }

    if (type === 'focus' || type === 'all') {
      // Time tracking stats
      const timeEntries = await prisma.timeEntry.findMany({
        where: {
          userId,
          startTime: { gte: startDate, lte: endDate },
          endTime: { not: null },
        },
        select: {
          startTime: true,
          endTime: true,
          task: { select: { title: true, listId: true } },
        },
      });

      const totalMinutes = timeEntries.reduce((sum, entry) => {
        if (entry.endTime) {
          return sum + (entry.endTime.getTime() - entry.startTime.getTime()) / 60000;
        }
        return sum;
      }, 0);

      // Most productive hours
      const hourlyDistribution: Record<number, number> = {};
      timeEntries.forEach(entry => {
        const hour = entry.startTime.getHours();
        const minutes = entry.endTime 
          ? (entry.endTime.getTime() - entry.startTime.getTime()) / 60000
          : 0;
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + minutes;
      });

      const mostProductiveHour = Object.entries(hourlyDistribution)
        .sort(([, a], [, b]) => b - a)[0];

      analytics.focus = {
        totalMinutesTracked: Math.round(totalMinutes),
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        entriesCount: timeEntries.length,
        avgSessionMinutes: timeEntries.length > 0 
          ? Math.round(totalMinutes / timeEntries.length)
          : 0,
        mostProductiveHour: mostProductiveHour 
          ? { hour: parseInt(mostProductiveHour[0]), minutes: Math.round(mostProductiveHour[1]) }
          : null,
      };
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
