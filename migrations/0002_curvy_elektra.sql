CREATE TABLE "return_shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_shipment_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"roaster_id" integer NOT NULL,
	"customer_id" varchar NOT NULL,
	"reason" varchar NOT NULL,
	"shippo_shipment_id" varchar,
	"shippo_transaction_id" varchar,
	"tracking_number" varchar,
	"label_url" varchar,
	"carrier" varchar,
	"service_name" varchar,
	"amount" numeric(10, 2),
	"currency" varchar DEFAULT 'USD',
	"status" varchar DEFAULT 'REQUESTED' NOT NULL,
	"who_pays_cost" varchar DEFAULT 'CUSTOMER' NOT NULL,
	"refund_amount" numeric(10, 2),
	"refund_processed" boolean DEFAULT false,
	"notes" text,
	"from_address" jsonb,
	"to_address" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "return_shipments_shippo_shipment_id_unique" UNIQUE("shippo_shipment_id")
);
--> statement-breakpoint
CREATE TABLE "roaster_shipping_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"roaster_id" integer NOT NULL,
	"shippo_account_id" varchar,
	"use_roastah_shipping" boolean DEFAULT true,
	"origin_name" varchar NOT NULL,
	"origin_company" varchar,
	"origin_address_line_1" varchar NOT NULL,
	"origin_address_line_2" varchar,
	"origin_city" varchar NOT NULL,
	"origin_state" varchar NOT NULL,
	"origin_zip_code" varchar NOT NULL,
	"origin_country" varchar DEFAULT 'US' NOT NULL,
	"origin_phone" varchar,
	"origin_email" varchar,
	"free_shipping_threshold" numeric(10, 2),
	"handling_time" integer DEFAULT 1,
	"cutoff_time" varchar DEFAULT '15:00',
	"weekends_enabled" boolean DEFAULT false,
	"default_package_type" varchar DEFAULT 'USPS_PRIORITY_MAIL_BOX',
	"package_weight" numeric(5, 2) DEFAULT '1.00',
	"package_length" numeric(5, 2) DEFAULT '12.00',
	"package_width" numeric(5, 2) DEFAULT '9.00',
	"package_height" numeric(5, 2) DEFAULT '3.00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipment_tracking_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_id" integer NOT NULL,
	"status" varchar NOT NULL,
	"status_date" timestamp NOT NULL,
	"status_details" varchar,
	"location" varchar,
	"carrier" varchar NOT NULL,
	"tracking_number" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"roaster_id" integer NOT NULL,
	"shippo_shipment_id" varchar NOT NULL,
	"shippo_transaction_id" varchar,
	"tracking_number" varchar,
	"label_url" varchar,
	"carrier" varchar NOT NULL,
	"service_name" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"status" varchar DEFAULT 'PENDING' NOT NULL,
	"estimated_delivery_date" timestamp,
	"actual_delivery_date" timestamp,
	"from_address" jsonb NOT NULL,
	"to_address" jsonb NOT NULL,
	"package_type" varchar NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"length" numeric(5, 2) NOT NULL,
	"width" numeric(5, 2) NOT NULL,
	"height" numeric(5, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shipments_shippo_shipment_id_unique" UNIQUE("shippo_shipment_id")
);
--> statement-breakpoint
CREATE TABLE "shipping_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"company" varchar,
	"address_line_1" varchar NOT NULL,
	"address_line_2" varchar,
	"city" varchar NOT NULL,
	"state" varchar NOT NULL,
	"zip_code" varchar NOT NULL,
	"country" varchar DEFAULT 'US' NOT NULL,
	"phone" varchar,
	"delivery_instructions" text,
	"is_default" boolean DEFAULT false,
	"is_validated" boolean DEFAULT false,
	"shippo_address_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipping_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"shippo_rate_id" varchar NOT NULL,
	"roaster_id" integer NOT NULL,
	"from_address_id" integer NOT NULL,
	"to_address_id" integer NOT NULL,
	"service_name" varchar NOT NULL,
	"service_token" varchar NOT NULL,
	"carrier" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'USD' NOT NULL,
	"estimated_days" integer,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "shipping_rates_shippo_rate_id_unique" UNIQUE("shippo_rate_id")
);
--> statement-breakpoint
ALTER TABLE "return_shipments" ADD CONSTRAINT "return_shipments_original_shipment_id_shipments_id_fk" FOREIGN KEY ("original_shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_shipments" ADD CONSTRAINT "return_shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_shipments" ADD CONSTRAINT "return_shipments_roaster_id_roasters_id_fk" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_shipments" ADD CONSTRAINT "return_shipments_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roaster_shipping_settings" ADD CONSTRAINT "roaster_shipping_settings_roaster_id_roasters_id_fk" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_tracking_events" ADD CONSTRAINT "shipment_tracking_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_roaster_id_roasters_id_fk" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_addresses" ADD CONSTRAINT "shipping_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_roaster_id_roasters_id_fk" FOREIGN KEY ("roaster_id") REFERENCES "public"."roasters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_from_address_id_shipping_addresses_id_fk" FOREIGN KEY ("from_address_id") REFERENCES "public"."shipping_addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_rates" ADD CONSTRAINT "shipping_rates_to_address_id_shipping_addresses_id_fk" FOREIGN KEY ("to_address_id") REFERENCES "public"."shipping_addresses"("id") ON DELETE no action ON UPDATE no action;