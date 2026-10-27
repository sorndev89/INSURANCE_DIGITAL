ALTER TABLE `users` ADD `name` varchar(255);--> statement-breakpoint
UPDATE `users` SET `name` = `username` WHERE `name` IS NULL;
