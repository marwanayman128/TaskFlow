
export interface SidebarLinkEntry {
  type: "link";
  title: string;
  href: string;
  icon?: string;
  children?: SidebarLinkEntry[];
  roles?: string[];
  bulletTone?: string;
  // Specific properties for settings menu usage
  key?: string;
  label?: string;
  badge?: string; // Added for badge support
}

export interface SidebarGroupEntry {
  type: "group";
  title: string;
  isCollapsible?: boolean;
  hasAddButton?: boolean;
  isPremium?: boolean;
}

export type SidebarEntry = SidebarLinkEntry | SidebarGroupEntry;

// Dynamic item types used in sidebar
export interface DynamicListItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface DynamicTagItem {
  id: string;
  name: string;
  color: string;
}

export interface DynamicBoardItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface NavigationConfig {
  items: SidebarEntry[];
}

/**
 * Navigation configuration for the sidebar
 * Icons use Iconify format (browse at https://icon-sets.iconify.design/)
 * Translations are in messages/en.json and messages/ar.json under "navigation"
 */
export const navigationItems: SidebarEntry[] = [
  // ===================================
  // CORE VIEWS (Any.do Smart Views)
  // ===================================
  {
    type: "link",
    title: "navigation.items.myday.title",
    href: "/dashboard/myday",
    icon: "solar:sun-2-outline",
  },
  {
    type: "link",
    title: "navigation.items.next7days.title",
    href: "/dashboard/tasks/next-seven-days",
    icon: "solar:calendar-date-outline",
  },
  {
    type: "link",
    title: "navigation.items.allTasks.title",
    href: "/dashboard/tasks/all",
    icon: "solar:checklist-minimalistic-outline",
  },
  {
    type: "link",
    title: "navigation.items.calendar.title",
    href: "/dashboard/calendar",
    icon: "solar:calendar-outline",
  },
  {
    type: "link",
    title: "navigation.items.analytics.title",
    href: "/dashboard/analytics",
    icon: "solar:chart-2-outline",
  },
  {
    type: "link",
    title: "navigation.items.gantt.title",
    href: "/dashboard/gantt",
    icon: "solar:align-left-outline",
    badge: "Pro",
  },

  // ===================================
  // MY LISTS (User-created Task Lists)
  // ===================================
  { 
    type: "group", 
    title: "navigation.groups.myLists",
    isCollapsible: true,
    hasAddButton: true,
    isPremium: false,
  },
  // Dynamic lists are injected in the sidebar component but header is defined here if needed

  // ===================================
  // TAGS (Color-coded Labels)
  // ===================================
  { 
    type: "group", 
    title: "navigation.groups.tags",
    isCollapsible: true,
    hasAddButton: true,
    isPremium: false,
  },

  // ===================================
  // BOARDS (Kanban)
  // ===================================
  { 
    type: "group", 
    title: "navigation.groups.boards",
    isCollapsible: true,
    hasAddButton: true,
  },

  // ===================================
  // SETTINGS & ADMIN
  // ===================================
  { type: "group", title: "navigation.groups.system" },
  {
    type: "link",
    title: "navigation.items.settings.title",
    href: "/dashboard/settings",
    icon: "solar:settings-outline",
    children: [
      { title: "navigation.items.settings.profile", href: "/dashboard/settings/profile", bulletTone: "primary", type: "link" } as SidebarLinkEntry,
      { title: "navigation.items.settings.preferences", href: "/dashboard/settings/preferences", bulletTone: "info", type: "link" } as SidebarLinkEntry,
      { title: "navigation.items.settings.integrations", href: "/dashboard/settings/integrations", bulletTone: "success", type: "link" } as SidebarLinkEntry,
      { title: "navigation.items.settings.import", href: "/dashboard/settings/import", bulletTone: "warning", type: "link" } as SidebarLinkEntry,
    ],
  },
  {
    type: "link",
    title: "navigation.items.users.title",
    href: "/dashboard/users",
    icon: "solar:users-group-rounded-outline",
    roles: ["admin", "superadmin"],
  },
];

export const settingsMenuStructure = {
  account: [
    { key: "profile", label: "Profile", href: "/dashboard/settings/profile" },
  ],
  preferences: [
    { key: "preferences", label: "Preferences", href: "/dashboard/settings/preferences" },
    { key: "integrations", label: "Integrations", href: "/dashboard/settings/integrations" },
    { key: "import", label: "Import", href: "/dashboard/settings/import" },
  ]
};
