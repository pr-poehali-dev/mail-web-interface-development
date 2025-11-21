import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import Login from './Login';
import { mailApi, type EmailCredentials } from '@/lib/mailApi';
import { useToast } from '@/hooks/use-toast';

interface Email {
  id: number;
  from: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  isStarred: boolean;
  content: string;
}

const mockEmails: Email[] = [
  {
    id: 1,
    from: 'Команда поддержки',
    subject: 'Добро пожаловать в NargizaMail!',
    preview: 'Здравствуйте! Мы рады приветствовать вас в нашем почтовом сервисе...',
    date: '10:30',
    isRead: false,
    hasAttachment: true,
    isStarred: true,
    content: 'Здравствуйте! Мы рады приветствовать вас в нашем почтовом сервисе. Этот современный веб-клиент позволит вам эффективно управлять вашей перепиской. Надеемся, что вам понравится!'
  },
  {
    id: 2,
    from: 'Николай Петров',
    subject: 'Встреча в четверг',
    preview: 'Привет! Давай обсудим проект в четверг после обеда...',
    date: '09:15',
    isRead: false,
    hasAttachment: false,
    isStarred: false,
    content: 'Привет! Давай обсудим проект в четверг после обеда. У меня есть несколько важных вопросов по текущему спринту.'
  },
  {
    id: 3,
    from: 'Рассылка новостей',
    subject: 'Еженедельный дайджест технологий',
    preview: 'Топ-5 новостей недели из мира технологий и стартапов...',
    date: 'Вчера',
    isRead: true,
    hasAttachment: false,
    isStarred: false,
    content: 'Топ-5 новостей недели из мира технологий и стартапов. Узнайте о последних трендах в разработке и инновациях.'
  },
  {
    id: 4,
    from: 'Анна Смирнова',
    subject: 'Документы для подписи',
    preview: 'Отправляю договор на согласование. Прошу ознакомиться...',
    date: '15 ноя',
    isRead: true,
    hasAttachment: true,
    isStarred: false,
    content: 'Отправляю договор на согласование. Прошу ознакомиться и отправить подписанную версию до конца недели.'
  },
  {
    id: 5,
    from: 'Банк Уведомления',
    subject: 'Выписка по счету за ноябрь',
    preview: 'Ваша ежемесячная выписка по счету готова к просмотру...',
    date: '14 ноя',
    isRead: true,
    hasAttachment: true,
    isStarred: false,
    content: 'Ваша ежемесячная выписка по счету готова к просмотру. Баланс счета на конец месяца составляет 125,430 руб.'
  }
];

