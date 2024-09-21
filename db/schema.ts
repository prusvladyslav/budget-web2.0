import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lastOpenedCycleId: text("last_opened_cycle_id"),
  lastOpenedSubcycleId: text("last_opened_subcycle_id"),
  debug: integer("debug", { mode: "boolean" }).default(false),
});

export type SelectUser = typeof usersTable.$inferSelect;

export const usersRelations = relations(usersTable, ({ many }) => ({
  cycles: many(cycleTable),
}));

export const cycleTable = sqliteTable("cycles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const cycleRelations = relations(cycleTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [cycleTable.userId],
    references: [usersTable.id],
  }),
  categories: many(categoryTable),
  subcycles: many(subsycleTable),
  expenses: many(expenseTable),
}));

export type InsertCycle = typeof cycleTable.$inferInsert;
export type SelectCycle = typeof cycleTable.$inferSelect;

export const subsycleTable = sqliteTable("subsycles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cycleId: text("cycle_id")
    .notNull()
    .references(() => cycleTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const subcyclesRalations = relations(subsycleTable, ({ one, many }) => ({
  categories: many(categoryTable),
  cycle: one(cycleTable, {
    fields: [subsycleTable.cycleId],
    references: [cycleTable.id],
  }),
}));

export type SelectSubcycle = typeof subsycleTable.$inferSelect;

export const categoryTable = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cycleId: text("cycle_id")
    .notNull()
    .references(() => cycleTable.id, { onDelete: "cascade" }),
  subcycleId: text("subcycle_id").references(() => subsycleTable.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  icon: text("icon"),
  initialAmount: integer("initial_amount").notNull(),
  weekly: integer("weekly", { mode: "boolean" }).notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const categoriesRelations = relations(
  categoryTable,
  ({ one, many }) => ({
    subcycle: one(subsycleTable, {
      fields: [categoryTable.subcycleId],
      references: [subsycleTable.id],
    }),
    expenses: many(expenseTable),
    cycles: one(cycleTable, {
      fields: [categoryTable.cycleId],
      references: [cycleTable.id],
    }),
  })
);

export type SelectCategory = typeof categoryTable.$inferSelect;
export type SelectCategoryWithCurrentAmount =
  typeof categoryTable.$inferSelect & { currentAmount: number };
export type InsertCategory = typeof categoryTable.$inferInsert;

export const expenseTable = sqliteTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  cycleId: text("cycle_id")
    .notNull()
    .references(() => cycleTable.id, { onDelete: "cascade" }),
  subcycleId: text("subcycle_id").references(() => subsycleTable.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
  label: text("label"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  comment: text("comment"),
});

export const expensesRelations = relations(expenseTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [expenseTable.categoryId],
    references: [categoryTable.id],
  }),
  cycles: one(cycleTable, {
    fields: [expenseTable.cycleId],
    references: [cycleTable.id],
  }),
}));

export type SelectExpense = typeof expenseTable.$inferSelect;
export type InsertExpense = typeof expenseTable.$inferInsert;

export const vaultTable = sqliteTable("vault", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  amount: integer("amount").notNull(),
  isMain: integer("is_main", { mode: "boolean" }).notNull(),
  currency: text("currency").notNull(),
});

export type SelectVault = typeof vaultTable.$inferSelect;
export type InsertVault = typeof vaultTable.$inferInsert;
