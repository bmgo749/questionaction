import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Smartphone, Wallet, QrCode, CreditCard, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    symbol: string;
  } | null;
}

const PaymentModal = ({ isOpen, onClose, selectedPlan }: PaymentModalProps) => {
  const { t } = useLanguage();
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentMethods = [
    {
      id: "ovo",
      name: "OVO",
      icon: Smartphone,
      description: "Bayar dengan OVO",
      color: "bg-purple-500 hover:bg-purple-600",
      textColor: "text-white"
    },
    {
      id: "gopay",
      name: "GoPay",
      icon: Wallet,
      description: "Bayar dengan GoPay",
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-white"
    },
    {
      id: "dana",
      name: "DANA",
      icon: CreditCard,
      description: "Bayar dengan DANA",
      color: "bg-blue-500 hover:bg-blue-600",
      textColor: "text-white"
    },
    {
      id: "qris",
      name: "QRIS",
      icon: QrCode,
      description: "Bayar dengan QRIS",
      color: "bg-orange-500 hover:bg-orange-600",
      textColor: "text-white"
    }
  ];

  const handlePayment = async () => {
    if (!selectedPayment || !selectedPlan) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Here you would integrate with actual payment gateway
      // For now, we'll simulate a successful payment
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsProcessing(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    if (selectedPlan?.currency === 'IDR') {
      return `${symbol}${price.toLocaleString('id-ID')}`;
    }
    return `${symbol}${price}`;
  };

  if (!selectedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-900 dark:text-white">
            {isSuccess ? "Pembayaran Berhasil!" : "Pilih Metode Pembayaran"}
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Terima kasih!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Pembayaran untuk {selectedPlan.name} berhasil diproses
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Plan Summary */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {selectedPlan.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total:</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(selectedPlan.price, selectedPlan.symbol)}
                    <span className="text-sm text-gray-500 ml-1">/bulan</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Metode Pembayaran:
              </Label>
              
              <RadioGroup 
                value={selectedPayment} 
                onValueChange={setSelectedPayment}
                className="space-y-2"
              >
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div key={method.id} className="flex items-center space-x-3">
                      <RadioGroupItem 
                        value={method.id} 
                        id={method.id}
                        className="text-blue-600"
                      />
                      <Label 
                        htmlFor={method.id} 
                        className="flex items-center space-x-3 cursor-pointer flex-1 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors"
                      >
                        <div className={`p-2 rounded-full ${method.color}`}>
                          <IconComponent className={`w-5 h-5 ${method.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {method.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {method.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Payment Button */}
            <Button 
              onClick={handlePayment}
              disabled={!selectedPayment || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                `Bayar ${formatPrice(selectedPlan.price, selectedPlan.symbol)}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;