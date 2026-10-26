ALTER TABLE `platform_users` ADD `username` varchar(100);--> statement-breakpoint
UPDATE `platform_users` SET `username` = CONCAT(SUBSTRING_INDEX(`email`, '@', 1), '_', `id`) WHERE `username` IS NULL;--> statement-breakpoint
ALTER TABLE `platform_users` ADD CONSTRAINT `platform_users_username_unique` UNIQUE(`username`);