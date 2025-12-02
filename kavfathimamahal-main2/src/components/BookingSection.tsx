import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Phone, Mail, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const BookingSection = () => {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    reason: ""
  });
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadBookedDates = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('date')
        .gte('date', todayStr);
      
      if (!error && data) {
        const dates = data.map(booking => {
          const [year, month, day] = booking.date.split('-').map(Number);
          return new Date(year, month - 1, day);
        });
        setBookedDates(dates);
      }
    };

    loadBookedDates();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('booking-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings'
      }, () => {
        loadBookedDates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter to only show future booked dates in red
  const futureBookedDates = bookedDates.filter(bookedDate => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookedDate >= today;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.reason || !date) {
      toast({
        title: "Please fill in all fields",
        description: "All fields including date selection are required.",
        variant: "destructive"
      });
      return;
    }

    // Send booking details to WhatsApp
    const message = `*New Booking Request from KAV Fathima Mahal Website*

*Full Name:* ${formData.name}
*Phone Number:* ${formData.phone}
*Preferred Date:* ${format(date, "PPP")}
*Event Details:* ${formData.reason}

Please contact the customer to confirm the booking.`;

    const whatsappUrl = `https://wa.me/919025724686?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Booking Request Submitted!",
      description: `Thank you ${formData.name}! Your booking request has been sent via WhatsApp. We'll contact you soon to confirm your booking for ${format(date, "PPP")}.`
    });
    
    // Reset form
    setFormData({ name: "", phone: "", reason: "" });
    setDate(undefined);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section id="booking" className="py-20 px-4 hero-gradient">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="fade-in-up">
            <Card className="shadow-2xl border-0 bg-card/90 backdrop-blur-sm">
              <CardHeader className="text-center pb-8">
                <CardTitle className="font-serif text-3xl text-foreground">
                  Book Your Special Day
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Reserve your perfect date with us
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      className="border-border/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          handleInputChange("phone", value);
                        }
                      }}
                      placeholder="Enter 10 digit phone number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="border-border/50 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-border/50",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Select your wedding date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              const isBooked = bookedDates.some(bookedDate => 
                                bookedDate.getFullYear() === selectedDate.getFullYear() &&
                                bookedDate.getMonth() === selectedDate.getMonth() &&
                                bookedDate.getDate() === selectedDate.getDate()
                              );
                              
                              if (isBooked) {
                                toast({
                                  title: "Date Already Booked",
                                  description: "This date is already booked. Please choose another available date.",
                                  variant: "destructive"
                                });
                                return;
                              }
                            }
                            setDate(selectedDate);
                          }}
                          disabled={(date) => date < new Date()}
                          modifiers={{
                            booked: futureBookedDates
                          }}
                          modifiersStyles={{
                            booked: {
                              backgroundColor: 'hsl(0 84% 60%)',
                              color: 'white',
                              fontWeight: 'bold',
                              cursor: 'not-allowed'
                            }
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium">Event Details</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                      placeholder="Tell us about your wedding plans, guest count, special requirements..."
                      className="min-h-[100px] border-border/50 focus:border-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg font-medium transition-all duration-300 hover:scale-[1.02]"
                  >
                    Submit Booking Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="fade-in-up stagger-1">
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Get in Touch
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Ready to start planning your dream wedding? Contact our dedicated team 
                  and let us help you create the perfect celebration.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.location.href = 'tel:+919025724686'}>
                  <div className="flex-shrink-0 w-12 h-12 rose-gold-gradient rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p className="text-muted-foreground hover:text-primary transition-colors">+91 9025724686</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.location.href = 'mailto:mohamedkav5@gmail.com?subject=Wedding Inquiry - KAV Fathima Mahal'}>
                  <div className="flex-shrink-0 w-12 h-12 rose-gold-gradient rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-muted-foreground hover:text-primary transition-colors">mohamedkav5@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=KAV+Fathima+Mahal+Keelapatti+road+Inamkulathur+Trichy', '_blank')}>
                  <div className="flex-shrink-0 w-12 h-12 rose-gold-gradient rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-muted-foreground hover:text-primary transition-colors">KAV Fathima Mahal<br />Keelapatti road, Inamkulathur, Trichy</p>
                  </div>
                </div>

                {/* Portfolio Link */}
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.open('https://portfolio-v1-theta-rust.vercel.app/', '_blank')}>
                  <div className="flex-shrink-0 w-12 h-12 rose-gold-gradient rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <button
                      onClick={() => window.open('https://portfolio-v1-theta-rust.vercel.app/', '_blank')}
                      className="font-medium text-foreground hover:text-primary transition-colors duration-300"
                    >
                      Developer
                    </button>
                    <p className="text-muted-foreground">View our developer's details</p>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-6">
                  <h4 className="font-serif text-xl font-semibold text-foreground mb-3">
                    Why Choose Us?
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Personalized wedding coordination</li>
                    <li>• Flexible packages to fit your budget</li>
                    <li>• Award-winning catering services</li>
                    <li>• Complimentary venue decorations</li>
                    <li>• Professional photography partnerships</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;