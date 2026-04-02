# QUICK REFERENCE - Sebooth Click-to-Edit Layout Editor

## 🎯 For Admin Users

### How to Use
1. **Enter Edit Mode**: Click "✏️ Edit Page" (bottom-right button)
2. **Open Layout Editor**: Click "🎨 Layout" button
3. **Edit Text**: Click any text in the preview → TextEditModal opens
4. **Control Zoom**: 
   - Buttons: Click 25%, 50%, 75%, 100%, 150%, 200%
   - Manual: Type value 10-300%
   - Keyboard: `Ctrl++` (zoom in), `Ctrl+-` (zoom out), `Ctrl+0` (reset)
5. **Toggle Sections**: Click eye icon in "Sections" tab
6. **Save & Exit**: Click "✓ Done Editing Layout", then "✅ Done Editing"

### What You Can Do
- ✅ Edit any text on the homepage
- ✅ See changes in real-time preview
- ✅ Zoom to any scale (10-300%)
- ✅ Hide/show entire sections
- ✅ Upload gallery images (coming soon)
- ✅ Changes auto-save to database

---

## 🔧 For Developers

### Add Text Editing to New Section

```tsx
import { EditableText } from "@/components/admin/EditableText";
import { useSiteContent } from "@/lib/useSiteContent";

export function MySection() {
  const { content } = useSiteContent();
  
  return (
    <EditableText
      section="my_section"
      fieldKey="title"
      defaultValue={content?.title}
      as="h2"
      className="text-3xl font-bold"
    >
      {content?.title || "Default Title"}
    </EditableText>
  );
}
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `AdminEditProvider.tsx` | Context, auth, save functions |
| `EditModeToggle.tsx` | Floating button |
| `LayoutEditorModal.tsx` | Main editor (380+ lines) |
| `TextEditModal.tsx` | Text editing dialog |
| `IframeEditBridge.tsx` | Click-to-edit in preview |
| `EditableText.tsx` | Inline text wrapper |

### Import Patterns

```typescript
// Get admin context
import { useAdminEdit } from "@/components/admin/AdminEditProvider";
const { editMode, saveField, isAdmin } = useAdminEdit();

// Use editable wrapper
import { EditableText } from "@/components/admin/EditableText";

// Get site content
import { useSiteContent } from "@/lib/useSiteContent";
const { content, loading } = useSiteContent();
```

---

## 🗄️ Database

### Table: site_content

Fields:
- `section` - Feature area (hero, about, pricing, etc.)
- `key` - Field name (title, subtitle, description, etc.)
- `value` - Content text
- `updated_at` - Last modified timestamp

**Usage in code**:
```typescript
await saveField("hero", "title", "New Title");
// → INSERT/UPDATE site_content WHERE section='hero' AND key='title'
```

---

## ⚙️ Configuration

### .env.local Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_ADMIN_EMAILS=admin@sebooth.com,editor@sebooth.com
```

### Admin Access Requires BOTH
1. Email in `NEXT_PUBLIC_ADMIN_EMAILS` env var
2. OR email in `admins` table with `is_super=true`

---

## 🎨 Component Props

### EditableText

```typescript
<EditableText
  section="string"              // Required: database section
  fieldKey="string"             // Required: database key
  defaultValue="string"         // Required: fallback value
  as="h1|h2|h3|p|span|div"      // Optional: HTML tag
  className="string"            // Optional: Tailwind classes
  style={{ ... }}               // Optional: inline CSS
  children="React.ReactNode"    // Optional: content
>
  Display Content
</EditableText>
```

### LayoutEditorModal

```typescript
<LayoutEditorModal
  isOpen={boolean}              // Required: show/hide
  onClose={() => void}          // Required: close handler
/>
```

### TextEditModal

```typescript
<TextEditModal
  isOpen={boolean}              // Required
  currentText="string"          // Required: text to edit
  label="string"                // Required: field label
  onSave={(text) => void}       // Required: save handler
  onClose={() => void}          // Required: close handler
/>
```

---

## 🚨 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl` + `+` | Zoom in (layout editor only) |
| `Ctrl` + `-` | Zoom out (layout editor only) |
| `Ctrl` + `0` | Reset zoom to 100% |
| `ESC` | Close modal |
| `Enter` | Submit (in textarea) |

