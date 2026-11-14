CREATE TYPE "public"."entity_status" AS ENUM('draft', 'staged', 'needs_review', 'ready_to_publish', 'published', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('brand', 'business', 'business_location', 'product', 'product_variant', 'menu_item', 'service', 'service_offering');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('branch_of', 'owned_by', 'operates', 'manufactured_by', 'variant_of', 'sold_by', 'offered_at', 'part_of', 'located_at');--> statement-breakpoint
CREATE TABLE "entities" (
	"entity_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"canonical_name" varchar(300) NOT NULL,
	"slug" varchar(350),
	"status" "entity_status" DEFAULT 'draft' NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "entity_relationships" (
	"relationship_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_entity_id" uuid NOT NULL,
	"to_entity_id" uuid NOT NULL,
	"relationship_type" "relationship_type" NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "entity_relationships" ADD CONSTRAINT "entity_relationships_from_entity_id_entities_entity_id_fk" FOREIGN KEY ("from_entity_id") REFERENCES "public"."entities"("entity_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_relationships" ADD CONSTRAINT "entity_relationships_to_entity_id_entities_entity_id_fk" FOREIGN KEY ("to_entity_id") REFERENCES "public"."entities"("entity_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "entities_slug_unique" ON "entities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "entities_type_status_idx" ON "entities" USING btree ("entity_type","status");--> statement-breakpoint
CREATE INDEX "entities_name_idx" ON "entities" USING btree ("canonical_name");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_relationship_unique" ON "entity_relationships" USING btree ("from_entity_id","to_entity_id","relationship_type");--> statement-breakpoint
CREATE INDEX "entity_relationship_from_idx" ON "entity_relationships" USING btree ("from_entity_id");--> statement-breakpoint
CREATE INDEX "entity_relationship_to_idx" ON "entity_relationships" USING btree ("to_entity_id");