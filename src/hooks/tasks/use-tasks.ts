'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Task,
  TaskList,
  Board,
  Tag,
  TasksQuery,
  TasksResponse,
  CreateTaskInput,
  UpdateTaskInput,
  CreateTaskListInput,
  UpdateTaskListInput,
  CreateBoardInput,
  UpdateBoardInput,
  CreateTagInput,
  TaskStats,
  BulkTaskOperation,
} from '@/lib/types/tasks';

// ============================================
// GENERIC FETCH HELPERS
// ============================================

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

// ============================================
// TASKS HOOKS
// ============================================

export function useTasks(initialQuery?: TasksQuery) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<TasksQuery>(initialQuery || {});
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });

  const fetchTasks = useCallback(async (q: TasksQuery = query) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(q).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const data = await fetchApi<TasksResponse>(`/api/v1/tasks?${params}`);
      setTasks(data.tasks);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<Task | null> => {
    try {
      const task = await fetchApi<Task>('/api/v1/tasks', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setTasks((prev) => [task, ...prev]);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput): Promise<Task | null> => {
    try {
      const task = await fetchApi<Task>(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await fetchApi(`/api/v1/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  }, []);

  const completeTask = useCallback(async (id: string): Promise<Task | null> => {
    try {
      const task = await fetchApi<Task>(`/api/v1/tasks/${id}/complete`, {
        method: 'POST',
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
      return null;
    }
  }, []);

  const updateQuery = useCallback((newQuery: Partial<TasksQuery>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    query,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    updateQuery,
    setQuery,
  };
}

export function useTask(taskId: string | null) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setTask(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Task>(`/api/v1/tasks/${taskId}`);
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const updateTask = useCallback(async (input: UpdateTaskInput): Promise<Task | null> => {
    if (!taskId) return null;

    try {
      const updatedTask = await fetchApi<Task>(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      setTask(updatedTask);
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  return {
    task,
    loading,
    error,
    fetchTask,
    updateTask,
    setTask,
  };
}

// ============================================
// LISTS HOOKS
// ============================================

export function useLists() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<TaskList[]>('/api/v1/lists');
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  }, []);

  const createList = useCallback(async (input: CreateTaskListInput): Promise<TaskList | null> => {
    try {
      const list = await fetchApi<TaskList>('/api/v1/lists', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setLists((prev) => [...prev, list]);
      return list;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create list');
      return null;
    }
  }, []);

  const updateList = useCallback(async (id: string, input: UpdateTaskListInput): Promise<TaskList | null> => {
    try {
      const list = await fetchApi<TaskList>(`/api/v1/lists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      setLists((prev) => prev.map((l) => (l.id === id ? list : l)));
      return list;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list');
      return null;
    }
  }, []);

  const deleteList = useCallback(async (id: string): Promise<boolean> => {
    try {
      await fetchApi(`/api/v1/lists/${id}`, { method: 'DELETE' });
      setLists((prev) => prev.filter((l) => l.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete list');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
  };
}

export function useList(listId: string | null) {
  const [list, setList] = useState<TaskList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    if (!listId) {
      setList(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<TaskList>(`/api/v1/lists/${listId}`);
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch list');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    list,
    loading,
    error,
    fetchList,
    setList,
  };
}

// ============================================
// BOARDS HOOKS
// ============================================

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Board[]>('/api/v1/boards');
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (input: CreateBoardInput): Promise<Board | null> => {
    try {
      const board = await fetchApi<Board>('/api/v1/boards', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setBoards((prev) => [board, ...prev]);
      return board;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
      return null;
    }
  }, []);

  const updateBoard = useCallback(async (id: string, input: UpdateBoardInput): Promise<Board | null> => {
    try {
      const board = await fetchApi<Board>(`/api/v1/boards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      });
      setBoards((prev) => prev.map((b) => (b.id === id ? board : b)));
      return board;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update board');
      return null;
    }
  }, []);

  const deleteBoard = useCallback(async (id: string): Promise<boolean> => {
    try {
      await fetchApi(`/api/v1/boards/${id}`, { method: 'DELETE' });
      setBoards((prev) => prev.filter((b) => b.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete board');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
  };
}

export function useBoard(boardId: string | null) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!boardId) {
      setBoard(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Board>(`/api/v1/boards/${boardId}`);
      setBoard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return {
    board,
    loading,
    error,
    fetchBoard,
    setBoard,
  };
}

// ============================================
// TAGS HOOKS
// ============================================

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Tag[]>('/api/v1/tags');
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = useCallback(async (input: CreateTagInput): Promise<Tag | null> => {
    try {
      const tag = await fetchApi<Tag>('/api/v1/tags', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setTags((prev) => [...prev, tag]);
      return tag;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
      return null;
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
  };
}

// ============================================
// TASK STATS HOOKS
// ============================================

export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<TaskStats>('/api/v1/tasks/stats');
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
}

// ============================================
// TODAY / UPCOMING HOOKS
// ============================================

export function useTodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Task[]>('/api/v1/tasks/today');
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
  };
}

export function useUpcomingTasks(days: number = 7) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Task[]>(`/api/v1/tasks/upcoming?days=${days}`);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
  };
}

export function useOverdueTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApi<Task[]>('/api/v1/tasks/overdue');
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
  };
}

// ============================================
// BULK OPERATIONS HOOK
// ============================================

export function useBulkOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeBulkOperation = useCallback(async (operation: BulkTaskOperation): Promise<number> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchApi<{ count: number }>('/api/v1/tasks/bulk', {
        method: 'POST',
        body: JSON.stringify(operation),
      });
      return result.count;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk operation failed');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    executeBulkOperation,
  };
}
