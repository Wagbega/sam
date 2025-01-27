-- Add FM Mode stream
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM live_streams WHERE name = 'FM Mode') THEN
    INSERT INTO live_streams (name, url, description, is_active) VALUES
    ('FM Mode', 'https://example.com/fm-stream.mp3', 'Live audio feed from our FM radio station', true);
  END IF;
END $$;