CREATE TABLE `claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`claim_number` varchar(50) NOT NULL,
	`policy_id` int,
	`customer_id` int,
	`type` varchar(50) NOT NULL,
	`incident_date` date NOT NULL,
	`amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`coverage_limit` decimal(15,2) NOT NULL DEFAULT '0.00',
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`attachments` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `claims_id` PRIMARY KEY(`id`),
	CONSTRAINT `claims_tenant_number_unique` UNIQUE(`tenant_id`,`claim_number`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`agent_id` int,
	`policy_id` int,
	`rate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`paid_at` date,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`invoice_number` varchar(50) NOT NULL,
	`policy_id` int,
	`amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`issued_date` date NOT NULL,
	`due_date` date,
	`status` varchar(20) NOT NULL DEFAULT 'unpaid',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_tenant_number_unique` UNIQUE(`tenant_id`,`invoice_number`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`receipt_number` varchar(50) NOT NULL,
	`invoice_id` int,
	`amount` decimal(15,2) NOT NULL DEFAULT '0.00',
	`method` varchar(20) NOT NULL DEFAULT 'cash',
	`paid_at` date,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_tenant_receipt_unique` UNIQUE(`tenant_id`,`receipt_number`)
);
--> statement-breakpoint
CREATE TABLE `quotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`reference` varchar(50) NOT NULL,
	`customer_id` int,
	`product_id` int,
	`premium` decimal(15,2) NOT NULL DEFAULT '0.00',
	`valid_until` date,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `quotations_id` PRIMARY KEY(`id`),
	CONSTRAINT `quotations_tenant_ref_unique` UNIQUE(`tenant_id`,`reference`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`name` varchar(255) NOT NULL,
	`location` varchar(255),
	`head_name` varchar(255),
	`members` int NOT NULL DEFAULT 0,
	`monthly_sales` decimal(15,2) NOT NULL DEFAULT '0.00',
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agents` ADD `team_id` int;--> statement-breakpoint
ALTER TABLE `agents` ADD `level` varchar(30) DEFAULT 'Senior' NOT NULL;--> statement-breakpoint
ALTER TABLE `agents` ADD `status` varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `code` varchar(30);--> statement-breakpoint
ALTER TABLE `customers` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `customers` ADD `email` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `status` varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `policies` ADD `product_id` int;--> statement-breakpoint
ALTER TABLE `customers` ADD CONSTRAINT `customers_tenant_code_unique` UNIQUE(`tenant_id`,`code`);--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_policy_id_policies_id_fk` FOREIGN KEY (`policy_id`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claims` ADD CONSTRAINT `claims_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_agent_id_agents_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_policy_id_policies_id_fk` FOREIGN KEY (`policy_id`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_policy_id_policies_id_fk` FOREIGN KEY (`policy_id`) REFERENCES `policies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_invoice_id_invoices_id_fk` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `claims_tenant_idx` ON `claims` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `commissions_tenant_idx` ON `commissions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `invoices_tenant_idx` ON `invoices` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `payments_tenant_idx` ON `payments` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `quotations_tenant_idx` ON `quotations` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `teams_tenant_idx` ON `teams` (`tenant_id`);--> statement-breakpoint
ALTER TABLE `agents` ADD CONSTRAINT `agents_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `agents_team_idx` ON `agents` (`team_id`);