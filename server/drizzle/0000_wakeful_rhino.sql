CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`user_id` int,
	`agent_code` varchar(50) NOT NULL,
	`credit_limit` decimal(15,2) DEFAULT '0.00',
	`sales_target` decimal(15,2) DEFAULT '0.00',
	`commission_rate` decimal(5,2) DEFAULT '5.00',
	`tax_rate` decimal(5,2) DEFAULT '0.00',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_tenant_code_unique` UNIQUE(`tenant_id`,`agent_code`)
);
--> statement-breakpoint
CREATE TABLE `commission_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`agent_id` int,
	`product_id` int,
	`rate_percentage` decimal(5,2) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `commission_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`user_id` int,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`dob` date,
	`address` text,
	`id_card_number` varchar(50),
	`passport_number` varchar(50),
	`gender` varchar(10),
	`occupation` varchar(255),
	`id_card_image` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insurance_companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`code` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`contact_person` varchar(255),
	`contact_phone` varchar(20),
	`logo_path` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `insurance_companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `insurance_companies_tenant_code_unique` UNIQUE(`tenant_id`,`code`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(15,2) NOT NULL DEFAULT '0.00',
	`currency` varchar(10) NOT NULL DEFAULT 'LAK',
	`limits` json,
	`features` json,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `platform_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor_id` int,
	`tenant_id` int,
	`action` varchar(100) NOT NULL,
	`target` varchar(255),
	`ip` varchar(64),
	`meta` json,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `platform_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` enum('superadmin','support') NOT NULL DEFAULT 'support',
	`mfa_enabled` boolean NOT NULL DEFAULT false,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`last_login_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `platform_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`policy_number` varchar(100) NOT NULL,
	`customer_id` int,
	`agent_id` int,
	`vehicle_id` int,
	`insurance_company_id` int,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`net_premium` decimal(15,2) NOT NULL,
	`vat_amount` decimal(15,2) NOT NULL,
	`registration_fee` decimal(15,2) NOT NULL,
	`total_premium` decimal(15,2) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `policies_tenant_number_unique` UNIQUE(`tenant_id`,`policy_number`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`insurance_company_id` int,
	`name` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int NOT NULL,
	`plan_id` int NOT NULL,
	`status` enum('trialing','active','past_due','cancelled') NOT NULL DEFAULT 'trialing',
	`started_at` timestamp DEFAULT (now()),
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenant_domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int NOT NULL,
	`hostname` varchar(255) NOT NULL,
	`type` enum('primary','custom') NOT NULL DEFAULT 'custom',
	`verification_token` varchar(64),
	`verified_at` timestamp,
	`ssl_status` varchar(20) NOT NULL DEFAULT 'pending',
	`is_primary` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `tenant_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenant_domains_hostname_unique` UNIQUE(`hostname`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(63) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('active','trial','suspended') NOT NULL DEFAULT 'trial',
	`plan_id` int,
	`settings` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`username` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'customer',
	`phone` varchar(20),
	`profile_photo_path` text,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_tenant_email_unique` UNIQUE(`tenant_id`,`email`),
	CONSTRAINT `users_tenant_username_unique` UNIQUE(`tenant_id`,`username`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenant_id` int,
	`customer_id` int,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int,
	`plate_number` varchar(50),
	`engine_number` varchar(100),
	`chassis_number` varchar(100),
	`engine_capacity` varchar(20),
	`color` varchar(50),
	`usage_type` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `agents` ADD CONSTRAINT `agents_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `agents` ADD CONSTRAINT `agents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_rates` ADD CONSTRAINT `commission_rates_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_rates` ADD CONSTRAINT `commission_rates_agent_id_agents_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `commission_rates` ADD CONSTRAINT `commission_rates_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customers` ADD CONSTRAINT `customers_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `customers` ADD CONSTRAINT `customers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insurance_companies` ADD CONSTRAINT `insurance_companies_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_audit_logs` ADD CONSTRAINT `platform_audit_logs_actor_id_platform_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `platform_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_audit_logs` ADD CONSTRAINT `platform_audit_logs_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_agent_id_agents_id_fk` FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_vehicle_id_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `policies` ADD CONSTRAINT `policies_insurance_company_id_insurance_companies_id_fk` FOREIGN KEY (`insurance_company_id`) REFERENCES `insurance_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_insurance_company_id_insurance_companies_id_fk` FOREIGN KEY (`insurance_company_id`) REFERENCES `insurance_companies`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenant_domains` ADD CONSTRAINT `tenant_domains_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenants` ADD CONSTRAINT `tenants_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_tenant_id_tenants_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `agents_tenant_idx` ON `agents` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `commission_rates_tenant_idx` ON `commission_rates` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `customers_tenant_idx` ON `customers` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `insurance_companies_tenant_idx` ON `insurance_companies` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `platform_audit_created_idx` ON `platform_audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `policies_tenant_idx` ON `policies` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `products_tenant_idx` ON `products` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_tenant_idx` ON `subscriptions` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tenant_domains_tenant_idx` ON `tenant_domains` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `tenant_domains_hostname_idx` ON `tenant_domains` (`hostname`);--> statement-breakpoint
CREATE INDEX `tenants_status_idx` ON `tenants` (`status`);--> statement-breakpoint
CREATE INDEX `users_tenant_idx` ON `users` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `vehicles_tenant_idx` ON `vehicles` (`tenant_id`);