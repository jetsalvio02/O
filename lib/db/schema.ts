import { timeStamp } from "console";
import {
  pgEnum,
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  real,
  boolean,
} from "drizzle-orm/pg-core";

export const role_enum = pgEnum("role", ["ADMIN", "CUSTOMER"]);

export const order_status_enum = pgEnum("order_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  password: varchar("password", { length: 255 }).notNull(),

  role: role_enum("role").default("CUSTOMER"),

  created_at: timestamp("created_at").defaultNow(),
});

export const product = pgTable("product", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  price: real("price").notNull(),

  stock: integer("stock").notNull(),

  image: varchar("image", { length: 255 }),

  is_active: boolean("is_active").default(true),

  created_at: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),

  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: order_status_enum("status").default("PENDING"),

  total: real("total").notNull(),

  address: varchar("address", { length: 500 }).notNull().default(""),

  created_at: timestamp("created_at").defaultNow(),
});

export const orders_items = pgTable("orders_items", {
  id: serial("id").primaryKey(),

  order_id: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  product_id: integer("product_id")
    .notNull()
    .references(() => product.id),

  quantity: integer("quantity").notNull(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),

  user_id: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  quantity: integer("quantity").notNull().default(1),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const carts_items = pgTable("carts_items", {
  id: serial("id").primaryKey(),

  cart_id: integer("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),

  product_id: integer("product_id")
    .notNull()
    .references(() => product.id),

  quantity: integer("quantity").default(1),

  price: integer("price").notNull(),
});
