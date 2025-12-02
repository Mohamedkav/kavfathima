import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "./CalendarSection";
import { supabase } from "@/integrations/supabase/client";

interface AdminBookingDialogProps {
  isScrolled: boolean;
  editingBooking?: Booking | null;
  onClose?: () => void;
  onComplete?: () => void;
}

const AdminBookingDialog = ({ isScrolled, editingBooking, onClose, onComplete }: AdminBookingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadBookedDates = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('date, id')
        .gte('date', todayStr);
      
      if (!error && data) {
        const dates = data
          .filter(booking => !editingBooking || booking.id !== editingBooking.id)
          .map(booking => {
            const [year, month, day] = booking.date.split('-').map(Number);
            return new Date(year, month - 1, day);
          });
        setBookedDates(dates);
      }
    };

    loadBookedDates();
  }, [editingBooking]);

  useEffect(() => {
    if (editingBooking) {
      setOpen(true);
      // Parse date as local date to avoid timezone issues
      const [year, month, day] = editingBooking.date.split('-').map(Number);
      setDate(new Date(year, month - 1, day));
      setCustomerName(editingBooking.customerName);
      setPhone(editingBooking.phone);
      setEventType(editingBooking.eventType);
      setNotes(editingBooking.notes || "");
    }
  }, [editingBooking]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.getFullYear() === date.getFullYear() &&
      bookedDate.getMonth() === date.getMonth() &&
      bookedDate.getDate() === date.getDate()
    );
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isDateBooked(selectedDate)) {
      toast({
        title: "Date Already Booked",
        description: "This date is already booked. Please select another date.",
        variant: "destructive"
      });
      return;
    }
    setDate(selectedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !customerName || !phone || !eventType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Format date as local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    try {
      if (editingBooking) {
        // Update existing booking using id
        const { error } = await supabase
          .from('bookings')
          .update({
            date: dateStr,
            customer_name: customerName,
            phone: phone,
            event_type: eventType,
            notes: notes
          })
          .eq('id', editingBooking.id);

        if (error) throw error;
        
        toast({
          title: "Booking Updated",
          description: `Booking for ${customerName} has been updated.`
        });
      } else {
        // Check if date is already booked (only for new bookings)
        const { data: existingBookings, error: checkError } = await supabase
          .from('bookings')
          .select('id')
          .eq('date', dateStr);

        if (checkError) throw checkError;

        if (existingBookings && existingBookings.length > 0) {
          toast({
            title: "Date Already Booked",
            description: "This date is already booked. Please choose another date.",
            variant: "destructive"
          });
          return;
        }

        // Insert new booking
        const { error } = await supabase
          .from('bookings')
          .insert({
            date: dateStr,
            customer_name: customerName,
            phone: phone,
            event_type: eventType,
            notes: notes
          });

        if (error) throw error;

        toast({
          title: "Booking Created",
          description: `Booking for ${customerName} on ${format(date, "PPP")} has been created.`
        });
      }

      // Reset form
      setDate(undefined);
      setCustomerName("");
      setPhone("");
      setEventType("");
      setNotes("");
      setOpen(false);
      
      if (onClose) onClose();
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: "Error",
        description: "Failed to save booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen && onClose) onClose();
    }}>
      {!editingBooking && (
        <DialogTrigger asChild>
          <button
            className={`font-medium transition-colors duration-300 ${
              isScrolled 
                ? "text-foreground" 
                : "text-white"
            }`}
          >
            Create Booking
          </button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBooking ? "Edit Booking" : "Create New Booking"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(checkDate) => {
                    // Disable past dates and booked dates
                    return checkDate < new Date() || isDateBooked(checkDate);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <Input
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g., Wedding, Birthday"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requirements or notes"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingBooking ? "Update Booking" : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBookingDialog;