---

## 📊 Building & Running

```bash
# Development
npm run dev
# → http://localhost:3000

# Production build
npm run build
# → Compiled successfully

# Run production
npm run start
# → http://localhost:3000

# Check for errors
npm run lint
```

---

## 🔍 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Text not editable | Ensure text is 0-500 chars. Check console for errors. |
| Changes not saving | Verify Supabase env vars. Check "✓ Saved!" toast. |
| Zoom shortcuts don't work | Browser may intercept. Use manual input or buttons. |
| Admin button doesn't appear | Check env var `NEXT_PUBLIC_ADMIN_EMAILS`. |
| Preview not updating | Wait 1-2 seconds for iframe refresh. |

---

## 📁 File Structure

```
src/
├── app/
│   ├── layout.tsx               ← Wraps with ClientProviders
│   ├── page.tsx                 ← Homepage
│   └── globals.css              ← Edit mode styles
├── components/
│   ├── admin/
│   │   ├── AdminEditProvider.tsx
│   │   ├── EditModeToggle.tsx
│   │   ├── LayoutEditorModal.tsx ← Main editor
│   │   ├── TextEditModal.tsx
│   │   ├── IframeEditBridge.tsx
│   │   ├── EditableText.tsx
│   │   ├── SectionVisibilityControl.tsx
│   │   └── ClientProviders.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LayoutShell.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── Product.tsx
│       └── ... (all editable)
└── lib/
    ├── supabase.ts
    ├── useSiteContent.ts
    └── utils.ts
```

---

## 🎯 Feature Overview

### ✅ Implemented Features

| Feature | Status | Usage |
|---------|--------|-------|
| Click-to-edit text | ✅ Click any text in preview |
| Text preview modal | ✅ Edit with character count |
| Auto-save to Supabase | ✅ Changes persist |
| Zoom 10-300% | ✅ Presets, manual, keyboard |
| Section visibility | ✅ Click eye icon to toggle |
| Split-panel editor | ✅ Controls + preview |
| Gallery media | ✅ Upload/delete/reorder |
| Keyboard shortcuts | ✅ Ctrl+±, Ctrl+0 |
| localStorage persistence | ✅ Zoom level saved |
| MutationObserver | ✅ Dynamic content editable |

### 🚀 Coming Soon

| Feature | Timeline |
|---------|----------|
| Rich text editor | TBD |
| Drag-to-reorder sections | TBD |
| Color scheme picker | TBD |
| Batch save mode | TBD |
| Undo/redo | TBD |

---

## 📞 Support

### Build Issues?
1. `npm install` - Install dependencies
2. `npm run build` - Rebuild
3. Clear `.next` folder if needed

### Supabase Issues?
1. Check project URL in env var
2. Verify anon key in env var
3. Test connection in browser console

### Admin Issues?
1. Check email is in `NEXT_PUBLIC_ADMIN_EMAILS`
2. Check DB `admins` table for backup permission
3. Verify Supabase auth is working

---

## 💡 Tips & Tricks

1. **See what was edited**: Check Supabase `site_content` table
2. **Inspect changes**: Open browser DevTools → Application → localStorage
3. **Test audio/images**: Use Gallery tab in LayoutEditorModal
4. **Keyboard power user**: Use zoom shortcuts extensively
5. **Mobile preview**: Zoom to 50% for mobile layout
6. **Debug iframe**: Check iframe source code in DevTools

---

## ✅ Verification

Before going live:
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Admin can click text in preview
- [ ] TextEditModal opens and closes
- [ ] Changes save to Supabase
- [ ] Page reloads show saved changes
- [ ] Zoom shortcuts work
- [ ] Section visibility toggles work
- [ ] No console errors

---

## 📖 Full Documentation

See these files for complete details:
- `IMPLEMENTATION_COMPLETE.md` - Full feature guide
- `CLICK_TO_EDIT_IMPLEMENTATION.md` - Architecture & API
- `README.md` - Project setup

---

**Last Updated**: January 2025  
**Version**: 1.0 (Production)  
**Status**: ✅ Ready to Use

