CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token_id` varchar(36) NOT NULL,
  `token_hash` varchar(191) NOT NULL,
  `user_id` bigint NOT NULL,
  `auth_user_id` varchar(36) NOT NULL,
  `email` varchar(191) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_idx` (`token_id`),
  KEY `password_reset_tokens_user_idx` (`user_id`),
  KEY `password_reset_tokens_expires_idx` (`expires_at`),
  CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
