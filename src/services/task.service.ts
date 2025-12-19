import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  Task,
  TaskList,
  Board,
  Tag,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskListInput,
  UpdateTaskListInput,
  CreateBoardInput,
  UpdateBoardInput,
  CreateBoardColumnInput,
  UpdateBoardColumnInput,
  CreateTagInput,
  CreateCommentInput,
  CreateReminderInput,
  TasksQuery,
  TasksResponse,
  BulkTaskOperation,
  TaskStats,
  ReminderType,
} from '@/lib/types/tasks';

// ============================================
// TASK SERVICE
// ============================================

export class TaskService {
  // --------------------------------------------
  // TASK OPERATIONS
  // --------------------------------------------

  static async getTasks(
    organizationId: string,
    query: TasksQuery
  ): Promise<TasksResponse> {
    const {
      listId,
      boardId,
      boardColumnId,
      status,
      priority,
      assignedToId,
      dueDate,
      dueBefore,
      dueAfter,
      search,
      includeSubtasks = false,
      includeCompleted = true,
      sortBy = 'position',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
    } = query;

    const where: Prisma.TaskWhereInput = {
      organizationId,
      deletedAt: null,
    };

    // Filter by parent (for top-level tasks only if not including subtasks)
    if (!includeSubtasks) {
      where.parentTaskId = null;
    }

    // Filter by list
    if (listId) {
      where.listId = listId;
    }

    // Filter by board
    if (boardId) {
      where.boardId = boardId;
    }

    // Filter by board column
    if (boardColumnId) {
      where.boardColumnId = boardColumnId;
    }

    // Filter by status
    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    // Exclude completed if requested
    if (!includeCompleted) {
      where.status = { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] };
    }

    // Filter by priority
    if (priority) {
      if (Array.isArray(priority)) {
        where.priority = { in: priority };
      } else {
        where.priority = priority;
      }
    }

