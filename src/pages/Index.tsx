import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const API_URL = 'https://functions.poehali.dev/729fff79-f8f6-4bdf-a875-5d762d756605';

interface DemoEntry {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export default function Index() {
  const [entries, setEntries] = useState<DemoEntry[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'status'>('demo');
  const { toast } = useToast();

  const fetchEntries = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить записи',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: 'Внимание',
        description: 'Заполните заголовок',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Запись добавлена в облачную базу',
        });
        setTitle('');
        setDescription('');
        fetchEntries();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить запись',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Удалено',
          description: 'Запись удалена из облачной базы',
        });
        fetchEntries();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить запись',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <Icon name="Database" size={32} className="text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Облачная База Данных
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Демонстрация работы с PostgreSQL через облачные функции
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={activeTab === 'demo' ? 'default' : 'outline'}
            onClick={() => setActiveTab('demo')}
            className="gap-2"
          >
            <Icon name="PenSquare" size={18} />
            Демо
          </Button>
          <Button
            variant={activeTab === 'status' ? 'default' : 'outline'}
            onClick={() => setActiveTab('status')}
            className="gap-2"
          >
            <Icon name="Activity" size={18} />
            Статус
          </Button>
        </div>

        {activeTab === 'demo' && (
          <Card className="mb-8 shadow-lg border-2 animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Plus" size={24} />
                Добавить запись
              </CardTitle>
              <CardDescription>
                Создайте новую запись в облачной базе данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Заголовок</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите заголовок..."
                    className="transition-all focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Описание</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Введите описание..."
                    rows={4}
                    className="transition-all focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full gap-2">
                  {isLoading ? (
                    <>
                      <Icon name="Loader2" size={18} className="animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={18} />
                      Сохранить в облако
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'status' && (
          <div className="space-y-4 animate-fade-in">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Database" size={24} />
                    <CardTitle>Состояние базы данных</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    <Icon name="CheckCircle2" size={16} className="mr-1 text-green-600" />
                    {entries.length} записей
                  </Badge>
                </div>
                <CardDescription>
                  Все записи из облачной PostgreSQL базы данных
                </CardDescription>
              </CardHeader>
            </Card>

            {entries.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Icon name="Inbox" size={64} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">База данных пуста</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Перейдите на вкладку Демо, чтобы добавить записи
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {entries.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className="shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in border-l-4 border-l-primary"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon name="FileText" size={20} className="text-primary" />
                            <h3 className="font-semibold text-lg">{entry.title}</h3>
                          </div>
                          {entry.description && (
                            <p className="text-muted-foreground pl-7">{entry.description}</p>
                          )}
                          <Separator className="my-2" />
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-7">
                            <Icon name="Clock" size={14} />
                            {new Date(entry.created_at).toLocaleString('ru-RU')}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
