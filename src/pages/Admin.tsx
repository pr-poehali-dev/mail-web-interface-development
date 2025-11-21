import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface MailAccount {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  quota_mb: number;
  created_at: string;
}

const Admin = () => {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const mockAccounts: MailAccount[] = [
      { id: 1, email: 'admin@nargizamail.ru', full_name: 'Администратор', is_active: true, quota_mb: 2048, created_at: '2024-01-15' },
      { id: 2, email: 'support@nargizamail.ru', full_name: 'Поддержка', is_active: true, quota_mb: 1024, created_at: '2024-01-20' },
      { id: 3, email: 'info@nargizamail.ru', full_name: 'Информация', is_active: true, quota_mb: 1024, created_at: '2024-02-01' }
    ];
    setAccounts(mockAccounts);
    setStats({
      total: mockAccounts.length,
      active: mockAccounts.filter(a => a.is_active).length,
      inactive: mockAccounts.filter(a => !a.is_active).length
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Почтовая CMS
              </h1>
              <p className="text-gray-600">Управление почтовыми ящиками nargizamail.ru</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Icon name="Plus" size={18} className="mr-2" />
              Создать ящик
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            <Card className="border-purple-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Всего ящиков</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Icon name="Mail" className="text-purple-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Активных</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon name="CheckCircle" className="text-green-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Неактивных</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.inactive}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Icon name="XCircle" className="text-orange-600" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-purple-100 shadow-xl animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Почтовые ящики</CardTitle>
                <CardDescription>Управление всеми почтовыми аккаунтами домена</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Поиск..." className="w-64" />
                <Button variant="outline">
                  <Icon name="Search" size={18} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="accounts" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="accounts">Ящики</TabsTrigger>
                <TabsTrigger value="domains">Домены</TabsTrigger>
                <TabsTrigger value="aliases">Псевдонимы</TabsTrigger>
                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>

              <TabsContent value="accounts" className="mt-6">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Квота</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Создан</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id} className="hover:bg-purple-50 transition-colors">
                          <TableCell className="font-medium">{account.email}</TableCell>
                          <TableCell>{account.full_name}</TableCell>
                          <TableCell>{account.quota_mb} МБ</TableCell>
                          <TableCell>
                            {account.is_active ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                Активен
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Неактивен</Badge>
                            )}
                          </TableCell>
                          <TableCell>{account.created_at}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon">
                                <Icon name="Edit" size={16} className="text-purple-600" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Icon name="Key" size={16} className="text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Icon name="Trash2" size={16} className="text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="domains" className="mt-6">
                <div className="text-center py-12">
                  <Icon name="Globe" size={48} className="mx-auto mb-4 text-purple-300" />
                  <h3 className="text-xl font-semibold mb-2">Управление доменами</h3>
                  <p className="text-gray-600 mb-4">Здесь будет управление доменами</p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить домен
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="aliases" className="mt-6">
                <div className="text-center py-12">
                  <Icon name="AtSign" size={48} className="mx-auto mb-4 text-purple-300" />
                  <h3 className="text-xl font-semibold mb-2">Псевдонимы и пересылка</h3>
                  <p className="text-gray-600 mb-4">Настройка алиасов и автопересылки писем</p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Создать псевдоним
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Настройки сервера</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">IMAP сервер</label>
                          <Input value="imap.reg.ru" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">IMAP порт</label>
                          <Input value="993" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">SMTP сервер</label>
                          <Input value="smtp.reg.ru" readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">SMTP порт</label>
                          <Input value="465" readOnly />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
