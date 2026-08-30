CREATE TABLE "albumPhoto" (
	"photoId" integer,
	"albumId" integer,
	"createdAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"filePath" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "albumPhoto" ADD CONSTRAINT "albumPhoto_photoId_foreignKey" FOREIGN KEY ("photoId") REFERENCES "public"."photos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "albumPhoto" ADD CONSTRAINT "albumPhoto_albumId_foreignKey" FOREIGN KEY ("albumId") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;