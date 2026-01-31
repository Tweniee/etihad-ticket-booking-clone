-- Create User Info Table
CREATE TABLE IF NOT EXISTS user_info (
    user_id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    citizenship VARCHAR(50) NOT NULL,
    uae_resident BOOLEAN NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Travel History Table
CREATE TABLE IF NOT EXISTS travel_history (
    travel_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    destination VARCHAR(50) NOT NULL,
    travel_date DATE NOT NULL,
    purpose VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_info(user_id) ON DELETE CASCADE
);

-- Clear existing data
TRUNCATE TABLE travel_history, user_info RESTART IDENTITY CASCADE;

-- Insert User Data
INSERT INTO user_info (user_id, category, name, citizenship, uae_resident, details) VALUES
(1, 'New Traveller', 'John Smith', 'UK', TRUE, 'New to travel'),
(2, 'Family with kids', 'David Brown', 'France', FALSE, 'Family of four - mom, dad and 2 children. Child 1 - 1 year; Child 2 - 3 years'),
(3, 'Frequent Flyer', 'Salman Khan', 'India', TRUE, 'Couple traveller, for leisure'),
(4, 'Frequent Flyer', 'Rishi Patel', 'India', FALSE, 'Single traveller, more for business purpose');

-- Insert Travel History Data
INSERT INTO travel_history (user_id, destination, travel_date, purpose) VALUES
-- David Brown (User 2) - Family with kids
(2, 'UK', '2024-11-15', 'Leisure'),
(2, 'UK', '2024-10-20', 'Leisure'),
(2, 'Spain', '2024-08-10', 'Leisure'),
(2, 'UAE', '2024-05-15', 'Leisure'),
(2, 'UAE', '2024-03-20', 'Leisure'),
(2, 'UAE', '2024-01-10', 'Leisure'),
(2, 'France', '2023-12-25', 'Leisure'),
(2, 'Italy', '2023-09-10', 'Leisure'),
(2, 'Germany', '2023-07-15', 'Leisure'),
(2, 'Switzerland', '2023-05-20', 'Leisure'),

-- Salman Khan (User 3) - Frequent Flyer
(3, 'Spain', '2024-11-05', 'Leisure'),
(3, 'Austria', '2024-10-15', 'Leisure'),
(3, 'India', '2024-09-20', 'Leisure'),
(3, 'India', '2024-07-10', 'Leisure'),
(3, 'India', '2024-05-15', 'Leisure'),
(3, 'India', '2024-02-20', 'Leisure'),
(3, 'Thailand', '2023-12-10', 'Leisure'),
(3, 'Singapore', '2023-10-05', 'Leisure'),
(3, 'Malaysia', '2023-08-15', 'Leisure'),
(3, 'India', '2023-06-20', 'Leisure'),
(3, 'UAE', '2023-04-10', 'Leisure'),
(3, 'Maldives', '2023-02-14', 'Leisure'),

-- Rishi Patel (User 4) - Frequent Flyer Business
(4, 'UK', '2024-11-01', 'Business'),
(4, 'UAE', '2024-09-15', 'Business'),
(4, 'US', '2024-08-10', 'Business'),
(4, 'US', '2024-06-20', 'Business'),
(4, 'UAE', '2024-04-15', 'Business'),
(4, 'Germany', '2024-03-10', 'Business'),
(4, 'Singapore', '2024-02-05', 'Business'),
(4, 'India', '2023-12-25', 'Leisure'),
(4, 'UAE', '2023-11-10', 'Business'),
(4, 'UK', '2023-09-15', 'Business'),
(4, 'Canada', '2023-07-20', 'Business'),
(4, 'Australia', '2023-05-10', 'Business');
