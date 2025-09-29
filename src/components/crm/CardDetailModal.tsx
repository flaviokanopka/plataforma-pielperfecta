import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CrmCard, Tag as TagType } from '@/hooks/useCRM';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Phone, Tag, Clock, User } from 'lucide-react';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CrmCard | null;
  assignedTags: TagType[];
}

export const CardDetailModal = ({ isOpen, onClose, card, assignedTags }: CardDetailModalProps) => {
  if (!card) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {card.nome}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Informações Básicas
            </h3>
            
            {card.telefone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{card.telefone}</span>
              </div>
            )}
            
            {card.data_visita && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{card.data_visita}</span>
              </div>
            )}
            
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Criado em {format(new Date(card.created_at), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {assignedTags.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {assignedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-sm"
                      style={{ backgroundColor: tag.cor, color: '#ffffff' }}
                    >
                      {tag.nome}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
};
