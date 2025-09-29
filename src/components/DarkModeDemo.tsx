import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  Heart, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

export function DarkModeDemo() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Modo Escuro Moderno</h1>
        <p className="text-muted-foreground text-lg">
          Design profissional com tons de cinza e preto
        </p>
      </div>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Cards e Componentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Card Moderno
              </CardTitle>
              <CardDescription>
                Card com efeito glass e hover elegante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este card demonstra o novo esquema de cores do modo escuro.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Dados importantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex gap-2">
                <Badge variant="secondary">Ativo</Badge>
                <Badge variant="outline">Premium</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Preferências do usuário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notificações</Label>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Tema</Label>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Botões e Interações</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="btn-modern">Botão Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destrutivo</Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm" className="btn-modern">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </section>

      {/* Forms Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Formulários</h2>
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Exemplo</CardTitle>
            <CardDescription>Demonstração de inputs no modo escuro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Digite seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Input id="message" placeholder="Digite sua mensagem" />
            </div>
            <div className="flex gap-2">
              <Button className="btn-modern">Enviar</Button>
              <Button variant="outline">Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Alerts Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Alertas e Notificações</h2>
        <div className="space-y-4">
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              Este é um alerta padrão no modo escuro.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <Heart className="h-4 w-4" />
            <AlertDescription>
              Alerta de erro com cores apropriadas para o modo escuro.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Status Indicators */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Indicadores de Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
              <Eye className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Ativo</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <EyeOff className="h-6 w-6 text-secondary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Inativo</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto">
              <Settings className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Configuração</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Notificação</p>
          </div>
        </div>
      </section>
    </div>
  );
}
