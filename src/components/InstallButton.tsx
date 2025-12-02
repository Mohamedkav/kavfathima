import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // If iOS, show the button for manual instructions
    if (ios) {
      setIsInstallable(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show button in development mode or if installable
    if (import.meta.env.DEV) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // If iOS, show instructions modal
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      toast({
        title: "Installation",
        description: "Your browser doesn't support PWA installation, or the app is already installed.",
      });
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Success!",
          description: "App installed successfully",
        });
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      toast({
        title: "Installation",
        description: "Use your browser's menu to install this app",
        variant: "destructive",
      });
    }
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // Always show if installable (includes iOS and dev mode)
  if (!isInstallable) return null;

  return (
    <>
      <Button
        onClick={handleInstallClick}
        variant="default"
        size="icon"
        className="fixed top-4 left-4 z-50 shadow-2xl h-14 w-14 rounded-full hover:scale-110 transition-transform"
        aria-label="Install app as PWA"
      >
        <Download className="h-6 w-6" />
      </Button>

      {/* iOS Installation Instructions Modal */}
      <Dialog open={showIOSInstructions} onOpenChange={setShowIOSInstructions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install KAV Fathima Wedding Hall</DialogTitle>
            <DialogDescription>
              Follow these steps to install this app on your iPhone or iPad:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <p className="text-sm">
                Tap the <strong>Share</strong> button at the bottom of your browser
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <p className="text-sm">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <p className="text-sm">
                Tap <strong>"Add"</strong> in the top right corner
              </p>
            </div>
          </div>
          <Button onClick={() => setShowIOSInstructions(false)} className="w-full">
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallButton;
