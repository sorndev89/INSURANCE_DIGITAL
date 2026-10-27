CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`role_key` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`permissions` json NOT NULL,
	`is_system` boolean NOT NULL DEFAULT false,
	`is_admin` boolean NOT NULL DEFAULT false,
	`landing_path` varchar(100) NOT NULL DEFAULT '/dashboard',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `roles_tenant_key_unique` UNIQUE(`tenant_id`,`role_key`)
);
--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `roles_tenant_idx` ON `roles` (`tenant_id`);
--> statement-breakpoint
INSERT IGNORE INTO `roles` (`tenant_id`,`role_key`,`name`,`description`,`permissions`,`is_system`,`is_admin`,`landing_path`)
SELECT `id`, 'admin', 'ຜູ້ດູແລລະບົບ', 'ສິດເຕັມໃນລະບົບ', JSON_ARRAY('*'), 1, 1, '/dashboard' FROM `tenants`;--> statement-breakpoint
INSERT IGNORE INTO `roles` (`tenant_id`,`role_key`,`name`,`description`,`permissions`,`is_system`,`is_admin`,`landing_path`)
SELECT `id`, 'staff', 'ພະນັກງານ', 'ພະນັກງານປະຕິບັດງານ', COALESCE(JSON_EXTRACT(`settings`, '$.rolePermissions.staff'), JSON_ARRAY('dashboard.view','policy.view','policy.create','policy.update','policy.export','quotation.view','quotation.create','quotation.update','customer.view','customer.create','customer.update','agent.view','agent.manage','team.view','team.manage','commission.view','commission.pay','claim.view','claim.create','claim.process','finance.view','finance.manage','payment.create','report.view','report.export','profile.view')), 1, 0, '/dashboard' FROM `tenants`;--> statement-breakpoint
INSERT IGNORE INTO `roles` (`tenant_id`,`role_key`,`name`,`description`,`permissions`,`is_system`,`is_admin`,`landing_path`)
SELECT `id`, 'agent', 'ຕົວແທນ', 'ຕົວແທນຂາຍ', COALESCE(JSON_EXTRACT(`settings`, '$.rolePermissions.agent'), JSON_ARRAY('dashboard.view','policy.view','policy.create','policy.update','quotation.view','quotation.create','quotation.update','quotation.delete','customer.view','customer.create','customer.update','commission.view','claim.view','claim.create','claim.process','profile.view')), 1, 0, '/home' FROM `tenants`;--> statement-breakpoint
INSERT IGNORE INTO `roles` (`tenant_id`,`role_key`,`name`,`description`,`permissions`,`is_system`,`is_admin`,`landing_path`)
SELECT `id`, 'customer', 'ລູກຄ້າ', 'ລູກຄ້າ', COALESCE(JSON_EXTRACT(`settings`, '$.rolePermissions.customer'), JSON_ARRAY('policy.view','policy.create','quotation.view','quotation.create','claim.view','claim.create','payment.create','profile.view')), 1, 0, '/home' FROM `tenants`;
