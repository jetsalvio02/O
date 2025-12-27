CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" real NOT NULL,
	"stock" integer NOT NULL,
	"image" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "products" CASCADE;--> statement-breakpoint
ALTER TABLE "orders_items" DROP CONSTRAINT "orders_items_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;