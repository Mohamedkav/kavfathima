-- Add status column to bookings table
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

ALTER TABLE public.bookings 
ADD COLUMN status booking_status NOT NULL DEFAULT 'pending';

-- Add index for status filtering
CREATE INDEX idx_bookings_status ON public.bookings(status);