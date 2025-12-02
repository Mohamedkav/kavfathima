-- Drop status column and related objects
DROP INDEX IF EXISTS idx_bookings_status;
ALTER TABLE public.bookings DROP COLUMN IF EXISTS status;
DROP TYPE IF EXISTS booking_status;

-- Create function to delete past bookings
CREATE OR REPLACE FUNCTION delete_past_bookings()
RETURNS void AS $$
BEGIN
  DELETE FROM public.bookings
  WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically delete past bookings daily
-- Note: This runs whenever any booking is accessed, which keeps the table clean
CREATE OR REPLACE FUNCTION cleanup_past_bookings_trigger()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.bookings WHERE date < CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_past_bookings ON public.bookings;
CREATE TRIGGER trigger_cleanup_past_bookings
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_past_bookings_trigger();