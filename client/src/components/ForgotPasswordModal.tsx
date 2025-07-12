import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Send } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ForgotPasswordModalProps {
  children?: React.ReactNode;
}

export default function ForgotPasswordModal({ children }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest('POST', '/api/auth/forgot-password', { email });
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Email Berhasil Dikirim",
        description: "Silakan periksa email Anda untuk petunjuk reset password",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Kesalahan",
        description: error.message || "Gagal mengirim email reset password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Diperlukan",
        description: "Silakan masukkan alamat email Anda",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Format Email Salah",
        description: "Silakan masukkan alamat email yang valid",
        variant: "destructive",
      });
      return;
    }

    forgotPasswordMutation.mutate(email);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            Lupa Password?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Lupa Password
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Kami telah mengirim link reset password ke email Anda"
              : "Masukkan email Anda untuk menerima link reset password"}
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Send className="h-5 w-5" />
                <span className="font-medium">Email Berhasil Dikirim!</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Silakan periksa kotak masuk email Anda dan klik link yang dikirim untuk reset password.
              </p>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>• Periksa juga folder spam jika tidak ada di kotak masuk</p>
              <p>• Link reset password akan kedaluwarsa dalam 30 menit</p>
              <p>• Jika tidak menerima email, coba lagi dengan email yang benar</p>
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={forgotPasswordMutation.isPending}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
                disabled={forgotPasswordMutation.isPending}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={forgotPasswordMutation.isPending || !email}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Email
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}