    // Filter by assignee
    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    // Filter by due date
    if (dueDate) {
      const date = new Date(dueDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.dueDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (dueBefore) {
      where.dueDate = {
        ...(where.dueDate as object),
        lte: new Date(dueBefore),
      };
    }

    if (dueAfter) {
      where.dueDate = {
        ...(where.dueDate as object),
        gte: new Date(dueAfter),
      };
    }

    // Search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder;
    } else if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'title') {
      orderBy.title = sortOrder;
    } else {
      orderBy.position = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, fullName: true, avatar: true },
          },
          assignedTo: {
            select: { id: true, fullName: true, avatar: true },
          },
          list: {
            select: { id: true, name: true, color: true, icon: true },
          },
          boardColumn: {
            select: { id: true, name: true, color: true },
          },
          tags: {
            include: { tag: true },
          },
          subTasks: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              subTasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                    subTasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true
                        }
                    }
                },
                where: { deletedAt: null },
                orderBy: { position: 'asc' }
              }
            },
          },
          _count: {
            select: {
              subTasks: true,
              comments: true,
              attachments: true,
              checklists: true,
            },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks: tasks as unknown as Task[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTask(taskId: string, organizationId: string): Promise<Task | null> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, fullName: true, avatar: true },
        },
        list: true,
        board: true,
        boardColumn: true,
        parentTask: {
          select: { id: true, title: true },
        },
        subTasks: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          include: {
            assignedTo: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
        },
        tags: {
          include: { tag: true },
        },
        attachments: true,
        comments: {
          where: { deletedAt: null, parentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            replies: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        reminders: {
          orderBy: { remindAt: 'asc' },
        },
        customFields: {
          include: { customField: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        timeEntries: {
          orderBy: { startTime: 'desc' },
        },
        checklists: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    return task as unknown as Task | null;
  }

  static async createTask(
    organizationId: string,
    userId: string,
    input: CreateTaskInput
  ): Promise<Task> {
    const { tagIds, ...taskData } = input;

    // Get the next position
    const lastTask = await prisma.task.findFirst({
      where: {
        organizationId,
        listId: input.listId,
        boardColumnId: input.boardColumnId,
        parentTaskId: input.parentTaskId || null,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = (lastTask?.position ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        organizationId,
        createdById: userId,
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        dueTime: taskData.dueTime ? new Date(taskData.dueTime) : null,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        position,
        tags: tagIds?.length
          ? {
              create: tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    // Automatically create a reminder if task has a due date/time
    if (taskData.dueDate || taskData.dueTime) {
      const remindAt = taskData.dueTime 
        ? new Date(taskData.dueTime) 
        : taskData.dueDate 
          ? new Date(taskData.dueDate) 
          : null;
      
      if (remindAt) {
        await prisma.taskReminder.create({
          data: {
            taskId: task.id,
            userId,
            type: 'TIME',
            remindAt,
            location: taskData.location || null,
          },
        });
      }
    }

    // Create activity log
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId,
        action: 'created',
        details: { title: task.title },
      },
    });

    return task as unknown as Task;
  }

  static async updateTask(
    taskId: string,
    organizationId: string,
    userId: string,
    input: UpdateTaskInput
  ): Promise<Task | null> {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, organizationId, deletedAt: null },
    });

    if (!existingTask) return null;

    const { tagIds, ...updateData } = input;

    // Prepare date updates
    const dateUpdates: Prisma.TaskUpdateInput = {};
    if (updateData.dueDate !== undefined) {
      dateUpdates.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }
    if (updateData.dueTime !== undefined) {
      dateUpdates.dueTime = updateData.dueTime ? new Date(updateData.dueTime) : null;
    }
    if (updateData.startDate !== undefined) {
      dateUpdates.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    }
    if (updateData.completedAt !== undefined) {
      dateUpdates.completedAt = updateData.completedAt ? new Date(updateData.completedAt) : null;
    }

    // Handle status change to completed
    if (updateData.status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
      dateUpdates.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        ...dateUpdates,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        assignedTo: {
          select: { id: true, fullName: true, avatar: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.taskTag.deleteMany({ where: { taskId } });
      if (tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: tagIds.map((tagId) => ({ taskId, tagId })),
        });
      }
    }

    // Create activity log for significant changes
    const changes: string[] = [];
    if (updateData.status && updateData.status !== existingTask.status) {
      changes.push(`status changed to ${updateData.status}`);
    }
    if (updateData.priority && updateData.priority !== existingTask.priority) {
      changes.push(`priority changed to ${updateData.priority}`);
    }
    if (updateData.assignedToId !== undefined && updateData.assignedToId !== existingTask.assignedToId) {
      changes.push('assignee changed');
    }

    if (changes.length > 0) {
      await prisma.taskActivity.create({
        data: {
          taskId: task.id,
          userId,
          action: 'updated',
          details: { changes },
        },
      });
    }

    // Handle reminder updates when due date/time changes
    if (updateData.dueDate !== undefined || updateData.dueTime !== undefined) {
      // Delete existing non-triggered reminders for this task
      await prisma.taskReminder.deleteMany({
        where: {
          taskId,
          isTriggered: false,
          type: 'TIME',
        },
      });

      // Create new reminder if there's a due date/time
      const newDueTime = updateData.dueTime !== undefined 
        ? (updateData.dueTime ? new Date(updateData.dueTime) : null)
        : existingTask.dueTime;
      const newDueDate = updateData.dueDate !== undefined 
        ? (updateData.dueDate ? new Date(updateData.dueDate) : null)
        : existingTask.dueDate;
      
      const remindAt = newDueTime || newDueDate;
      
      if (remindAt && remindAt > new Date()) {
        await prisma.taskReminder.create({
          data: {
            taskId,
            userId,
            type: 'TIME',
            remindAt,
            location: updateData.location ?? existingTask.location,
          },
        });
      }
    }

    return task as unknown as Task;
  }

  static async deleteTask(
    taskId: string,
    organizationId: string,
    userId: string,
    permanent = false
  ): Promise<boolean> {
    const task = await prisma.task.findFirst({
      where: { id: taskId, organizationId },
    });

    if (!task) return false;

    if (permanent) {
      await prisma.task.delete({ where: { id: taskId } });
    } else {
      await prisma.task.update({
        where: { id: taskId },
        data: { deletedAt: new Date() },
      });
    }

    // Create activity log
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: permanent ? 'deleted_permanently' : 'deleted',
      },
    });

    return true;
  }

  static async completeTask(
    taskId: string,
    organizationId: string,
    userId: string
  ): Promise<Task | null> {
    return this.updateTask(taskId, organizationId, userId, {
      status: TaskStatus.COMPLETED,
    });
  }

  static async reorderTasks(
    organizationId: string,
    taskIds: string[]
  ): Promise<void> {
    const updates = taskIds.map((id, index) =>
      prisma.task.updateMany({
        where: { id, organizationId },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);
  }

  static async bulkOperation(
    organizationId: string,
    userId: string,
    operation: BulkTaskOperation
  ): Promise<number> {
    const { operation: op, taskIds, data } = operation;

    switch (op) {
      case 'complete':
        const completeResult = await prisma.task.updateMany({
          where: { id: { in: taskIds }, organizationId },
          data: { status: TaskStatus.COMPLETED, completedAt: new Date() },
        });
        return completeResult.count;

      case 'delete':
        const deleteResult = await prisma.task.updateMany({
          where: { id: { in: taskIds }, organizationId },
          data: { deletedAt: new Date() },
        });
        return deleteResult.count;

      case 'move':
        const moveResult = await prisma.task.updateMany({
          where: { id: { in: taskIds }, organizationId },
          data: {
            listId: data?.listId,
            boardId: data?.boardId,
            boardColumnId: data?.boardColumnId,
          },
        });
        return moveResult.count;

      case 'assign':
        const assignResult = await prisma.task.updateMany({
          where: { id: { in: taskIds }, organizationId },
          data: { assignedToId: data?.assignedToId },
        });
        return assignResult.count;

      case 'setPriority':
        const priorityResult = await prisma.task.updateMany({
          where: { id: { in: taskIds }, organizationId },
          data: { priority: data?.priority },
        });
        return priorityResult.count;

      case 'setStatus':
        const statusResult = await prisma.task.updateMany({
          where: { id: { in: taskIds }, organizationId },
          data: { status: data?.status },
        });
        return statusResult.count;

      default:
        return 0;
    }
  }

  // --------------------------------------------
  // TODAY / UPCOMING / OVERDUE
  // --------------------------------------------

  static async getTodaysTasks(organizationId: string, userId: string): Promise<Task[]> {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await prisma.task.findMany({
      where: {
        organizationId,
        deletedAt: null,
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
        OR: [
          { dueDate: { gte: startOfDay, lte: endOfDay } },
          { createdById: userId, dueDate: null, createdAt: { gte: startOfDay } },
        ],
      },
      orderBy: [{ dueTime: 'asc' }, { priority: 'desc' }, { position: 'asc' }],
      include: {
        list: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
        assignedTo: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    return tasks as unknown as Task[];
  }

  static async getUpcomingTasks(
    organizationId: string,
    days: number = 7
  ): Promise<Task[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const tasks = await prisma.task.findMany({
      where: {
        organizationId,
        deletedAt: null,
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      orderBy: [{ dueDate: 'asc' }, { dueTime: 'asc' }],
      include: {
        list: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
        assignedTo: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    return tasks as unknown as Task[];
  }

  static async getOverdueTasks(organizationId: string): Promise<Task[]> {
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: {
        organizationId,
        deletedAt: null,
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
        dueDate: { lt: now },
      },
      orderBy: [{ dueDate: 'asc' }],
      include: {
        list: { select: { id: true, name: true, color: true } },
        tags: { include: { tag: true } },
        assignedTo: { select: { id: true, fullName: true, avatar: true } },
      },
    });

    return tasks as unknown as Task[];
  }

  static async getTaskStats(organizationId: string): Promise<TaskStats> {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const endOfTomorrow = new Date(endOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [total, completed, pending, overdue, dueToday, dueTomorrow, completedThisWeek, completedThisMonth] =
      await Promise.all([
        prisma.task.count({
          where: { organizationId, deletedAt: null },
        }),
        prisma.task.count({
          where: { organizationId, deletedAt: null, status: TaskStatus.COMPLETED },
        }),
        prisma.task.count({
          where: {
            organizationId,
            deletedAt: null,
            status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
          },
        }),
        prisma.task.count({
          where: {
            organizationId,
            deletedAt: null,
            status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
            dueDate: { lt: new Date() },
          },
        }),
        prisma.task.count({
          where: {
            organizationId,
            deletedAt: null,
            status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
            dueDate: { gte: startOfToday, lte: endOfToday },
          },
        }),
        prisma.task.count({
          where: {
            organizationId,
            deletedAt: null,
            status: { notIn: [TaskStatus.COMPLETED, TaskStatus.CANCELLED] },
            dueDate: { gte: startOfTomorrow, lte: endOfTomorrow },
          },
        }),
        prisma.task.count({
          where: {
            organizationId,
            deletedAt: null,
            status: TaskStatus.COMPLETED,
            completedAt: { gte: startOfWeek },
          },
        }),
        prisma.task.count({
          where: {
            organizationId,
            deletedAt: null,
            status: TaskStatus.COMPLETED,
            completedAt: { gte: startOfMonth },
          },
        }),
      ]);

    return {
      total,
      completed,
      pending,
      overdue,
      dueToday,
      dueTomorrow,
      completedThisWeek,
      completedThisMonth,
    };
  }

  // --------------------------------------------
  // COMMENTS
  // --------------------------------------------

  static async addComment(
    taskId: string,
    userId: string,
    input: CreateCommentInput
  ) {
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        ...input,
      },
    });

    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: 'commented',
      },
    });

    return comment;
  }

  // --------------------------------------------
  // REMINDERS
  // --------------------------------------------

  static async addReminder(
    taskId: string,
    userId: string,
    input: CreateReminderInput
  ) {
    return prisma.taskReminder.create({
      data: {
        taskId,
        userId,
        type: input.type,
        remindAt: input.remindAt ? new Date(input.remindAt) : null,
        location: input.location,
        locationLat: input.locationLat,
        locationLng: input.locationLng,
      },
    });
  }

  static async deleteReminder(reminderId: string) {
    return prisma.taskReminder.delete({
      where: { id: reminderId },
    });
  }
}

// ============================================
// LIST SERVICE
// ============================================

export class ListService {
  static async getLists(organizationId: string): Promise<TaskList[]> {
    const lists = await prisma.taskList.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: [{ isFavorite: 'desc' }, { position: 'asc' }],
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    return lists as unknown as TaskList[];
  }

  static async getList(listId: string, organizationId: string): Promise<TaskList | null> {
    const list = await prisma.taskList.findFirst({
      where: { id: listId, organizationId, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        tasks: {
          where: { deletedAt: null, parentTaskId: null },
          orderBy: { position: 'asc' },
          include: {
            assignedTo: {
              select: { id: true, fullName: true, avatar: true },
            },
            tags: { include: { tag: true } },
            subTasks: {
              where: { deletedAt: null },
              select: { id: true, title: true, status: true },
            },
          },
        },
        sharedWith: true,
        _count: {
          select: { tasks: true },
        },
      },
    });

    return list as unknown as TaskList | null;
  }

  static async createList(
    organizationId: string,
    userId: string,
    input: CreateTaskListInput
  ): Promise<TaskList> {
    const lastList = await prisma.taskList.findFirst({
      where: { organizationId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const list = await prisma.taskList.create({
      data: {
        organizationId,
        createdById: userId,
        ...input,
        position: (lastList?.position ?? -1) + 1,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return list as unknown as TaskList;
  }

  static async updateList(
    listId: string,
    organizationId: string,
    input: UpdateTaskListInput
  ): Promise<TaskList | null> {
    const existing = await prisma.taskList.findFirst({
      where: { id: listId, organizationId, deletedAt: null },
    });

    if (!existing) return null;

    const list = await prisma.taskList.update({
      where: { id: listId },
      data: input,
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        _count: { select: { tasks: true } },
      },
    });

    return list as unknown as TaskList;
  }

  static async deleteList(
    listId: string,
    organizationId: string
  ): Promise<boolean> {
    const list = await prisma.taskList.findFirst({
      where: { id: listId, organizationId },
    });

    if (!list) return false;

    // Soft delete the list and its tasks
    await prisma.$transaction([
      prisma.task.updateMany({
        where: { listId },
        data: { deletedAt: new Date() },
      }),
      prisma.taskList.update({
        where: { id: listId },
        data: { deletedAt: new Date() },
      }),
    ]);

    return true;
  }
}

// ============================================
// BOARD SERVICE
// ============================================

export class BoardService {
  static async getBoards(organizationId: string): Promise<Board[]> {
    const boards = await prisma.board.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            _count: { select: { tasks: true } },
          },
        },
        _count: {
          select: { tasks: true, members: true },
        },
      },
    });

    return boards as unknown as Board[];
  }

  static async getBoard(boardId: string, organizationId: string): Promise<Board | null> {
    const board = await prisma.board.findFirst({
      where: { id: boardId, organizationId, deletedAt: null },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              where: { deletedAt: null },
              orderBy: { position: 'asc' },
              include: {
                assignedTo: {
                  select: { id: true, fullName: true, avatar: true },
                },
                tags: { include: { tag: true } },
                _count: { select: { subTasks: true, comments: true } },
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, avatar: true },
            },
          },
        },
        automations: true,
      },
    });

    return board as unknown as Board | null;
  }

  static async createBoard(
    organizationId: string,
    userId: string,
    input: CreateBoardInput
  ): Promise<Board> {
    const board = await prisma.board.create({
      data: {
        organizationId,
        createdById: userId,
        ...input,
        // Create default columns
        columns: {
          create: [
            { name: 'To Do', position: 0, color: '#6366f1' },
            { name: 'In Progress', position: 1, color: '#f59e0b' },
            { name: 'Done', position: 2, color: '#22c55e' },
          ],
        },
        // Add creator as owner
        members: {
          create: { userId, role: 'OWNER' },
        },
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        columns: true,
        members: true,
      },
    });

    return board as unknown as Board;
  }

  static async updateBoard(
    boardId: string,
    organizationId: string,
    input: UpdateBoardInput
  ): Promise<Board | null> {
    const existing = await prisma.board.findFirst({
      where: { id: boardId, organizationId, deletedAt: null },
    });

    if (!existing) return null;

    const board = await prisma.board.update({
      where: { id: boardId },
      data: input,
      include: {
        createdBy: {
          select: { id: true, fullName: true, avatar: true },
        },
        columns: true,
        _count: { select: { tasks: true, members: true } },
      },
    });

    return board as unknown as Board;
  }

  static async deleteBoard(boardId: string, organizationId: string): Promise<boolean> {
    const board = await prisma.board.findFirst({
      where: { id: boardId, organizationId },
    });

    if (!board) return false;

    await prisma.board.update({
      where: { id: boardId },
      data: { deletedAt: new Date() },
    });

    return true;
  }

  static async addColumn(
    boardId: string,
    input: CreateBoardColumnInput
  ) {
    const lastColumn = await prisma.boardColumn.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return prisma.boardColumn.create({
      data: {
        boardId,
        ...input,
        position: input.position ?? (lastColumn?.position ?? -1) + 1,
      },
    });
  }

  static async updateColumn(
    columnId: string,
    input: UpdateBoardColumnInput
  ) {
    return prisma.boardColumn.update({
      where: { id: columnId },
      data: input,
    });
  }

  static async deleteColumn(columnId: string) {
    // Move tasks to null column first
    await prisma.task.updateMany({
      where: { boardColumnId: columnId },
      data: { boardColumnId: null },
    });

    return prisma.boardColumn.delete({
      where: { id: columnId },
    });
  }

  static async reorderColumns(boardId: string, columnIds: string[]) {
    const updates = columnIds.map((id, index) =>
      prisma.boardColumn.update({
        where: { id },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);
  }
}

// ============================================
// TAG SERVICE
// ============================================

export class TagService {
  static async getTags(organizationId: string): Promise<Tag[]> {
    const tags = await prisma.tag.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });

    return tags as unknown as Tag[];
  }

  static async createTag(
    organizationId: string,
    input: CreateTagInput
  ): Promise<Tag> {
    const tag = await prisma.tag.create({
      data: {
        organizationId,
        ...input,
      },
    });

    return tag as unknown as Tag;
  }

  static async updateTag(
    tagId: string,
    organizationId: string,
    input: Partial<CreateTagInput>
  ): Promise<Tag | null> {
    const existing = await prisma.tag.findFirst({
      where: { id: tagId, organizationId },
    });

    if (!existing) return null;

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: input,
    });

    return tag as unknown as Tag;
  }

  static async deleteTag(tagId: string, organizationId: string): Promise<boolean> {
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, organizationId },
    });

    if (!tag) return false;

    await prisma.tag.delete({ where: { id: tagId } });
    return true;
  }
}

