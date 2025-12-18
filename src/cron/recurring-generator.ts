/**
 * Recurring Task Generator Cron Job
 * 
 * This job runs daily to generate new instances of recurring tasks
 * based on their RRULE patterns.
 * 
 * Uses the 'rrule' library to parse recurrence rules.
 */

import { prisma } from '@/lib/prisma';
import { RRule } from 'rrule';

export async function generateRecurringTasks() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  try {
    // Find all recurring tasks that might need new instances
    const recurringTasks = await prisma.task.findMany({
      where: {
        isRecurring: true,
        recurrenceRule: { not: null },
        deletedAt: null,
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        id: true,
        organizationId: true,
        createdById: true,
        title: true,
        description: true,
        notes: true,
        priority: true,
        listId: true,
        boardId: true,
        boardColumnId: true,
        estimatedMinutes: true,
        recurrenceRule: true,
        tags: {
          select: { tagId: true },
        },
      },
    });

    console.log(`[Recurring Generator] Found ${recurringTasks.length} recurring tasks`);

    let generatedCount = 0;

    for (const task of recurringTasks) {
      if (!task.recurrenceRule) continue;

      try {
        // Parse the RRULE
        const rule = RRule.fromString(task.recurrenceRule);
        
        // Get occurrences between now and tomorrow
        const occurrences = rule.between(now, tomorrow);

        for (const occurrence of occurrences) {
          // Check if we already have a task for this occurrence
          const existingTask = await prisma.task.findFirst({
            where: {
              parentTaskId: task.id,
              dueDate: {
                gte: new Date(occurrence.setHours(0, 0, 0, 0)),
                lte: new Date(occurrence.setHours(23, 59, 59, 999)),
              },
            },
          });

          if (existingTask) continue;

          // Create a new task instance
          const newTask = await prisma.task.create({
            data: {
              organizationId: task.organizationId,
              createdById: task.createdById,
              parentTaskId: task.id,
              title: task.title,
              description: task.description,
              notes: task.notes,
              priority: task.priority,
              status: 'TODO',
              listId: task.listId,
              boardId: task.boardId,
              boardColumnId: task.boardColumnId,
              estimatedMinutes: task.estimatedMinutes,
              dueDate: occurrence,
              isRecurring: false, // Instance is not recurring
              tags: {
                create: task.tags.map((t: { tagId: string }) => ({ tagId: t.tagId })),
              },
            },
          });

          generatedCount++;
          console.log(`[Recurring Generator] Created instance: ${newTask.title} for ${occurrence.toISOString()}`);
        }
      } catch (ruleError) {
        console.error(`[Recurring Generator] Invalid RRULE for task ${task.id}:`, ruleError);
      }
    }

    return { generated: generatedCount };
  } catch (error) {
    console.error('[Recurring Generator] Error generating recurring tasks:', error);
    throw error;
  }
}

// API Route handler for Vercel Cron or manual triggering
export async function GET() {
  try {
    const result = await generateRecurringTasks();
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Recurring generator error:', error);
    return Response.json(
      { success: false, error: 'Failed to generate recurring tasks' },
      { status: 500 }
    );
  }
}
