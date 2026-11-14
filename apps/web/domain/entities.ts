export const entityTypes = [
  "brand",
  "business",
  "business_location",
  "product",
  "product_variant",
  "menu_item",
  "service",
  "service_offering",
] as const;

export type EntityType = (typeof entityTypes)[number];

export const entityStatuses = [
  "draft",
  "staged",
  "needs_review",
  "ready_to_publish",
  "published",
  "rejected",
  "archived",
] as const;

export type EntityStatus = (typeof entityStatuses)[number];

