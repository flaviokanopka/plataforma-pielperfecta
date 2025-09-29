import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Settings, Trash2, Tag as TagIcon, Pencil, Check, X } from 'lucide-react';
import { useCRM, CrmCard as CrmCardType } from '@/hooks/useCRM';
import { CardModal } from '@/components/crm/CardModal';
import { CardDetailModal } from '@/components/crm/CardDetailModal';
import { CrmCard } from '@/components/crm/CrmCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CRM = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CrmCardType | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [selectedCard, setSelectedCard] = useState<CrmCardType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Tags management state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState('#3b82f6');
  const [filterTagId, setFilterTagId] = useState<'all' | string>('all');
  const {
    colunas,
    cards,
    tags,
    loading,
    createColuna,
    updateColuna,
    deleteColuna,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    createTag,
    updateTag,
    deleteTag,
    // Many-to-many helpers
    addTagToCard,
    removeTagFromCard,
    getTagsByCard,
    getCardsByColuna,
    getCardCount
  } = useCRM();

  const handleCreateCard = async (cardData: {
    nome: string;
    telefone?: string;
    tag_id?: string;
    coluna_id: string;
    data_visita?: string;
  }) => {
    if (editingCard) {
      await updateCard(editingCard.id, cardData);
      setEditingCard(null);
    } else {
      await createCard(cardData);
    }
    setIsCardModalOpen(false);
  };

  const handleEditCard = (card: CrmCardType) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleCardClick = (card: CrmCardType) => {
    setSelectedCard(card);
    setIsDetailModalOpen(true);
  };

  const handleMoveCard = async (cardId: string, direction: 'left' | 'right') => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const currentIndex = colunas.findIndex(col => col.id === card.coluna_id);
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < colunas.length) {
      const targetColuna = colunas[targetIndex];
      await moveCard(cardId, targetColuna.id);
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;
    await createColuna(newColumnName.trim());
    setNewColumnName('');
    setIsColumnModalOpen(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setNewTagColor('#3b82f6');
  };


  const filteredCards = cards.filter(card =>
    card.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (card.telefone && card.telefone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Barra de controles fixa no topo - sempre visível */}
      <div className="flex-shrink-0 bg-background border-b p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CRM - Kanban</h1>
            <p className="text-muted-foreground">
              Gerencie seus leads e vendas
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Select value={filterTagId} onValueChange={(v) => setFilterTagId(v as 'all' | string)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filtrar por tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as tags</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: tag.cor }} />
                      {tag.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isColumnModalOpen} onOpenChange={setIsColumnModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerenciar Colunas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="columnName">Nova Coluna</Label>
                    <div className="flex gap-2">
                      <Input
                        id="columnName"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="Nome da coluna"
                      />
                      <Button onClick={handleCreateColumn} disabled={!newColumnName.trim()}>
                        Criar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Colunas Existentes</Label>
                    {colunas.map((coluna) => (
                      <div key={coluna.id} className="flex items-center justify-between p-2 border rounded">
                        <span>{coluna.nome}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteColuna(coluna.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Tags
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerenciar Tags</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tagName">Nova Tag</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="tagName"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Nome da tag"
                      />
                      <Input
                        type="color"
                        aria-label="Cor da tag"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-12 p-1"
                      />
                      <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                        Criar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags Existentes</Label>
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                        {editingTagId === tag.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingTagName}
                              onChange={(e) => setEditingTagName(e.target.value)}
                              placeholder="Nome da tag"
                              className="flex-1"
                            />
                            <Input
                              type="color"
                              aria-label="Cor da tag"
                              value={editingTagColor}
                              onChange={(e) => setEditingTagColor(e.target.value)}
                              className="w-12 p-1"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: tag.cor }} />
                            <span>{tag.nome}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {editingTagId === tag.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await updateTag(tag.id, editingTagName.trim() || tag.nome, editingTagColor);
                                  setEditingTagId(null);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTagId(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTagId(tag.id);
                                setEditingTagName(tag.nome);
                                setEditingTagColor(tag.cor);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTag(tag.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={() => setIsCardModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>

      {/* Área das colunas com scroll horizontal - flex-1 para ocupar o resto da tela */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 h-full pb-4 px-4" style={{ width: 'max-content' }}>
          {colunas.map((coluna, index) => (
            <div key={coluna.id} className="flex-shrink-0 w-80 space-y-4">
              <div className="p-4 rounded-lg border-2 bg-muted/50">
                <h3 className="font-semibold text-foreground">{coluna.nome}</h3>
                <span className="text-sm text-muted-foreground">{getCardCount(coluna.id)} cards</span>
              </div>
              
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 bg-background/50 h-full relative group">
                <div className="h-full overflow-y-auto pr-2 scrollbar-thin">
                  <div className="space-y-3">
                    {getCardsByColuna(coluna.id)
                      .filter(card => {
                        const matchesSearch = card.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (card.telefone && card.telefone.includes(searchTerm));
                        const matchesTag = filterTagId === 'all' || getTagsByCard(card.id).some(t => t.id === filterTagId);
                        return matchesSearch && matchesTag;
                      })
                      .map((card) => (
                        <CrmCard
                          key={card.id}
                          card={card}
                          colunas={colunas}
                          onMoveLeft={() => handleMoveCard(card.id, 'left')}
                          onMoveRight={() => handleMoveCard(card.id, 'right')}
                          onEdit={() => handleEditCard(card)}
                          onDelete={() => deleteCard(card.id)}
                          onCardClick={() => handleCardClick(card)}
                          canMoveLeft={index > 0}
                          canMoveRight={index < colunas.length - 1}
                          tags={tags}
                          assignedTags={getTagsByCard(card.id)}
                          onToggleTag={async (tagId, isAssigned) => {
                            if (isAssigned) {
                              await removeTagFromCard(card.id, tagId);
                            } else {
                              await addTagToCard(card.id, tagId);
                            }
                          }}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleCreateCard}
        colunas={colunas}
        tags={tags}
        card={editingCard}
      />

      <CardDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCard(null);
        }}
        card={selectedCard}
        assignedTags={selectedCard ? getTagsByCard(selectedCard.id) : []}
      />
    </div>
  );
};

export default CRM;