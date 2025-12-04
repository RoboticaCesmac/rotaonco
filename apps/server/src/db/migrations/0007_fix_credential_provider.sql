UPDATE account
SET provider_id = 'credential'
WHERE provider_id IN ('email', 'email-password', 'password');
