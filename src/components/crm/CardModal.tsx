import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrmCard, CrmColuna, Tag } from '@/hooks/useCRM';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: {
    nome: string;
    telefone?: string;
    tag_id?: string;
    coluna_id: string;
    data_visita?: string;
  }) => void;
  colunas: CrmColuna[];
  tags: Tag[];
  card?: CrmCard | null;
}

export const CardModal = ({ isOpen, onClose, onSave, colunas, tags, card }: CardModalProps) => {
  const [nome, setNome] = useState(card?.nome || '');
  const [telefone, setTelefone] = useState(card?.telefone || '');
  const [tagId, setTagId] = useState(card?.tag_id || 'none');
  const [colunaId, setColunaId] = useState(card?.coluna_id || colunas[0]?.id || '');
  const [dataVisita, setDataVisita] = useState(card?.data_visita || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !colunaId) return;

    onSave({
      nome: nome.trim(),
      telefone: telefone.trim() || undefined,
      tag_id: tagId === 'none' ? undefined : tagId,
      coluna_id: colunaId,
      data_visita: dataVisita.trim() || undefined,
    });

    // Reset form
    setNome('');
    setTelefone('');
    setTagId('none');
    setColunaId(colunas[0]?.id || '');
    setDataVisita('');
    setTipoPeca('');
    onClose();
  };

  const handleClose = () => {
    setNome(card?.nome || '');
    setTelefone(card?.telefone || '');
    setTagId(card?.tag_id || 'none');
    setColunaId(card?.coluna_id || colunas[0]?.id || '');
    setDataVisita(card?.data_visita || '');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="dataVisita">Data da Visita</Label>
            <Input
              id="dataVisita"
              value={dataVisita}
              onChange={(e) => setDataVisita(e.target.value)}
              placeholder="Ex: 15/12/2024 às 14:30"
            />
          </div>


          <div>
            <Label htmlFor="tag">Tag</Label>
            <Select value={tagId} onValueChange={setTagId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma tag</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.cor }}
                      />
                      {tag.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="coluna">Coluna *</Label>
            <Select value={colunaId} onValueChange={setColunaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma coluna" />
              </SelectTrigger>
              <SelectContent>
                {colunas.map((coluna) => (
                  <SelectItem key={coluna.id} value={coluna.id}>
                    {coluna.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {card ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};