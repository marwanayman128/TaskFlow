import * as React from 'react';
import useSWR from 'swr';

// Base fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return res.json();
};

// ============================================
// LISTS HOOKS
// ============================================

export interface TaskList {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  isDefault: boolean;
  position: number;
  taskCount?: number;
  isShared?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useLists() {
  const { data, error, isLoading, mutate } = useSWR<TaskList[]>(
    '/api/v1/lists',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    lists: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useList(id: string) {
  const { data, error, isLoading, mutate } = useSWR<TaskList>(
    id ? `/api/v1/lists/${id}` : null,
    fetcher
  );

  return {
    list: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreateList() {
  const [isCreating, setIsCreating] = React.useState(false);

  const createList = async (data: { name: string; icon?: string; color?: string }) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create list');
      return res.json();
    } finally {
      setIsCreating(false);
    }
  };

  return { createList, isCreating };
}

export function useUpdateList(id: string) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const updateList = async (data: Partial<TaskList>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update list');
      return res.json();
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateList, isUpdating };
}

export function useDeleteList(id: string) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const deleteList = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/lists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete list');
      return res.json();
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteList, isDeleting };
}

// Global mutations (by ID arg)
export function useUpdateListMutation() {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const updateList = async (id: string, data: Partial<TaskList>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/lists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update list');
      return res.json();
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateList, isUpdating };
}

export function useDeleteListMutation() {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const deleteList = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/lists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete list');
      return res.json();
    } finally {
      setIsDeleting(false);
    }
  };
  return { deleteList, isDeleting };
}


// ============================================
// TAGS HOOKS
// ============================================

export interface Tag {
  id: string;
  name: string;
  color: string;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<Tag[]>(
    '/api/v1/tags',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    tags: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTag(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Tag>(
    id ? `/api/v1/tags/${id}` : null,
    fetcher
  );

  return {
    tag: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreateTag() {
  const [isCreating, setIsCreating] = React.useState(false);

  const createTag = async (data: { name: string; color: string }) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create tag');
      return res.json();
    } finally {
      setIsCreating(false);
    }
  };

  return { createTag, isCreating };
}

export function useUpdateTagMutation() {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const updateTag = async (id: string, data: { name: string; color: string }) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update tag');
      return res.json();
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateTag, isUpdating };
}

export function useDeleteTagMutation() {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const deleteTag = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/tags/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete tag');
      return res.json();
    } finally {
      setIsDeleting(false);
    }
  };
  return { deleteTag, isDeleting };
}

// ============================================
// BOARDS HOOKS
// ============================================

export interface Board {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  defaultView: 'KANBAN' | 'LIST' | 'CALENDAR' | 'TABLE' | 'TIMELINE';
  taskCount?: number;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export function useBoards() {
  const { data, error, isLoading, mutate } = useSWR<Board[]>(
    '/api/v1/boards',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    boards: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBoard(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Board>(
    id ? `/api/v1/boards/${id}` : null,
    fetcher
  );

  return {
    board: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreateBoard() {
  const [isCreating, setIsCreating] = React.useState(false);

  const createBoard = async (data: { name: string; description?: string; color?: string; defaultView?: string }) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create board');
      return res.json();
    } finally {
      setIsCreating(false);
    }
  };

  return { createBoard, isCreating };
}

export function useUpdateBoardMutation() {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const updateBoard = async (id: string, data: Partial<Board>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/boards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update board');
      return res.json();
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateBoard, isUpdating };
}

export function useDeleteBoardMutation() {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const deleteBoard = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/boards/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete board');
      return res.json();
    } finally {
      setIsDeleting(false);
    }
  };
  return { deleteBoard, isDeleting };
}

// ============================================
// TASKS HOOKS
// ============================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  dueDate?: string;
  dueTime?: string;
  listId?: string;
  listName?: string;
  listColor?: string;
  boardId?: string;
  parentTaskId?: string;
  archived?: boolean;
  isMyDay?: boolean;
  position: number;
  tags: { id: string; name: string; color: string }[];
  subtasks?: { id: string; title: string; completed: boolean }[];
  subTasks?: Task[];
  parentTask?: Task;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export function useTasks(params?: {
  listId?: string;
  boardId?: string;
  tagId?: string;
  status?: 'all' | 'active' | 'completed';
  priority?: string;
  search?: string;
  dueDate?: string; // Add dueDate param
}) {
  const searchParams = new URLSearchParams();
  if (params?.listId) searchParams.set('listId', params.listId);
  if (params?.boardId) searchParams.set('boardId', params.boardId);
  if (params?.tagId) searchParams.set('tagId', params.tagId);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.dueDate) searchParams.set('dueDate', params.dueDate); // Add to query

  const queryString = searchParams.toString();
  const url = `/api/v1/tasks${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<Task[] | { items: Task[]; tasks: Task[] }>(
    url,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Handle both array (legacy) and paginated response (object with items/tasks)
  const tasksList = Array.isArray(data) 
    ? data 
    : (data as any)?.items || (data as any)?.tasks || [];

  return {
    tasks: tasksList,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTasksByTag(tagId: string) {
  return useTasks({ tagId }); 
}

export function useTodayTasks() {
  // ISO date string for today (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  return useTasks({ dueDate: today });
}

export function useTask(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Task>(
    id ? `/api/v1/tasks/${id}` : null,
    fetcher
  );

  return {
    task: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useCreateTask() {
  const [isCreating, setIsCreating] = React.useState(false);

  const createTask = async (data: Partial<Task>) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    } finally {
      setIsCreating(false);
    }
  };

  return { createTask, isCreating };
}

export function useUpdateTask(id: string) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const updateTask = async (data: Partial<Task>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTask, isUpdating };
}

export function useToggleTask(id: string) {
  const [isToggling, setIsToggling] = React.useState(false);

  const toggleTask = async () => {
    setIsToggling(true);
    try {
      const res = await fetch(`/api/v1/tasks/${id}/complete`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle task');
      return res.json();
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleTask, isToggling };
}

export function useDeleteTask(id: string) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const deleteTask = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteTask, isDeleting };
}

export function useUpdateTaskMutation() {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const updateTask = async ({ id, payload }: { id: string; payload: Partial<Task> }) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateTask, isUpdating };
}

export function useDeleteTaskMutation() {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const deleteTask = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      return res.json();
    } finally {
      setIsDeleting(false);
    }
  };
  return { deleteTask, isDeleting };
}
