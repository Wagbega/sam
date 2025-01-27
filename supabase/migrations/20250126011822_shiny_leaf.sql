/*
  # Add Church Information Table
  
  1. New Tables
    - `church_info`
      - `id` (uuid, primary key)
      - `section` (text) - e.g., 'history', 'mission', 'vision'
      - `title` (text)
      - `content` (text)
      - `order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS church_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE church_info ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Church info is viewable by everyone" 
  ON church_info
  FOR SELECT
  TO public
  USING (true);

-- Insert initial content
INSERT INTO church_info (section, title, content, "order") VALUES
('history', 'Our History', 'Founded in 1970, Idasa Model Parish began as a small gathering of believers committed to spreading the gospel. Over the years, we have grown into a vibrant community of faith, touching countless lives through our ministry.', 1),

('mission', 'Our Mission', 'To spread the love of Christ, nurture spiritual growth, and serve our community through impactful ministry and genuine fellowship.', 2),

('vision', 'Our Vision', 'To be a beacon of hope and transformation, leading people to Christ and empowering them to live purpose-driven lives that glorify God.', 3),

('values', 'Core Values', 'Faith: Unwavering trust in God''s Word and promises
Love: Demonstrating Christ''s love in all we do
Excellence: Pursuing excellence in ministry and service
Community: Building strong, supportive relationships
Service: Serving others with humility and compassion', 4),

('leadership', 'Church Leadership', 'Our church is blessed with dedicated leaders who serve with wisdom and compassion:

• Senior Pastor: Rev. John Smith
• Associate Pastor: Rev. Sarah Johnson
• Youth Pastor: Rev. Michael Brown
• Worship Director: Mrs. Elizabeth Wilson', 5);