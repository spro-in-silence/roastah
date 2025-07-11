CREATE TABLE "favorite_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
