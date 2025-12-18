/**
 * SaaS Starter Kit - Custom React Hooks
 * Essential hooks for building SaaS applications
 */

// UI Hooks
export { useIsMobile } from './use-mobile';
export { useToast, toast } from './use-toast';
export { useTheme } from './use-theme';
export { usePalette } from './use-palette';
export { useSuccessDialog } from './use-success-dialog';

// i18n Hooks
export { useLocale } from './use-locale';

// Utility Hooks
export { useExport } from './use-export';

// Helper Hooks
export {
  useAsync,
  useDebounce,
  useLocalStorage,
  useSessionStorage,
  useClipboard,
  useToggle,
  usePrevious,
  useForm,
} from './use-helpers';

// Task Management Hooks
export * from './tasks';
