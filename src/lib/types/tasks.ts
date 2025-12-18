// ============================================
// TASK MANAGEMENT TYPES - ANY.DO CLONE
// ============================================

// Enums matching Prisma schema
export enum TaskPriority {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ListShareRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN'
}

export enum BoardView {
  KANBAN = 'KANBAN',
  LIST = 'LIST',
  CALENDAR = 'CALENDAR',
  TABLE = 'TABLE',
  GANTT = 'GANTT'
}

export enum BoardRole {
  VIEWER = 'VIEWER',
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export enum ReminderType {
  TIME = 'TIME',
  LOCATION = 'LOCATION'
}

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  DROPDOWN = 'DROPDOWN',
  MULTISELECT = 'MULTISELECT',
  CHECKBOX = 'CHECKBOX',
  URL = 'URL',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE'
}

// ============================================
// TASK TYPES
// ============================================

export interface Tag {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag?: Tag;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  userId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export interface TaskReminder {
  id: string;
  taskId: string;
  userId: string;
  type: ReminderType;
  remindAt?: Date | null;
  location?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  isTriggered: boolean;
  triggeredAt?: Date | null;
  createdAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  replies?: TaskComment[];
  user?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  };
}

export interface TaskCustomFieldValue {
  id: string;
  taskId: string;
  customFieldId: string;
  value?: string | null;
  customField?: CustomField;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  };
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string | null;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  isBillable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskChecklist {
  id: string;
  taskId: string;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  items?: ChecklistItem[];
}

export interface Task {
  id: string;
  organizationId: string;
  createdById: string;
  assignedToId?: string | null;
  listId?: string | null;
  boardId?: string | null;
  boardColumnId?: string | null;
  parentTaskId?: string | null;
  
  title: string;
  description?: string | null;
  notes?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  
  dueDate?: Date | null;
  dueTime?: Date | null;
  startDate?: Date | null;
  completedAt?: Date | null;
  
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  
  isRecurring: boolean;
  recurrenceRule?: string | null;
  
  position: number;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  
  // Relations
  createdBy?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  };
  assignedTo?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  } | null;
  list?: TaskList | null;
  board?: Board | null;
  boardColumn?: BoardColumn | null;
  parentTask?: Task | null;
  subTasks?: Task[];
  tags?: TaskTag[];
  attachments?: TaskAttachment[];
  comments?: TaskComment[];
  reminders?: TaskReminder[];
  customFields?: TaskCustomFieldValue[];
  activities?: TaskActivity[];
  timeEntries?: TimeEntry[];
  checklists?: TaskChecklist[];
}

// ============================================
// TASK LIST TYPES
// ============================================

export interface TaskListShare {
  id: string;
  listId: string;
  userId: string;
  role: ListShareRole;
  createdAt: Date;
}

export interface TaskList {
  id: string;
  organizationId: string;
  createdById: string;
  
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  
  isDefault: boolean;
  isShared: boolean;
  isFavorite: boolean;
  
  position: number;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  
  // Relations
  createdBy?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  };
  tasks?: Task[];
  sharedWith?: TaskListShare[];
  _count?: {
    tasks: number;
  };
}

// ============================================
// BOARD TYPES
// ============================================

export interface BoardColumn {
  id: string;
  boardId: string;
  
  name: string;
  color?: string | null;
  position: number;
  wipLimit?: number | null;
  
  isCollapsed: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export interface BoardAutomation {
  id: string;
  boardId: string;
  
  name: string;
  trigger: Record<string, unknown>;
  action: Record<string, unknown>;
  
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  organizationId: string;
  createdById: string;
  
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  
  isPrivate: boolean;
  isTemplate: boolean;
  
  defaultView: BoardView;
  
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  
  // Relations
  createdBy?: {
    id: string;
    fullName: string;
    avatar?: string | null;
  };
  columns?: BoardColumn[];
  tasks?: Task[];
  members?: BoardMember[];
  automations?: BoardAutomation[];
  _count?: {
    tasks: number;
    columns: number;
    members: number;
  };
}

// ============================================
// CUSTOM FIELD TYPES
// ============================================

export interface CustomField {
  id: string;
  organizationId: string;
  
  name: string;
  type: CustomFieldType;
  options?: Record<string, unknown> | null;
  isRequired: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TEMPLATE TYPES
// ============================================

export interface TaskTemplate {
  id: string;
  organizationId: string;
  createdById: string;
  
  name: string;
  description?: string | null;
  category?: string | null;
  icon?: string | null;
  
  isPublic: boolean;
  usageCount: number;
  
  templateData: Record<string, unknown>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  notes?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  dueTime?: string;
  startDate?: string;
  estimatedMinutes?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  listId?: string;
  boardId?: string;
  boardColumnId?: string;
  parentTaskId?: string;
  assignedToId?: string;
  tagIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  position?: number;
  completedAt?: string;
}

export interface CreateTaskListInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface UpdateTaskListInput extends Partial<CreateTaskListInput> {
  isFavorite?: boolean;
  position?: number;
}

export interface CreateBoardInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPrivate?: boolean;
  defaultView?: BoardView;
}

export interface UpdateBoardInput extends Partial<CreateBoardInput> {
  isTemplate?: boolean;
}

export interface CreateBoardColumnInput {
  name: string;
  color?: string;
  position?: number;
  wipLimit?: number;
}

export interface UpdateBoardColumnInput extends Partial<CreateBoardColumnInput> {
  isCollapsed?: boolean;
}

export interface CreateTagInput {
  name: string;
  color: string;
}

export interface UpdateTagInput extends Partial<CreateTagInput> {}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

export interface CreateReminderInput {
  type: ReminderType;
  remindAt?: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
}

export interface CreateTimeEntryInput {
  taskId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isBillable?: boolean;
}

export interface CreateChecklistInput {
  name: string;
}

export interface CreateChecklistItemInput {
  title: string;
}

export interface TasksQuery {
  listId?: string;
  boardId?: string;
  boardColumnId?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  assignedToId?: string;
  dueDate?: string;
  dueBefore?: string;
  dueAfter?: string;
  search?: string;
  includeSubtasks?: boolean;
  includeCompleted?: boolean;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'position' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkTaskOperation {
  operation: 'complete' | 'delete' | 'move' | 'assign' | 'setPriority' | 'setStatus';
  taskIds: string[];
  data?: {
    listId?: string;
    boardId?: string;
    boardColumnId?: string;
    assignedToId?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
  };
}

// ============================================
// CALENDAR / PLANNER TYPES
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  color?: string;
  task: Task;
}

export interface DailyPlannerItem {
  timeSlot: string; // e.g., "09:00"
  tasks: Task[];
}

export interface DailyPlannerResponse {
  date: string;
  overdue: Task[];
  scheduled: DailyPlannerItem[];
  unscheduled: Task[];
}

// ============================================
// WIDGET TYPES
// ============================================

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  completedThisWeek: number;
  completedThisMonth: number;
}

export interface WidgetData {
  upcoming: Task[];
  overdue: Task[];
  todaysTasks: Task[];
  stats: TaskStats;
}
