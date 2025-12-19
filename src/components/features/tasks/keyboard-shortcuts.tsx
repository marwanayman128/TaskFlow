'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Keyboard shortcut definitions
export interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  category: 'navigation' | 'tasks' | 'general' | 'views';
  action: () => void;
}

// Context for keyboard shortcuts
interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string, modifiers?: string[]) => void;
  setEnabled: (enabled: boolean) => void;
  showHelp: () => void;
}

const KeyboardShortcutsContext = React.createContext<KeyboardShortcutsContextType | null>(null);

export function useKeyboardShortcuts() {
  const context = React.useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }
  return context;
}

// Provider component
interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
  onNewTask?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
}

export function KeyboardShortcutsProvider({
  children,
  onNewTask,
  onSearch,
  onToggleSidebar,
}: KeyboardShortcutsProviderProps) {
  const router = useRouter();
  const [shortcuts, setShortcuts] = React.useState<KeyboardShortcut[]>([]);
  const [enabled, setEnabled] = React.useState(true);
  const [showHelpDialog, setShowHelpDialog] = React.useState(false);

  // Register default shortcuts
  React.useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      // General
      {
        key: '?',
        modifiers: ['shift'],
        description: 'Show keyboard shortcuts',
        category: 'general',
        action: () => setShowHelpDialog(true),
      },
      {
        key: 'k',
        modifiers: ['ctrl'],
        description: 'Quick search',
        category: 'general',
        action: () => onSearch?.(),
      },
      {
        key: 'n',
        modifiers: ['ctrl'],
        description: 'Create new task',
        category: 'tasks',
        action: () => onNewTask?.(),
      },
      {
        key: '\\',
        modifiers: ['ctrl'],
        description: 'Toggle sidebar',
        category: 'general',
        action: () => onToggleSidebar?.(),
      },
      // Navigation
      {
        key: 'g',
        description: 'Go to My Day (press g then m)',
        category: 'navigation',
        action: () => {}, // Handled by sequence
      },
      {
        key: '1',
        modifiers: ['ctrl'],
        description: 'Go to My Day',
        category: 'navigation',
        action: () => router.push('/dashboard/myday'),
      },
      {
        key: '2',
        modifiers: ['ctrl'],
        description: 'Go to All Tasks',
        category: 'navigation',
        action: () => router.push('/dashboard/tasks/all'),
      },
      {
        key: '3',
        modifiers: ['ctrl'],
        description: 'Go to Calendar',
        category: 'navigation',
        action: () => router.push('/dashboard/calendar'),
      },
      {
        key: '4',
        modifiers: ['ctrl'],
        description: 'Go to Boards',
        category: 'navigation',
        action: () => router.push('/dashboard/boards'),
      },
      // Views
      {
        key: 'v',
        modifiers: ['shift'],
        description: 'Cycle view mode',
        category: 'views',
        action: () => {}, // Context-dependent
      },
    ];

    setShortcuts(defaultShortcuts);
  }, [router, onSearch, onNewTask, onToggleSidebar]);

  // Handle keyboard events
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape to blur inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.modifiers?.includes('ctrl') || e.ctrlKey || e.metaKey;
        const altMatch = !shortcut.modifiers?.includes('alt') || e.altKey;
        const shiftMatch = !shortcut.modifiers?.includes('shift') || e.shiftKey;

        // Check modifiers are ONLY present when required
        const noExtraCtrl = shortcut.modifiers?.includes('ctrl') || (!e.ctrlKey && !e.metaKey);
        const noExtraAlt = shortcut.modifiers?.includes('alt') || !e.altKey;
        const noExtraShift = shortcut.modifiers?.includes('shift') || !e.shiftKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch && noExtraCtrl && noExtraAlt && noExtraShift;
      });

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);

  const registerShortcut = React.useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => [...prev.filter((s) => s.key !== shortcut.key), shortcut]);
  }, []);

  const unregisterShortcut = React.useCallback((key: string) => {
    setShortcuts((prev) => prev.filter((s) => s.key !== key));
  }, []);

  const showHelp = React.useCallback(() => {
    setShowHelpDialog(true);
  }, []);

  return (
    <KeyboardShortcutsContext.Provider
      value={{ shortcuts, registerShortcut, unregisterShortcut, setEnabled, showHelp }}
    >
      {children}
      <KeyboardShortcutsDialog
        open={showHelpDialog}
        onOpenChange={setShowHelpDialog}
        shortcuts={shortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
}

// Help dialog component
interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: KeyboardShortcut[];
}

function KeyboardShortcutsDialog({ open, onOpenChange, shortcuts }: KeyboardShortcutsDialogProps) {
  const categories: { key: string; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'navigation', label: 'Navigation' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'views', label: 'Views' },
  ];

  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    categories.forEach((cat) => {
      groups[cat.key] = shortcuts.filter((s) => s.category === cat.key);
    });
    return groups;
  }, [shortcuts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryShortcuts = groupedShortcuts[category.key];
              if (!categoryShortcuts || categoryShortcuts.length === 0) return null;

              return (
                <div key={category.key}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {category.label}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <KeyboardShortcutDisplay
                          shortcut={shortcut.key}
                          modifiers={shortcut.modifiers}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Press <KeyboardShortcutDisplay shortcut="?" modifiers={['shift']} inline /> anytime to show this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Key display component
interface KeyboardShortcutDisplayProps {
  shortcut: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  inline?: boolean;
}

export function KeyboardShortcutDisplay({ shortcut, modifiers, inline }: KeyboardShortcutDisplayProps) {
  const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');

  const formatModifier = (mod: string) => {
    switch (mod) {
      case 'ctrl':
        return isMac ? '⌘' : 'Ctrl';
      case 'alt':
        return isMac ? '⌥' : 'Alt';
      case 'shift':
        return isMac ? '⇧' : 'Shift';
      case 'meta':
        return isMac ? '⌘' : 'Win';
      default:
        return mod;
    }
  };

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      ' ': 'Space',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'enter': '↵',
      'escape': 'Esc',
      'backspace': '⌫',
      'delete': 'Del',
      'tab': 'Tab',
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  };

  const keys = [...(modifiers || []).map(formatModifier), formatKey(shortcut)];

  if (inline) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border"
          >
            {key}
          </kbd>
        ))}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="min-w-[24px] px-2 py-1 text-xs font-mono bg-muted rounded border border-border text-center">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-muted-foreground">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// Hook for registering component-specific shortcuts
export function useShortcut(
  key: string,
  action: () => void,
  options?: {
    modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
    description?: string;
    category?: KeyboardShortcut['category'];
    enabled?: boolean;
  }
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const enabled = options?.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) return;

    registerShortcut({
      key,
      modifiers: options?.modifiers,
      description: options?.description || '',
      category: options?.category || 'general',
      action,
    });

    return () => {
      unregisterShortcut(key);
    };
  }, [key, action, enabled, options?.modifiers, options?.description, options?.category]);
}

export default KeyboardShortcutsProvider;
