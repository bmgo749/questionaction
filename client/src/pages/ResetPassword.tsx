import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { SecureLink } from '@/components/SecureRouter';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [location] = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      return await apiRequest('POST', '/api/auth/reset-password', data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Password Reset Berhasil",
        description: "Password Anda telah berhasil diubah",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Kesalahan",
        description: error.message || "Gagal mengubah password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Token Tidak Valid",
        description: "Token reset password tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Terlalu Pendek",
        description: "Password harus minimal 6 karakter",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Tidak Cocok",
        description: "Konfirmasi password tidak sesuai",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword: password });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Token Tidak Valid</CardTitle>
              <CardDescription>
                Token reset password tidak ditemukan atau tidak valid. Silakan minta link reset password yang baru.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecureLink href="/login">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Login
                </Button>
              </SecureLink>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Password Berhasil Diubah</CardTitle>
              <CardDescription>
                Password Anda telah berhasil diperbarui. Sekarang Anda dapat login dengan password baru.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecureLink href="/login">
                <Button className="w-full">
                  Lanjut ke Login
                </Button>
              </SecureLink>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SecureLink href="/login">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Login
          </Button>
        </SecureLink>
        
        <Card className="w-full shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Masukkan password baru untuk akun Anda
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password Baru</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={resetPasswordMutation.isPending}
                />
                <p className="text-xs text-gray-500">Minimal 6 karakter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={resetPasswordMutation.isPending}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={resetPasswordMutation.isPending || !password || !confirmPassword}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengubah Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Ubah Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-xs text-center text-gray-500">
              Pastikan password baru Anda aman dan mudah diingat
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}