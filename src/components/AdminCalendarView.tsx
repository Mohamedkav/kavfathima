import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search } from "lucide-react";
import AdminBookingDialog from "./AdminBookingDialog";
import { toast } from "@/hooks/use-toast";
import type { Booking } from "./CalendarSection";
import { supabase } from "@/integrations/supabase/client";

interface AdminCalendarViewProps {
  isScrolled: boolean;
}

const AdminCalendarView = ({ isScrolled }: AdminCalendarViewProps) => {
  const [open, setOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (open) {
      loadBookings();
    }
  }, [open]);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true });
      
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

  const confirmDelete = async () => {
    if (!deleteBooking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', deleteBooking.id);

      if (error) throw error;

      toast({
        title: "Booking Deleted",
        description: "The booking has been successfully deleted.",
      });
      
      setDeleteBooking(null);
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Error",
        description: "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter out past bookings (they are auto-deleted from DB, but filter for safety)
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return false;
    }
    
    const matchesSearch = searchTerm === "" || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.notes && booking.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = dateFilter === "" || booking.date === dateFilter;
    
    return matchesSearch && matchesDate;
  });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
  };

  const handleBookingComplete = () => {
    loadBookings();
    setEditingBooking(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className={`font-medium transition-colors duration-300 ${
              isScrolled 
                ? "text-foreground" 
                : "text-white"
            }`}
          >
            View Bookings
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Bookings - Admin View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, event type, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input
                type="date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            {filteredBookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {bookings.length === 0 ? "No bookings yet" : "No bookings match your search"}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredBookings.map((booking, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                        <p className="text-base font-semibold">{new Date(booking.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                        <p className="text-base">{booking.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base">{booking.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                        <p className="text-base">{booking.eventType}</p>
                      </div>
                      {booking.notes && (
                        <div className="col-span-2 md:col-span-3">
                          <p className="text-sm font-medium text-muted-foreground">Notes</p>
                          <p className="text-base">{booking.notes}</p>
                        </div>
                      )}
                      <div className="col-span-2 md:col-span-3 flex gap-2 justify-end pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(booking)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteBooking(booking)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {editingBooking && (
        <AdminBookingDialog
          isScrolled={isScrolled}
          editingBooking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onComplete={handleBookingComplete}
        />
      )}

      <AlertDialog open={!!deleteBooking} onOpenChange={(open) => !open && setDeleteBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the booking for <strong>{deleteBooking?.customerName}</strong> on{" "}
              <strong>{deleteBooking && new Date(deleteBooking.date).toLocaleDateString()}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminCalendarView;
