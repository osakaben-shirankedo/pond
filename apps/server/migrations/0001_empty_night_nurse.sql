ALTER TABLE `users` ADD `user_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `belonging_ike_ids` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_id_unique` ON `users` (`user_id`);