// ============================================
// COMMENT SERVICE
// ============================================

export class CommentService {
  static async getComments(taskId: string) {
    const comments = await prisma.taskComment.findMany({
      where: { 
        taskId,
        deletedAt: null,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
        replies: {
          where: { deletedAt: null },
          include: {
            user: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments;
  }

  static async createComment(
    taskId: string,
    userId: string,
    input: CreateCommentInput
  ) {
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content: input.content,
        parentId: input.parentId,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    // Log activity
    await ActivityService.logActivity(taskId, userId, 'COMMENT_ADDED', {
      commentId: comment.id,
      content: input.content.substring(0, 100),
    });

    return comment;
  }

  static async updateComment(
    commentId: string,
    userId: string,
    content: string
  ) {
    const existing = await prisma.taskComment.findFirst({
      where: { id: commentId, userId },
    });

    if (!existing) return null;

    const comment = await prisma.taskComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return comment;
  }

  static async deleteComment(commentId: string, userId: string) {
    const existing = await prisma.taskComment.findFirst({
      where: { id: commentId, userId },
    });

    if (!existing) return false;

    // Soft delete
    await prisma.taskComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return true;
  }
}

// ============================================
// ACTIVITY SERVICE
// ============================================

export class ActivityService {
  static async getActivities(taskId: string, limit: number = 50) {
    const activities = await prisma.taskActivity.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  }

  static async logActivity(
    taskId: string,
    userId: string,
    action: string,
    details?: Record<string, unknown>
  ) {
    const activity = await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action,
        details: details as any,
      },
    });

    return activity;
  }
}

// ============================================
// TIME TRACKING SERVICE
// ============================================

export class TimeTrackingService {
  static async getTimeEntries(taskId: string) {
    const entries = await prisma.timeEntry.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return entries;
  }

  static async startTimer(
    taskId: string,
    userId: string,
    description?: string
  ) {
    // Check if there's already a running timer for this user
    const existingTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null,
      },
    });

