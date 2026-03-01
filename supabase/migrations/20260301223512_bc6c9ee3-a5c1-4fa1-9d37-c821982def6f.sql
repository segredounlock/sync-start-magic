
-- Change id column from uuid to text to support prefixed IDs
ALTER TABLE admin_notifications
  ALTER COLUMN id SET DATA TYPE text
  USING id::text;

ALTER TABLE admin_notifications
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Recreate RLS policies (dropping old ones first)
DROP POLICY IF EXISTS "Admins can manage admin_notifications" ON admin_notifications;
DROP POLICY IF EXISTS "Admins can view admin_notifications" ON admin_notifications;

CREATE POLICY "Admins can manage admin_notifications"
  ON admin_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view admin_notifications"
  ON admin_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
