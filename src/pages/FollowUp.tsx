import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MessageSquare, Clock, Settings, Save, Edit, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
const FollowUp = () => {
  // Tipos para Follow Up
  type FollowUpRow = {
    id: string;
    user_id: string;
    idx: number;
    nome: string;
    delay_value: number;
    delay_unit: 'minutes' | 'days';
    ativo: boolean;
    mensagem: string;
  };
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [followUps, setFollowUps] = useState<FollowUpRow[]>([]);
  useEffect(() => {
    document.title = 'Follow Up | Configurações';
  }, []);
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const {
        data,
        error
      } = await supabase.from('follow_ups').select('*').order('idx', {
        ascending: true
      });
      if (error) {
        console.error('Erro ao carregar follow ups', error);
        return;
      }
      if (!data || data.length === 0) {
        const defaults = [1, 2, 3, 4].map(i => ({
          user_id: user.id,
          idx: i,
          nome: `Follow up ${i}`,
          delay_value: i === 1 ? 1 : i === 2 ? 2 : i === 3 ? 7 : 15,
          delay_unit: 'days' as const,
          ativo: true,
          mensagem: 'Edite sua mensagem personalizada'
        }));
        const {
          data: inserted,
          error: insertError
        } = await supabase.from('follow_ups').insert(defaults).select('*').order('idx', {
          ascending: true
        });
        if (insertError) {
          console.error('Erro ao criar defaults', insertError);
          return;
        }
        setFollowUps(inserted as FollowUpRow[]);
      } else {
        setFollowUps(data as FollowUpRow[]);
      }
    };
    load();
  }, [user]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpRow | null>(null);
  const [tempFollowUp, setTempFollowUp] = useState<FollowUpRow | null>(null);
  const handleEdit = (followUp: FollowUpRow) => {
    setSelectedFollowUp(followUp);
    setTempFollowUp({
      ...followUp
    });
    setIsModalOpen(true);
  };
  const handleSave = async () => {
    if (tempFollowUp && user) {
      const {
        id,
        mensagem,
        delay_value,
        delay_unit
      } = tempFollowUp;
      const {
        error
      } = await supabase.from('follow_ups').update({
        mensagem,
        delay_value,
        delay_unit,
        updated_at: new Date().toISOString()
      }).eq('id', id).eq('user_id', user.id);
      if (error) {
        console.error('Erro ao salvar', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Tente novamente.',
          variant: 'destructive'
        });
        return;
      }
      setFollowUps(prev => prev.map(f => f.id === id ? {
        ...f,
        mensagem,
        delay_value,
        delay_unit
      } : f));
      handleCloseModal();
      toast({
        title: 'Salvo',
        description: 'Follow up atualizado com sucesso.'
      });
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFollowUp(null);
    setTempFollowUp(null);
  };
  const toggleActive = async (id: string) => {
    const current = followUps.find(f => f.id === id);
    if (!current || !user) return;
    const novo = !current.ativo;
    // otimista
    setFollowUps(prev => prev.map(f => f.id === id ? {
      ...f,
      ativo: novo
    } : f));
    const {
      error
    } = await supabase.from('follow_ups').update({
      ativo: novo,
      updated_at: new Date().toISOString()
    }).eq('id', id).eq('user_id', user.id);
    if (error) {
      console.error('Erro ao atualizar status', error);
      // rollback
      setFollowUps(prev => prev.map(f => f.id === id ? {
        ...f,
        ativo: !novo
      } : f));
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      });
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Follow Up</h1>
          <p className="text-muted-foreground">
            Configure mensagens automáticas para seus clientes
          </p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Follow-up</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {followUps.map(followUp => <TableRow key={followUp.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Follow up {followUp.idx}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {followUp.delay_value}{' '}
                    {followUp.delay_unit === 'minutes' ? `minuto${followUp.delay_value !== 1 ? 's' : ''}` : `dia${followUp.delay_value !== 1 ? 's' : ''}`}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={followUp.ativo} onCheckedChange={() => toggleActive(followUp.id)} />
                    <Badge variant={followUp.ativo ? 'default' : 'secondary'}>
                      {followUp.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate text-sm text-muted-foreground">
                    {followUp.mensagem}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(followUp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>

      {/* Modal lateral para edição */}
      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {selectedFollowUp ? `Editar Follow up ${selectedFollowUp.idx}` : 'Editar Follow-up'}
            </SheetTitle>
          </SheetHeader>

          {tempFollowUp && <div className="space-y-6 mt-6">
              {/* Configuração de delay */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Configuração de Envio
                </h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Enviar após:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" min={0} value={tempFollowUp.delay_value} onChange={e => setTempFollowUp({
                ...tempFollowUp,
                delay_value: parseInt(e.target.value || '0', 10)
              })} className="w-20" />
                  <Select value={tempFollowUp.delay_unit} onValueChange={(val: 'minutes' | 'days') => setTempFollowUp({
                ...tempFollowUp,
                delay_unit: val
              })}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">minutos</SelectItem>
                      <SelectItem value="days">dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mensagem */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Mensagem Personalizada
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="mensagem" className="text-sm font-medium">
                    Mensagem:
                  </Label>
                  <Textarea id="mensagem" value={tempFollowUp.mensagem} onChange={e => setTempFollowUp({
                ...tempFollowUp,
                mensagem: e.target.value
              })} rows={6} placeholder="Digite sua mensagem personalizada..." />
                  
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>}
        </SheetContent>
      </Sheet>
    </div>;
};
export default FollowUp;