    if (existingTimer) {
      // Stop the existing timer first
      await this.stopTimer(existingTimer.id, userId);
    }

    const entry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        description,
        startTime: new Date(),
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return entry;
  }

  static async stopTimer(entryId: string, userId: string) {
    const entry = await prisma.timeEntry.findFirst({
      where: { id: entryId, userId, endTime: null },
    });

    if (!entry) return null;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - entry.startTime.getTime()) / 1000 / 60); // in minutes

    const updated = await prisma.timeEntry.update({
      where: { id: entryId },
      data: {
        endTime,
        duration,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return updated;
  }

  static async addManualEntry(
    taskId: string,
    userId: string,
    data: {
      description?: string;
      startTime: Date;
      endTime: Date;
      isBillable?: boolean;
    }
  ) {
    const duration = Math.floor((data.endTime.getTime() - data.startTime.getTime()) / 1000 / 60);

    const entry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        duration,
        isBillable: data.isBillable ?? false,
      },
      include: {
        user: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return entry;
  }

  static async deleteEntry(entryId: string, userId: string) {
    const entry = await prisma.timeEntry.findFirst({
      where: { id: entryId, userId },
    });

    if (!entry) return false;

    await prisma.timeEntry.delete({ where: { id: entryId } });
    return true;
  }

  static async getTaskTotalTime(taskId: string): Promise<number> {
    const result = await prisma.timeEntry.aggregate({
      where: { taskId, endTime: { not: null } },
      _sum: { duration: true },
    });

    return result._sum.duration || 0;
  }

  static async getActiveTimer(userId: string) {
    const timer = await prisma.timeEntry.findFirst({
      where: { userId, endTime: null },
      include: {
        task: {
          select: { id: true, title: true },
        },
      },
    });

    return timer;
  }
}
