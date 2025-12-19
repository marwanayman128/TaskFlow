import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/v1/ai/suggestions - Get AI task suggestions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { context, type } = body;

    // Get user's recent tasks for context
    const recentTasks = await prisma.task.findMany({
      where: {
        createdById: session.user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    // Get user's lists
    const lists = await prisma.taskList.findMany({
      where: { createdById: session.user.id },
      select: { name: true },
    });

    // Generate suggestions based on type
    let suggestions: any[] = [];

    switch (type) {
      case 'task_title':
        // Suggest task titles based on partial input
        suggestions = generateTaskTitleSuggestions(context, recentTasks);
        break;
      
      case 'next_tasks':
        // Suggest next tasks based on current workload and patterns
        suggestions = generateNextTaskSuggestions(recentTasks, lists);
        break;
      
      case 'priority':
        // Suggest priority based on task content
        suggestions = suggestPriority(context, recentTasks);
        break;
      
      case 'due_date':
        // Suggest due date based on task content and patterns
        suggestions = suggestDueDate(context, recentTasks);
        break;
      
      case 'subtasks':
        // Suggest subtasks for a given task
        suggestions = generateSubtaskSuggestions(context);
        break;
      
      case 'smart_breakdown':
        // Break down a complex task into smaller tasks
        suggestions = generateTaskBreakdown(context);
        break;
      
      default:
        // General suggestions
        suggestions = generateGeneralSuggestions(recentTasks);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

// Helper functions for generating suggestions
// These use pattern matching and heuristics. For production, integrate with OpenAI/Claude API.

function generateTaskTitleSuggestions(
  partialTitle: string,
  recentTasks: any[]
): { title: string; reason: string }[] {
  const suggestions: { title: string; reason: string }[] = [];
  const lowerInput = (partialTitle || '').toLowerCase();

  // Common task patterns
  const patterns: { prefix: string[]; suggestions: string[]; reason: string }[] = [
    {
      prefix: ['review', 'check'],
      suggestions: ['Review project proposal', 'Review meeting notes', 'Check email inbox', 'Review code changes'],
      reason: 'Based on common review tasks',
    },
    {
      prefix: ['schedule', 'book', 'plan'],
      suggestions: ['Schedule team meeting', 'Book dentist appointment', 'Plan weekly review', 'Schedule 1:1 with manager'],
      reason: 'Based on planning activities',
    },
    {
      prefix: ['call', 'contact', 'reach'],
      suggestions: ['Call client for follow-up', 'Contact support team', 'Reach out to vendor'],
      reason: 'Based on communication tasks',
    },
    {
      prefix: ['prepare', 'create', 'make'],
      suggestions: ['Prepare presentation', 'Create project timeline', 'Prepare meeting agenda', 'Create status report'],
      reason: 'Based on creation tasks',
    },
    {
      prefix: ['buy', 'order', 'purchase'],
      suggestions: ['Buy groceries', 'Order office supplies', 'Purchase birthday gift'],
      reason: 'Based on shopping tasks',
    },
    {
      prefix: ['send', 'email', 'follow'],
      suggestions: ['Send project update', 'Email team with status', 'Follow up on proposal', 'Send thank you note'],
      reason: 'Based on communication tasks',
    },
  ];

  // Find matching patterns
  for (const pattern of patterns) {
    if (pattern.prefix.some(p => lowerInput.startsWith(p))) {
      pattern.suggestions.forEach(s => {
        if (s.toLowerCase().includes(lowerInput) || lowerInput.length < 3) {
          suggestions.push({ title: s, reason: pattern.reason });
        }
      });
    }
  }

  // Add suggestions based on recent tasks (similar patterns)
  if (recentTasks.length > 0) {
    const recentPatterns = recentTasks
      .filter(t => t.title.toLowerCase().includes(lowerInput))
      .slice(0, 3)
      .map(t => ({
        title: t.title,
        reason: 'Similar to your recent tasks',
      }));
    suggestions.push(...recentPatterns);
  }

  return suggestions.slice(0, 5);
}

function generateNextTaskSuggestions(
  recentTasks: any[],
  lists: any[]
): { title: string; reason: string; priority: string }[] {
  const suggestions: { title: string; reason: string; priority: string }[] = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();

  // Time-based suggestions
  if (hour >= 8 && hour < 10) {
    suggestions.push({
      title: 'Review daily priorities',
      reason: 'Good morning routine to start productive',
      priority: 'HIGH',
    });
    suggestions.push({
      title: 'Check calendar for today',
      reason: 'Morning planning session',
      priority: 'MEDIUM',
    });
  }

  if (hour >= 16 && hour < 18) {
    suggestions.push({
      title: 'Send end-of-day status update',
      reason: 'Good practice for team communication',
      priority: 'MEDIUM',
    });
    suggestions.push({
      title: 'Plan tomorrow\'s tasks',
      reason: 'Prepare for the next day',
      priority: 'LOW',
    });
  }

  // Day-based suggestions
  if (dayOfWeek === 1) { // Monday
    suggestions.push({
      title: 'Weekly planning session',
      reason: 'Start the week organized',
      priority: 'HIGH',
    });
  }

  if (dayOfWeek === 5) { // Friday
    suggestions.push({
      title: 'Weekly review and cleanup',
      reason: 'End the week on a high note',
      priority: 'MEDIUM',
    });
  }

  // Based on overdue tasks
  const overdue = recentTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED'
  );
  
  if (overdue.length > 0) {
    suggestions.unshift({
      title: `Complete: ${overdue[0].title}`,
      reason: `This task is overdue`,
      priority: 'HIGH',
    });
  }

  return suggestions.slice(0, 5);
}

function suggestPriority(
  taskTitle: string,
  recentTasks: any[]
): { priority: string; confidence: number; reason: string }[] {
  const lower = (taskTitle || '').toLowerCase();

  // Keyword-based priority detection
  const highPriorityKeywords = ['urgent', 'asap', 'critical', 'deadline', 'important', 'emergency'];
  const lowPriorityKeywords = ['when possible', 'eventually', 'someday', 'optional', 'nice to have'];

  if (highPriorityKeywords.some(k => lower.includes(k))) {
    return [{ priority: 'HIGH', confidence: 0.9, reason: 'Contains urgency keywords' }];
  }

  if (lowPriorityKeywords.some(k => lower.includes(k))) {
    return [{ priority: 'LOW', confidence: 0.9, reason: 'Contains low priority keywords' }];
  }

  // Default to medium
  return [{ priority: 'MEDIUM', confidence: 0.6, reason: 'Default priority for this type of task' }];
}

function suggestDueDate(
  taskTitle: string,
  recentTasks: any[]
): { date: string; label: string; reason: string }[] {
  const now = new Date();
  const lower = (taskTitle || '').toLowerCase();

  const suggestions: { date: string; label: string; reason: string }[] = [];

  // Keyword-based due date detection
  if (lower.includes('today') || lower.includes('asap') || lower.includes('urgent')) {
    suggestions.push({
      date: now.toISOString(),
      label: 'Today',
      reason: 'Task mentions urgency',
    });
  }

  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    suggestions.push({
      date: tomorrow.toISOString(),
      label: 'Tomorrow',
      reason: 'Task mentions tomorrow',
    });
  }

  if (lower.includes('this week') || lower.includes('weekly')) {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (5 - endOfWeek.getDay()));
    suggestions.push({
      date: endOfWeek.toISOString(),
      label: 'End of week',
      reason: 'Task is weekly',
    });
  }

  // Default suggestions
  const inThreeDays = new Date(now);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  suggestions.push({
    date: inThreeDays.toISOString(),
    label: 'In 3 days',
    reason: 'Suggested timeframe for this task type',
  });

  return suggestions.slice(0, 3);
}

function generateSubtaskSuggestions(
  taskTitle: string
): { title: string; order: number }[] {
  const lower = (taskTitle || '').toLowerCase();

  // Common subtask patterns
  const patterns: { keywords: string[]; subtasks: string[] }[] = [
    {
      keywords: ['meeting', 'call', 'presentation'],
      subtasks: ['Prepare agenda', 'Send calendar invite', 'Prepare materials', 'Send follow-up notes'],
    },
    {
      keywords: ['report', 'document', 'proposal'],
      subtasks: ['Gather data', 'Create outline', 'Write first draft', 'Review and edit', 'Get feedback', 'Finalize'],
    },
    {
      keywords: ['project', 'launch', 'release'],
      subtasks: ['Define scope', 'Create timeline', 'Assign responsibilities', 'Track progress', 'Review and launch'],
    },
    {
      keywords: ['email', 'newsletter'],
      subtasks: ['Draft content', 'Add images', 'Review copy', 'Send test', 'Schedule send'],
    },
    {
      keywords: ['research', 'analyze', 'study'],
      subtasks: ['Define questions', 'Gather sources', 'Take notes', 'Synthesize findings', 'Write summary'],
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some(k => lower.includes(k))) {
      return pattern.subtasks.map((title, index) => ({ title, order: index }));
    }
  }

  // Generic subtasks
  return [
    { title: 'Plan approach', order: 0 },
    { title: 'Execute main work', order: 1 },
    { title: 'Review results', order: 2 },
    { title: 'Finalize', order: 3 },
  ];
}

function generateTaskBreakdown(
  taskTitle: string
): { title: string; estimatedMinutes: number; priority: string }[] {
  const subtasks = generateSubtaskSuggestions(taskTitle);
  
  return subtasks.map((st, i) => ({
    title: st.title,
    estimatedMinutes: i === 1 ? 60 : 30, // Main work takes longer
    priority: i === 0 ? 'HIGH' : i === subtasks.length - 1 ? 'MEDIUM' : 'LOW',
  }));
}

function generateGeneralSuggestions(
  recentTasks: any[]
): { title: string; reason: string }[] {
  const suggestions = [
    { title: 'Check and respond to emails', reason: 'Regular productivity task' },
    { title: 'Review today\'s priorities', reason: 'Stay organized' },
    { title: 'Take a short break', reason: 'Important for focus' },
    { title: 'Update task progress', reason: 'Keep track of work' },
  ];

  // Check for incomplete tasks from yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const incompleteTasks = recentTasks.filter(t => 
    t.status !== 'COMPLETED' && 
    t.dueDate && 
    new Date(t.dueDate) < yesterday
  );

  if (incompleteTasks.length > 0) {
    suggestions.unshift({
      title: 'Review overdue tasks',
      reason: `You have ${incompleteTasks.length} overdue task(s)`,
    });
  }

  return suggestions;
}
