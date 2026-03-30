# Task 09 — Profile page and user preferences

## Goal

Build the profile page where users view their info and manage dietary preferences, allergies, default payment, and notification settings.

## Steps

### 1. Page — `src/pages/ProfilePage.tsx`

Route: `/profile`

Divide into sections using clear visual separators (subtle gray dividers, section headings in small caps).

---

#### Section 1 — User info

```
   ┌─────┐
   │  MR │   Marco Rossi          ← initials avatar, colored circle
   └─────┘   Dipendente
             marco.rossi@sanmarco.it
             Badge: EMP-4421
```

Avatar: a 64px circle with the user's initials (first letter of first + last name), background color derived from the user ID (pick from a set of 5 colors), white text.

For patients: also show "Stanza: 307-B" and "Degenza attiva".

---

#### Section 2 — Preferenze dietetiche

Label: "Dieta e stile alimentare"

Toggle switches (or large checkboxes) for each `DietaryTag`:

```
🌱 Vegetariano          [toggle]
🌿 Vegano               [toggle]
🌾 Senza glutine        [toggle]
🥛 Senza lattosio       [toggle]
🩸 Dieta diabetica      [toggle]
🧂 Basso contenuto di sodio  [toggle]
```

Pre-populate from `currentUser.dietaryPreferences`.

---

#### Section 3 — Allergie

Label: "Le mie allergie"

Checkbox grid (2 columns on mobile, 3 on desktop):

```
☐ Glutine    ☐ Latticini   ☐ Frutta a guscio
☐ Uova       ☐ Crostacei   ☐ Soia
```

Pre-populate from `currentUser.allergies`.

Info banner (blue, subtle):
> "Le allergie selezionate saranno evidenziate nel menu con un bordo arancione."

---

#### Section 4 — Metodo di pagamento preferito

Label: "Pagamento predefinito"

Radio buttons, filtered by role:
- Employee: `card`, `wallet`, `payroll`
- Patient: `card`, `room_charge`

Labels:
```
○ 💳 Carta di credito
○ 👛 Wallet interno  (solo dipendenti)
○ 💼 Busta paga      (solo dipendenti)
○ 🏥 Addebito degenza (solo pazienti)
```

Pre-select the first option as default.

---

#### Section 5 — Notifiche

Label: "Notifiche push"

```
Notifiche ordini         [toggle]
  Conferma e aggiornamenti di stato

Promemoria ritiro        [toggle]
  30 minuti prima dell'orario scelto
```

First toggle: calls `Notification.requestPermission()` if enabling and permission is `'default'`. If permission is `'denied'`, show a warning: "Le notifiche sono bloccate dal browser. Abilitale nelle impostazioni."

Store notification preferences in `localStorage` key `notifPrefs`.

---

#### Save button

Sticky at the bottom of the page on mobile, inline at the bottom of the form on desktop.

```
[Salva modifiche]
```

On click:
1. Call `updateUserPreferences(selectedPrefs, selectedAllergies)` from AppContext
2. Save payment preference + notification prefs to `localStorage`
3. Show a green success toast: "Preferenze salvate ✓"

### 2. Toast component — `src/components/Toast.tsx`

If not already created in a previous task, build it now:

- Fixed position: bottom-right on desktop, bottom-center on mobile
- 4 variants: `success` (green), `error` (red), `info` (blue), `warning` (amber)
- Auto-dismiss after 4 seconds
- Slide-up entrance animation (CSS transform + opacity)
- Support multiple toasts stacked

Create `src/hooks/useToast.ts` — a hook that returns `{ showToast(message, variant) }`.

### 3. Verify

- Log in as `u1` — verify dietary prefs and allergies pre-populate correctly
- Toggle a dietary pref → save → navigate away → come back → confirm it persisted
- Log in as `u2` (Anna, gluten allergy) → confirm gluten checkbox is pre-checked, wallet and payroll options are NOT shown
- Enable notifications → browser permission dialog appears
- Save button shows the green toast
