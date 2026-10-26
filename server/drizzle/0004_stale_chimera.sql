CREATE TABLE `db_doctor_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mode` varchar(20) NOT NULL,
	`status` varchar(20) NOT NULL,
	`triggered_by` varchar(20) NOT NULL DEFAULT 'deploy',
	`app_version` varchar(100),
	`migration_from` varchar(100),
	`migration_to` varchar(100),
	`issues_count` int NOT NULL DEFAULT 0,
	`repairs_count` int NOT NULL DEFAULT 0,
	`duration_ms` int NOT NULL DEFAULT 0,
	`report` json,
	`started_at` timestamp DEFAULT (now()),
	`finished_at` timestamp,
	CONSTRAINT `db_doctor_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `db_doctor_runs_started_idx` ON `db_doctor_runs` (`started_at`);