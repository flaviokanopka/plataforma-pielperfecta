import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Edit, Trash2, Tag as TagIcon, Calendar } from 'lucide-react';
import { CrmCard as CrmCardType, CrmColuna, Tag as TagType } from '@/hooks/useCRM';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface CrmCardProps {
  card: CrmCardType;
  colunas: CrmColuna[];
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCardClick: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  tags: TagType[]; // all available tags
  assignedTags: TagType[]; // tags assigned to this card
  onToggleTag: (tagId: string, isAssigned: boolean) => void | Promise<void>;
}

export const CrmCard = ({
  card,
  colunas,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
  onCardClick,
  canMoveLeft,
  canMoveRight,
  tags,
  assignedTags,
  onToggleTag,
}: CrmCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group" onClick={onCardClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{card.nome}</CardTitle>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft();
              }}
              disabled={!canMoveLeft}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight();
              }}
              disabled={!canMoveRight}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  aria-label="Atribuir tag"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TagIcon className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-50 w-56 p-2 bg-background" align="end">
                <div className="space-y-1">
                  {tags.map((tag) => {
                    const checked = assignedTags.some(t => t.id === tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted"
                        onClick={() => onToggleTag(tag.id, checked)}
                      >
                        <Checkbox checked={checked} className="h-3 w-3 pointer-events-none" />
                        <span
                          className="inline-block h-3 w-3 rounded"
                          style={{ backgroundColor: tag.cor }}
                        />
                        <span className="text-sm">{tag.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {card.telefone && (
          <p className="text-xs text-muted-foreground mb-2">
            📞 {card.telefone}
          </p>
        )}
        
        {card.data_visita && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {card.data_visita}
          </p>
        )}
        
        {assignedTags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {assignedTags.map((t) => (
              <Badge
                key={t.id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: t.cor, color: '#ffffff' }}
              >
                {t.nome}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {format(new Date(card.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};