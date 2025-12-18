# Translation Structure

This project uses `next-intl` for internationalization with a modular JSON file structure.

## Folder Structure

```
messages/
├── en/                          # English translations
│   ├── common.json             # Common/shared translations
│   ├── errors.json             # Error messages
│   ├── auth/
│   │   ├── login.json          # Login page translations
│   │   └── register.json       # Register page translations
│   ├── layout/
│   │   ├── header.json         # Header component translations
│   │   ├── sidebar.json        # Sidebar component translations
│   │   ├── navigation.json     # Navigation items translations
│   │   └── notifications.json  # Notifications translations
│   ├── pages/
│   │   ├── dashboard.json      # Dashboard page translations
│   │   ├── users.json          # Users page translations
│   │   ├── settings.json       # Settings page translations
│   │   └── profile.json        # Profile page translations
│   └── components/
│       ├── table.json          # Table component translations
│       ├── dialog.json         # Dialog/modal translations
│       └── form.json           # Form component translations
│
└── ar/                          # Arabic translations (same structure)
    ├── common.json
    ├── errors.json
    ├── auth/
    │   ├── login.json
    │   └── register.json
    ├── layout/
    │   ├── header.json
    │   ├── sidebar.json
    │   ├── navigation.json
    │   └── notifications.json
    ├── pages/
    │   ├── dashboard.json
    │   ├── users.json
    │   ├── settings.json
    │   └── profile.json
    └── components/
        ├── table.json
        ├── dialog.json
        └── form.json
```

## Usage in Components

### Using Translations

```tsx
import { useTranslations } from 'next-intl';

// For a specific namespace
const t = useTranslations('sidebar');
t('footer.title'); // Returns sidebar.footer.title value

// For nested namespaces
const tItems = useTranslations('sidebar.items');
tItems('dashboard.title'); // Returns sidebar.items.dashboard.title value

// For navigation items
const tNav = useTranslations('navigation');
tNav('items.dashboard.title'); // Returns navigation.items.dashboard.title value
```

### Translation Namespaces

| Namespace | File | Description |
|-----------|------|-------------|
| `common` | common.json | Shared/common translations |
| `errors` | errors.json | Error messages |
| `login` | auth/login.json | Login page |
| `register` | auth/register.json | Registration page |
| `header` | layout/header.json | Header component |
| `sidebar` | layout/sidebar.json | Sidebar component |
| `navigation` | layout/navigation.json | Navigation items |
| `notifications` | layout/notifications.json | Notifications |
| `dashboard` | pages/dashboard.json | Dashboard page |
| `users` | pages/users.json | Users management |
| `settings` | pages/settings.json | Settings page |
| `profile` | pages/profile.json | Profile page |
| `table` | components/table.json | Table component |
| `dialog` | components/dialog.json | Dialogs/modals |
| `form` | components/form.json | Form components |

## Adding New Translations

### 1. Add a new JSON file

Create the file in both `messages/en/` and `messages/ar/` directories.

Example: `messages/en/pages/orders.json`
```json
{
  "title": "Orders",
  "addOrder": "Add Order",
  "fields": {
    "orderId": "Order ID",
    "customer": "Customer"
  }
}
```

### 2. Update i18n.ts

Add the import for the new file in `src/i18n.ts`:

```typescript
try {
  const orders = await import(`../messages/${locale}/pages/orders.json`);
  messages.orders = orders.default;
} catch (e) {
  console.warn(`Missing pages/orders.json for locale "${locale}"`);
}
```

### 3. Use in Components

```tsx
const tOrders = useTranslations('orders');
// or
const t = useTranslations();
t('orders.title');
```

## Navigation Items

Navigation items in `src/data/navigation.ts` use the `navigation` namespace:

```typescript
{
  type: "link",
  title: "navigation.items.dashboard.title",
  href: "/dashboard",
  icon: "solar:home-smile-angle-outline",
}
```

Make sure to add corresponding translations in:
- `messages/en/layout/navigation.json`
- `messages/ar/layout/navigation.json`

## Best Practices

1. **Organize by Feature**: Keep related translations together
2. **Use Consistent Keys**: Follow the naming pattern `entity.action` or `component.element`
3. **Add Both Languages**: Always add translations to both `en` and `ar`
4. **Use Nested Objects**: Group related translations with nested objects
5. **Use Placeholders**: For dynamic content, use `{variable}` syntax:
   ```json
   {
     "welcome": "Welcome, {name}!"
   }
   ```
   ```tsx
   t('welcome', { name: 'John' })
   ```
