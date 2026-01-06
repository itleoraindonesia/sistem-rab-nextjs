# Arsitektur Form di Next.js (Singkat)

## 1. **Struktur Folder**

```
app/
├── rab/
│   ├── new/page.tsx          # Form buat baru
│   └── [id]/edit/page.tsx    # Form edit
components/
├── FormRAB.tsx               # Komponen form reusable
hooks/
├── useRABForm.tsx            # Logic form baru
└── useRABEdit.tsx            # Logic form edit
schemas/
└── rabSchema.ts              # Validasi Zod
```

## 2. **Flow Create Form**

```
Page Component (new/page.tsx)
    ↓
Custom Hook (useRABForm)
    ↓ manages
- React Hook Form (register, control, handleSubmit)
- Form State & Validation
- Submit Logic → POST ke database
    ↓
Shared Form Component (FormRAB.tsx)
    ↓ renders
Form UI dengan fields
```

## 3. **Flow Edit Form**

```
Page Component ([id]/edit/page.tsx)
    ↓
Custom Hook (useRABEdit)
    ↓ manages
1. Load data dari DB (useEffect + fetch/supabase)
2. Populate form dengan reset(data)
3. React Hook Form (sama seperti create)
4. Submit Logic → UPDATE ke database
    ↓
Shared Form Component (FormRAB.tsx)
    ↓ renders
Form UI yang sama (reusable)
```

## 4. **Key Principles**

**Separation of Concerns:**

- **Page**: Routing & orchestration
- **Hook**: Business logic & state management
- **Component**: UI presentation (reusable)

**Data Flow:**

```
CREATE: User Input → Validation → POST → Redirect
EDIT:   DB → Load → Populate → User Edit → Validation → UPDATE → Redirect
```

**Shared Logic:**

- Gunakan **1 komponen form** untuk create & edit
- Beda di **hook** (useRABForm vs useRABEdit)
- Hook menentukan: initial values, submit action, title

## 5. **Best Practices**

✅ **DO:**

- Satu source of truth (React Hook Form state)
- `reset()` untuk populate form edit
- Custom hooks untuk isolasi logic
- Zod schema untuk validasi

❌ **DON'T:**

- Manual `setValue()` di `useEffect` untuk semua fields (gunakan `reset()`)
- Duplikasi form component untuk create/edit
- Logic bisnis di page component

**Simple Mental Model:**

- **Create** = Empty form → Fill → Save
- **Edit** = Load → Prefill form → Change → Update