const folders = [
  { name: 'Входящие', icon: 'Inbox', count: 5, id: 'inbox' },
  { name: 'Отправленные', icon: 'Send', count: 12, id: 'sent' },
  { name: 'Черновики', icon: 'FileText', count: 3, id: 'drafts' },
  { name: 'Спам', icon: 'AlertTriangle', count: 8, id: 'spam' },
  { name: 'Корзина', icon: 'Trash2', count: 0, id: 'trash' },
  { name: 'Контакты', icon: 'Users', count: null, id: 'contacts' },
  { name: 'Настройки', icon: 'Settings', count: null, id: 'settings' },
  { name: 'Календарь', icon: 'Calendar', count: null, id: 'calendar' }
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<EmailCredentials | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const authToken = localStorage.getItem('nargizamail_auth');
    if (authToken) {
      try {
        const creds = JSON.parse(authToken);
        setCredentials(creds);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('nargizamail_auth');
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && credentials) {
      loadEmails();
    }
  }, [selectedFolder, isAuthenticated, credentials]);

  const loadEmails = async () => {
    if (!credentials) return;
    
    setIsLoadingEmails(true);
    const result = await mailApi.fetchEmails(credentials, selectedFolder);
    
    if (result.success && result.emails) {
      setEmails(result.emails);
      if (result.emails.length > 0) {
        setSelectedEmail(result.emails[0]);
      }
    } else {
      toast({
        title: 'Ошибка загрузки',
        description: result.error || 'Не удалось загрузить письма',
        variant: 'destructive'
      });
    }
    setIsLoadingEmails(false);
  };

  const handleLogin = (loginCredentials: { email: string; password: string }) => {
    localStorage.setItem('nargizamail_auth', JSON.stringify(loginCredentials));
    setCredentials(loginCredentials);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('nargizamail_auth');
    setCredentials(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-purple-100 flex flex-col animate-slide-in-left">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon name="Mail" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              NargizaMail
            </h1>
          </div>
          
          <Button className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-200 transition-all hover:shadow-xl hover:scale-105">
            <Icon name="Plus" size={18} className="mr-2" />
            Написать письмо
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                  selectedFolder === folder.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'hover:bg-purple-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    name={folder.icon as any} 
                    size={18} 
                    className={`transition-transform group-hover:scale-110 ${
                      selectedFolder === folder.id ? 'text-white' : 'text-purple-500'
                    }`}
                  />
                  <span className="font-medium">{folder.name}</span>
                </div>
                {folder.count !== null && folder.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`${
                      selectedFolder === folder.id
                        ? 'bg-white/20 text-white'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {folder.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Email List */}
      <div className="w-96 bg-white/60 backdrop-blur-sm border-r border-purple-100 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-purple-100">
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Поиск писем..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 border-purple-200 focus:border-purple-400 transition-colors"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoadingEmails ? (
            <div className="flex items-center justify-center p-8">
              <Icon name="Loader2" className="animate-spin text-purple-500" size={32} />
            </div>
          ) : (
          <div className="divide-y divide-purple-100">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full p-4 text-left transition-all duration-200 hover:bg-purple-50 ${
                  selectedEmail?.id === email.id ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-500' : ''
                } ${!email.isRead ? 'font-semibold' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`${!email.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {email.from}
                    </span>
                    {email.hasAttachment && (
                      <Icon name="Paperclip" size={14} className="text-purple-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {email.isStarred && (
                      <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                    )}
                    <span className="text-xs text-gray-500">{email.date}</span>
                  </div>
                </div>
                <h3 className={`text-sm mb-1 ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {email.subject}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{email.preview}</p>
              </button>
            ))}
          </div>
          )}
        </ScrollArea>
      </div>

      {/* Email Content */}
      <div className="flex-1 bg-white/40 backdrop-blur-sm flex flex-col animate-scale-in">
        {selectedEmail ? (
          <>
            <div className="p-6 border-b border-purple-100 bg-white/60">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {selectedEmail.from[0]}
                      </div>
                      <span className="font-medium">{selectedEmail.from}</span>
                    </div>
                    <span>•</span>
                    <span>{selectedEmail.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-purple-100 transition-colors">
                    <Icon name="Reply" size={18} className="text-purple-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-100 transition-colors">
                    <Icon name="Forward" size={18} className="text-purple-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-100 transition-colors">
                    <Icon name="Trash2" size={18} className="text-purple-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-100 transition-colors">
                    <Icon name="MoreVertical" size={18} className="text-purple-600" />
                  </Button>
                </div>
              </div>
              
              {selectedEmail.hasAttachment && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Icon name="Paperclip" size={16} className="text-purple-600" />
                  <span className="text-sm text-purple-900 font-medium">Документы.pdf</span>
                  <span className="text-xs text-purple-600">(245 КБ)</span>
                  <Button variant="ghost" size="sm" className="ml-auto text-purple-600 hover:bg-purple-100">
                    <Icon name="Download" size={16} className="mr-1" />
                    Скачать
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedEmail.content}
                </p>
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-6 bg-white/60">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all">
                <Icon name="Reply" size={18} className="mr-2" />
                Ответить
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Icon name="Mail" size={64} className="mx-auto mb-4 text-purple-300" />
              <p className="text-lg">Выберите письмо для просмотра</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;