import { useState } from 'react';
import { mailApi } from '@/lib/mailApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LoginProps {
  onLogin: (credentials: { email: string; password: string }) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await mailApi.authenticate({ email, password });
    
    if (result.success) {
      toast({
        title: 'Успешный вход',
        description: 'Вы успешно авторизовались'
      });
      onLogin({ email, password });
    } else {
      toast({
        title: 'Ошибка авторизации',
        description: result.error || 'Неверный email или пароль',
        variant: 'destructive'
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-200">
            <Icon name="Mail" className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            NargizaMail
          </h1>
          <p className="text-gray-600">Войдите в свой почтовый аккаунт</p>
        </div>

        <Card className="border-purple-100 shadow-xl shadow-purple-100/50 backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl">Вход</CardTitle>
            <CardDescription>Введите данные вашей почты на рег.ру</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email адрес</Label>
                <div className="relative">
                  <Icon name="Mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ваша-почта@nargizamail.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-purple-200 focus:border-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Icon name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white border-purple-200 focus:border-purple-400 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-600">Запомнить меня</span>
                </label>
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  Забыли пароль?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200 transition-all hover:shadow-xl hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={18} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-purple-100">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Настройки подключения
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-900 mb-1">IMAP сервер</div>
                    <div className="text-purple-600">imap.reg.ru:993</div>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <div className="font-semibold text-pink-900 mb-1">SMTP сервер</div>
                    <div className="text-pink-600">smtp.reg.ru:465</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Безопасное подключение через SSL/TLS
        </p>
      </div>
    </div>
  );
};

export default Login;