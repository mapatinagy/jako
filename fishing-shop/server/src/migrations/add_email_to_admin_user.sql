ALTER TABLE admin_user
ADD COLUMN email VARCHAR(255) UNIQUE,
ADD INDEX idx_email (email);

-- Update existing users to have a default email (you should update this manually later)
UPDATE admin_user SET email = CONCAT(username, '@example.com') WHERE email IS NULL; 