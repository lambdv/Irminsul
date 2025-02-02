PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_embeddings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resource_id` integer NOT NULL,
	`content` text NOT NULL,
	`embedding` blob NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_embeddings`("id", "resource_id", "content", "embedding", "created_at") SELECT "id", "resource_id", "content", "embedding", "created_at" FROM `embeddings`;--> statement-breakpoint
DROP TABLE `embeddings`;--> statement-breakpoint
ALTER TABLE `__new_embeddings` RENAME TO `embeddings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `resources` ADD `source` text DEFAULT '';--> statement-breakpoint
ALTER TABLE `resources` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `resources` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `resources` DROP COLUMN `embedding`;