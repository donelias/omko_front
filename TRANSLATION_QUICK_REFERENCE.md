# 🔄 Translation System - Quick Reference Guide

## How to Use Translations in Components

### ✅ Correct Pattern (Use This!)

```javascript
import { useTranslate } from '@/hooks/useTranslate';

const MyComponent = () => {
  const translate = useTranslate(); // Always add this line
  
  return (
    <div>
      <h1>{translate('homeTitle')}</h1>
      <p>{translate('description')}</p>
    </div>
  );
};

export default MyComponent;
```

---

## For Every New Component

**3 Step Checklist:**

1. ✅ Add the import:
```javascript
import { useTranslate } from '@/hooks/useTranslate';
```

2. ✅ Initialize the hook inside your component:
```javascript
const translate = useTranslate();
```

3. ✅ Use it in your JSX:
```javascript
<h1>{translate('yourKey')}</h1>
```

---

## Common Translation Keys

### Navigation & Headers
- `home` - "Home" / "Inicio"
- `aboutUs` - "About Us" / "Acerca de Nosotros"
- `contact` - "Contact" / "Contacto"
- `logout` - "Logout" / "Cerrar Sesión"

### Properties
- `property` - "Property" / "Propiedad"
- `properties` - "Properties" / "Propiedades"
- `price` - "Price" / "Precio"
- `location` - "Location" / "Ubicación"

### User Actions
- `addProperty` - "Add Property" / "Añadir Propiedad"
- `editProp` - "Edit Property" / "Editar Propiedad"
- `delete` - "Delete" / "Eliminar"
- `save` - "Save" / "Guardar"

**See `en.json` and `es.json` for complete list of 613 translation keys**

---

## Locale Files

Location: `/src/utils/locale/`

- **en.json** - English translations (613 keys)
- **es.json** - Spanish translations (613 keys)

Structure:
```json
{
  "home": "Home",
  "aboutUs": "About Us",
  "property": "Property"
}
```

---

## Redux Language State

### Current Language Code
```javascript
import { useSelector } from 'react-redux';
import { Language } from '@/store/reducer/languageSlice';

const component = () => {
  const lang = useSelector(state => state.Language.currentLanguageCode);
  // lang = 'en' or 'es'
};
```

### Change Language (From Language Selector)
The Navbar automatically handles this - no manual action needed.

---

## How It Works (Behind the Scenes)

```
User clicks "Español" in Navbar
  ↓
Redux action: setLanguage('es')
  ↓
Store updates: Language.currentLanguageCode = 'es'
  ↓
useTranslate hook dependency triggers
  ↓
useCallback recreates translate function
  ↓
Component re-renders
  ↓
All text shows in Spanish immediately ✨
```

---

## Troubleshooting

### Issue: Text still in English after language switch

**Solution:** Make sure you have BOTH:
```javascript
import { useTranslate } from '@/hooks/useTranslate';

const MyComponent = () => {
  const translate = useTranslate(); // ← Don't forget this!
  return <h1>{translate('key')}</h1>;
};
```

### Issue: "translate is not defined"

**Solution:** Check you imported the hook correctly:
```javascript
// ❌ WRONG
import { translate } from '@/utils';

// ✅ CORRECT
import { useTranslate } from '@/hooks/useTranslate';
const translate = useTranslate();
```

### Issue: Component doesn't update on language change

**Solution:** Ensure the component is wrapped by LanguageRerenderer:
- Located in: `/src/Components/LanguageRerenderer/LanguageRerenderer.jsx`
- Already wrapped in `_app.js` - you don't need to do anything

---

## Adding a New Translation

1. **Add to en.json:**
```json
{
  "myNewKey": "My New Text"
}
```

2. **Add to es.json:**
```json
{
  "myNewKey": "Mi Nuevo Texto"
}
```

3. **Use in component:**
```javascript
const translate = useTranslate();
return <p>{translate('myNewKey')}</p>;
```

That's it! The translation will work immediately.

---

## Related Files

| File | Purpose |
|------|---------|
| `/src/hooks/useTranslate.js` | The reactive translation hook |
| `/src/Components/LanguageRerenderer/LanguageRerenderer.jsx` | Forces re-renders on language change |
| `/src/utils/locale/en.json` | English translations (613 keys) |
| `/src/utils/locale/es.json` | Spanish translations (613 keys) |
| `/src/store/reducer/languageSlice.js` | Redux language state |
| `/src/Components/Navbar/Navbar.jsx` | Language selector button |

---

## Key Principles

✅ **Do:**
- Always use `const translate = useTranslate()`
- Call translate with keys from en.json/es.json
- Keep translation keys consistent

❌ **Don't:**
- Import translate directly: `import { translate } from '@/utils'`
- Hardcode text in components (always use translations)
- Forget the initialization line

---

## Performance

The useTranslate hook is optimized:
- Minimal re-renders (only on language change)
- Efficient Redux selector subscription
- useCallback prevents unnecessary function recreations
- No performance impact on application

---

## Examples

### Simple Text
```javascript
const translate = useTranslate();
return <h1>{translate('pageTitle')}</h1>;
```

### With Conditional
```javascript
const translate = useTranslate();
return (
  <button>
    {showMore ? translate('showLess') : translate('showMore')}
  </button>
);
```

### In Modal
```javascript
const translate = useTranslate();
return (
  <Modal>
    <Modal.Header>
      <Modal.Title>{translate('confirmDelete')}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{translate('confirmMessage')}</Modal.Body>
    <Modal.Footer>
      <Button>{translate('cancel')}</Button>
      <Button>{translate('delete')}</Button>
    </Modal.Footer>
  </Modal>
);
```

### With Array
```javascript
const translate = useTranslate();
const items = ['home', 'about', 'contact'];
return (
  <nav>
    {items.map(key => (
      <a key={key}>{translate(key)}</a>
    ))}
  </nav>
);
```

---

## Summary

**Translation System Status:** ✅ Production Ready

**Components Using useTranslate:** 59 out of 59 (100%)

**Language Support:** English (en), Spanish (es)

**Total Translation Keys:** 613

The system is fully functional and requires minimal effort to maintain! 🚀
