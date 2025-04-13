CREATE TABLE `embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`resource_id` text,
	`content` text NOT NULL,
	`embedding` text NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`source` text NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`weight` integer,
	`type` text
);
