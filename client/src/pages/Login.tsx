
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, ArrowLeft, KeyRound } from "lucide-react";
import { SecureLink } from "@/components/SecureRouter";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

export default function Login() {

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDiscordLogin = () => {
    window.location.href = 'https://discord.com/oauth2/authorize?client_id=1344311791177564202&response_type=code&redirect_uri=https%3A%2F%2Fqueit.site%2F&scope=identify+email';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SecureLink href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </SecureLink>
        
        <Card className="w-full shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-xl">Q</span>
            </div>
            <CardTitle className="text-2xl font-bold">Masuk ke Queit</CardTitle>
            <CardDescription>
              Pilih metode login untuk mengakses platform pengetahuan kami
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              variant="outline" 
              className="w-full h-12 text-left justify-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="flex-1">
                <div className="font-medium">Lanjutkan dengan Google</div>
                <div className="text-sm text-gray-500">Masuk menggunakan akun Google Anda</div>
              </div>
            </Button>

            <Button 
              onClick={handleDiscordLogin}
              variant="outline" 
              className="w-full h-12 text-left justify-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="w-5 h-5 bg-indigo-500 rounded flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Lanjutkan dengan Discord</div>
                <div className="text-sm text-gray-500">Masuk menggunakan akun Discord Anda</div>
              </div>
            </Button>

            <div className="mt-6 text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>Email konfirmasi akan dikirim setelah pendaftaran</span>
              </div>
              
              <ForgotPasswordModal>
                <Button 
                  variant="ghost" 
                  className="w-full h-10 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Lupa Password? Reset di sini
                </Button>
              </ForgotPasswordModal>
            </div>

            <div className="mt-6 text-xs text-center text-gray-500">
              Dengan masuk, Anda setuju dengan{" "}
              <a href="#" className="underline hover:text-gray-700">
                Syarat Layanan
              </a>{" "}
              dan{" "}
              <a href="#" className="underline hover:text-gray-700">
                Kebijakan Privasi
              </a>{" "}
              kami
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}