CREATE TABLE `monthly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`cycle_id` text NOT NULL,
	`user_id` text NOT NULL,
	`income` integer NOT NULL,
	`tax` integer NOT NULL,
	`rent` integer NOT NULL,
	`savings_short_term` integer NOT NULL,
	`savings_long_term` integer NOT NULL,
	`invest` integer NOT NULL,
	`day_to_day` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`cycle_id`) REFERENCES `cycles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_reports_cycle_id_unique` ON `monthly_reports` (`cycle_id`);