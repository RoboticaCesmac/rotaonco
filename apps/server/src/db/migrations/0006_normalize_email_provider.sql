UPDATE account
SET provider_id = 'email'
WHERE provider_id IN ('email-password', 'password');
