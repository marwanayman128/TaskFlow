import { createNavigation } from 'next-intl/navigation';
import { locales } from './index';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales });
