ALTER TABLE `users` ADD `password` text(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `role` text(50) DEFAULT 'member' NOT NULL;