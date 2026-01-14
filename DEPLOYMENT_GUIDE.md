# Deployment Guide - Role-Based Access Control

## Overview
The application now uses **role-based access control** to show different menu items based on user roles. This allows you to deploy the same codebase to production while controlling what clients see.

## User Accounts & Access Levels

### 🔑 Available Accounts

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `leora123` | admin | **Full Access** - All menu items |
| `user1` | `user123` | user | **Full Access** - All menu items |
| `user2` | `user456` | user | **Full Access** - All menu items |
| `guest` | `guest123` | guest | **Limited Access** - Published features only |

### 📋 Menu Visibility by Role

#### Guest Users See:
- ✅ Dashboard
- ✅ Dokumen RAB
- ✅ CRM (Input Data & Daftar Client)

#### Admin/Regular Users See:
- ✅ Dashboard
- ✅ Dokumen RAB
- ✅ CRM (Input Data & Daftar Client)
- ✅ Dokumen (Surat Keluar, Internal Memo, MoM Meeting)
- ✅ Dokumen Perlu Tindakan (Review & Approval)
- ✅ Master Data (Data Panel & Data Ongkir)

## Deployment Strategy

### Option 1: Deploy Beta Branch (Recommended)
Since role-based access is now implemented, you can simply deploy the beta branch:

```bash
# Deploy beta branch to production
git checkout beta
git push origin beta

# Or if you want to deploy to main
git checkout main
git merge beta
git push origin main
```

### Option 2: Keep Separate Branches
If you prefer to keep beta for development:
- **Beta branch**: Internal development with admin/user accounts
- **Main branch**: Production with guest account for clients

## For Clients

Share these credentials with clients to give them access to published features only:

```
URL: [Your production URL]
Username: guest
Password: guest123
```

They will only see:
- Dashboard
- Dokumen RAB
- CRM features

## For Internal Team

Use admin or regular user accounts to access all features:

```
Username: admin
Password: leora123
```

## Adding New Menu Items

When adding new menu items to `src/components/layout/AppSidebar.tsx`, specify which roles can see them:

```tsx
{
  name: "New Feature",
  path: "/new-feature",
  icon: SomeIcon,
  children: [],
  allowedRoles: ["admin", "user"], // Hidden from guest
}
```

To make a feature visible to guests, add `"guest"` to the `allowedRoles` array:

```tsx
allowedRoles: ["admin", "user", "guest"], // Visible to everyone
```

## Security Notes

⚠️ **Important**: The current authentication is cookie-based and uses hardcoded credentials. For production:

1. Consider implementing proper backend authentication
2. Store user credentials securely (database with hashed passwords)
3. Use environment variables for sensitive data
4. Implement proper session management
5. Add HTTPS in production

## Customizing Guest Password

To change the guest password, edit `src/context/AuthContext.tsx`:

```tsx
const DEFAULT_USERS = [
  // ... other users
  { username: "guest", password: "your-new-password", role: "guest" as const },
];
```

## Questions?

If you need to:
- Add more user roles
- Change menu visibility
- Add new users

Edit the following files:
- User accounts: `src/context/AuthContext.tsx`
- Menu items & permissions: `src/components/layout/AppSidebar.tsx`
