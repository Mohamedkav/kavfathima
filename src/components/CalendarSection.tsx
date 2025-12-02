import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  eventType: string;
  notes: string;
}

const CalendarSection = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription for booking changes
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          // Reload bookings when any change occurs
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        const formattedBookings = data.map(booking => ({
          id: booking.id,
          date: booking.date,
          customerName: booking.customer_name,
          phone: booking.phone,
          eventType: booking.event_type,
          notes: booking.notes || ""
        }));
        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const getBookedDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings
      .map(booking => new Date(booking.date))
      .filter(date => date >= today);
  };

  const handleDateClick = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const booking = bookings.find(b => b.date === dateStr);
    
    if (booking) {
      setSelectedBooking(booking);
      setShowBookingDetails(true);
    }
    setDate(selectedDate);
  };

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 fade-in-up">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Check Availability
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a date to check availability for your special event
          </p>
        </div>

        {/* Calendar */}
        <div className="flex flex-col items-center gap-4">
          <Card className="p-8 shadow-lg">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateClick}
              className="pointer-events-auto"
              disabled={(date) => date < new Date()}
              modifiers={{
                booked: getBookedDates()
              }}
              modifiersStyles={{
                booked: {
                  backgroundColor: 'hsl(0 84% 60%)',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
          </Card>
          <p className="text-sm text-muted-foreground">
            * The dates in <span className="text-red-500 font-semibold">Red</span> are booked
          </p>
        </div>
      </div>

      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">{new Date(selectedBooking.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                <p className="text-base">{selectedBooking.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{selectedBooking.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                <p className="text-base">{selectedBooking.eventType}</p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-base">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CalendarSection;
