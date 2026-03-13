# Feature Suggestions — budget-web2.0

> Last updated: 2026-03-13
> Recently shipped: Monthly Reports, Cycle/Week Pace, Mobile Number Keyboard

---

## 1. Recurring Expenses

**What:** Mark any expense as recurring (weekly / monthly). On cycle/subcycle creation, those expenses are auto-added.

**Why:** Most people have fixed costs (rent, subscriptions, gym). Logging them manually every cycle is noise.

**Scope:**
- Add `recurring` + `recurrenceType` (`weekly` | `monthly`) fields to the `expenses` table (or a new `recurring_expenses` table)
- On `createCycle` / `createSubcycle` actions, auto-insert recurring expenses for the user
- UI: checkbox in `AddNewExpense.tsx` modal — "Repeat every cycle"
- Management: list of recurring expenses in a simple settings page or inside the BurgerMenu

---

## 2. Quick-Tap Expense Buttons

**What:** Pin up to 6 frequently-used expenses as one-tap buttons on the main page (e.g., "Lunch — 200", "Coffee — 80").

**Why:** The most common action in the app is adding an expense. Removing the modal for known expenses = huge UX win on mobile.

**Scope:**
- Store pinned expenses as JSON on the `users` table (similar to `lastCreatedCategoriesJson`)
- Floating panel above the `PlusButton` or inside `QuickMenu.tsx`
- Tap once → expense logged instantly with a toast confirmation + undo option

---

## 3. Savings Rate Widget

**What:** A small card on the main dashboard (or reports page) showing savings rate = `(income - expenses) / income` as a percentage, trended vs last month.

**Why:** The monthly report already captures income and savings fields. This just surfaces them prominently.

**Scope:**
- Read from `monthly_reports` — no new data needed
- Small widget component, reuse `ReportCard.tsx` card shell
- Show current month %, delta vs last month, and a simple 3-month sparkline
- Place below the burn-rate widget on `/` or add a card on `/reports`

---

## 4. Category Spending History (Trend per Category)

**What:** On the stats page, click into a category to see how much was spent on it across the last N cycles as a bar chart.

**Why:** You see per-cycle totals but can't easily answer "am I spending more on groceries over time?"

**Scope:**
- New query in `stats.ts`: get expenses grouped by `categoryId` + `cycleId`, matched by category title across cycles
- Drill-down panel/modal inside `CycleChart.tsx` or a new `CategoryTrendChart.tsx`
- Reuse existing Recharts setup

---

## 5. Net Worth Snapshot (Vault History)

**What:** Each time the user opens the vault page, log the total balance. Show a simple line chart of net worth over time.

**Why:** The vault shows current balance, but there's no memory of how it changed.

**Scope:**
- New table `vault_snapshots` (`id`, `userId`, `totalUah`, `totalUsd`, `createdAt`)
- Write snapshot on `getVaultTotal()` call (or a dedicated action)
- Line chart on `/vault` page below the current total
- Keep only last 90 days of snapshots

---

## 6. Expense Search

**What:** Full-text search bar on `/expenses` page filtering by label, comment, category name, or amount.

**Why:** The expenses table already exists with all the data — just needs a search input wired to a client-side filter (or a server-side query param).

**Scope:**
- Add a search `<Input>` above `ExpensesTable.tsx`
- Client-side: filter the already-fetched rows on `label`, `comment`, `categoryName`, `amount`
- No schema changes needed

---

## 7. Budget Rollover Option

**What:** When creating a new cycle, optionally carry unspent budget from the previous cycle's categories into the new one.

**Why:** If you under-spent last month, that money doesn't vanish — surfacing it as a rollover feels more real.

**Scope:**
- Calculate leftover per category at cycle close: `initialAmount - sumExpenses`
- In `AddNewCycle.tsx`, show a "Roll over leftover from last cycle?" toggle
- On `createCycle`, if enabled, add the leftover to the matching category's `initialAmount`
- Match categories by title

---

## 8. Daily Spending Limit Indicator

**What:** Show how much you can spend *today* to stay on pace — `remainingBudget / remainingDays`.

**Why:** The burn-rate widget shows weekly/cycle pace, but a "safe-to-spend today" number is more actionable.

**Scope:**
- Compute in the same place as `BurnRateWidget.tsx`
- Display as a secondary line: "Safe today: X" below the current pace
- No new data needed

---

## 9. Export to CSV

**What:** Download all expenses for a cycle (or date range) as a CSV file.

**Why:** Power users want to open data in Excel / Google Sheets for custom analysis.

**Scope:**
- New API route `/api/export?cycleId=...` that returns CSV
- Button in `ExpensesTable.tsx` toolbar
- Uses `getAllExpensesTable()` action data, serialize to CSV string

---

## 10. Installment / Split Purchase

**What:** Log a large purchase (e.g., 2400) and split it evenly across N subcycles (e.g., 600/week × 4).

**Why:** Prevents one week looking catastrophically over-budget for a planned large purchase.

**Scope:**
- Checkbox in `AddNewExpense.tsx`: "Split across subcycles"
- Select number of subcycles
- `addExpense` creates N expense records, one per subcycle, with amount/N each

---

## Priority Order (suggested)

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 6 | Expense Search | XS | High |
| 8 | Daily Spending Limit | XS | High |
| 3 | Savings Rate Widget | S | High |
| 2 | Quick-Tap Expense Buttons | S | High |
| 1 | Recurring Expenses | M | High |
| 7 | Budget Rollover | M | Medium |
| 4 | Category Spending History | M | Medium |
| 9 | Export to CSV | S | Medium |
| 5 | Net Worth Snapshot | M | Medium |
| 10 | Installment Split | M | Low |
