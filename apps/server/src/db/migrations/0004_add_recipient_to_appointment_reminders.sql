ALTER TABLE `appointment_reminders`
	ADD COLUMN `recipient` enum('patient','professional') NOT NULL DEFAULT 'patient' AFTER `channel`,
	DROP INDEX `appointment_reminders_unique_idx`,
	ADD UNIQUE INDEX `appointment_reminders_unique_idx` (`appointment_id`, `channel`, `recipient`, `scheduled_for`);
