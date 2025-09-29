import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Não precisamos mais declarar o módulo, usaremos autoTable diretamente

type ExportColumn = {
  id: string;
  label: string;
  selected: boolean;
};

type DateFilter = {
  type: 'all' | 'range' | 'last7' | 'last30' | 'thisMonth';
  startDate?: Date;
  endDate?: Date;
};

type ExportFilters = {
  dateFilter: DateFilter;
  selectedTags: string[];
  nameFilter: string;
  phoneFilter: string;
  columnFilter: string;
};

const Exportar = () => {
  const { user } = useAuth();
  const [availableColumns, setAvailableColumns] = useState<ExportColumn[]>([
    { id: 'nome', label: 'Nome', selected: true },
    { id: 'telefone', label: 'Telefone', selected: true },
    { id: 'data_visita', label: 'Data da Visita', selected: true },
    { id: 'created_at', label: 'Data de Criação', selected: false },
    { id: 'updated_at', label: 'Última Atualização', selected: false },
  ]);

  const [filters, setFilters] = useState<ExportFilters>({
    dateFilter: { type: 'all' },
    selectedTags: [],
    nameFilter: '',
    phoneFilter: '',
    columnFilter: 'all',
  });

  const [availableTags, setAvailableTags] = useState<Array<{ id: string; nome: string; cor: string }>>([]);
  const [availableColumns_, setAvailableColumns_] = useState<Array<{ id: string; nome: string }>>([]);
  const [leadCount, setLeadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Carregar tags e colunas do CRM
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Carregar tags
        const { data: tags } = await supabase
          .from('tags')
          .select('id, nome, cor')
          .eq('user_id', user.id);

        if (tags) {
          setAvailableTags(tags);
        }

        // Carregar colunas
        const { data: columns } = await supabase
          .from('crm_colunas')
          .select('id, nome')
          .eq('user_id', user.id)
          .order('ordem');

        if (columns) {
          setAvailableColumns_(columns);
        }

        // Atualizar contagem inicial
        updateLeadCount();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [user]);

  // Atualizar contagem de leads baseado nos filtros
  const updateLeadCount = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('crm_cards')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      // Aplicar filtros de data
      if (filters.dateFilter.type === 'range' && filters.dateFilter.startDate && filters.dateFilter.endDate) {
        query = query.gte('created_at', filters.dateFilter.startDate.toISOString())
                    .lte('created_at', filters.dateFilter.endDate.toISOString());
      } else if (filters.dateFilter.type === 'last7') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('created_at', sevenDaysAgo.toISOString());
      } else if (filters.dateFilter.type === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      } else if (filters.dateFilter.type === 'thisMonth') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', firstDay.toISOString());
      }

      // Aplicar filtros de texto
      if (filters.nameFilter) {
        query = query.ilike('nome', `%${filters.nameFilter}%`);
      }

      if (filters.phoneFilter) {
        query = query.ilike('telefone', `%${filters.phoneFilter}%`);
      }

      // Aplicar filtro de coluna
      if (filters.columnFilter && filters.columnFilter !== 'all') {
        query = query.eq('coluna_id', filters.columnFilter);
      }

      const { count } = await query;
      setLeadCount(count || 0);
    } catch (error) {
      console.error('Erro ao contar leads:', error);
    }
  };

  useEffect(() => {
    updateLeadCount();
  }, [filters, user]);

  const handleColumnToggle = (columnId: string) => {
    setAvailableColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, selected: !col.selected } : col
      )
    );
  };

  const handleTagToggle = (tagId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handleDateFilterChange = (type: DateFilter['type']) => {
    setFilters(prev => ({
      ...prev,
      dateFilter: { type }
    }));
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    setDateRange({ start, end });
    setFilters(prev => ({
      ...prev,
      dateFilter: {
        type: 'range',
        startDate: start,
        endDate: end
      }
    }));
  };

  const getLeadsData = async () => {
    if (!user) return [];

    try {
      const selectedCols = availableColumns.filter(col => col.selected).map(col => col.id);
      
      let query = supabase
        .from('crm_cards')
        .select(`
          id,
          nome,
          telefone,
          data_visita,
          created_at,
          updated_at,
          coluna_id,
          tag_id,
          crm_colunas!inner(nome),
          tags(nome, cor)
        `)
        .eq('user_id', user.id);

      // Aplicar todos os filtros (mesmo código do updateLeadCount)
      if (filters.dateFilter.type === 'range' && filters.dateFilter.startDate && filters.dateFilter.endDate) {
        query = query.gte('created_at', filters.dateFilter.startDate.toISOString())
                    .lte('created_at', filters.dateFilter.endDate.toISOString());
      } else if (filters.dateFilter.type === 'last7') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('created_at', sevenDaysAgo.toISOString());
      } else if (filters.dateFilter.type === 'last30') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      } else if (filters.dateFilter.type === 'thisMonth') {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        query = query.gte('created_at', firstDay.toISOString());
      }

      if (filters.nameFilter) {
        query = query.ilike('nome', `%${filters.nameFilter}%`);
      }

      if (filters.phoneFilter) {
        query = query.ilike('telefone', `%${filters.phoneFilter}%`);
      }

      if (filters.columnFilter && filters.columnFilter !== 'all') {
        query = query.eq('coluna_id', filters.columnFilter);
      }

      if (filters.selectedTags.length > 0) {
        query = query.in('tag_id', filters.selectedTags);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(lead => {
        const result: any = {};
        selectedCols.forEach(col => {
          switch (col) {
            case 'nome':
              result.Nome = lead.nome;
              break;
            case 'telefone':
              result.Telefone = lead.telefone;
              break;
            case 'data_visita':
              result['Data da Visita'] = lead.data_visita;
              break;
            case 'created_at':
              result['Data de Criação'] = format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR });
              break;
            case 'updated_at':
              result['Última Atualização'] = format(new Date(lead.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR });
              break;
          }
        });
        
        // Adicionar informações extras
        result.Coluna = lead.crm_colunas?.nome || '';
        result.Tag = lead.tags?.nome || '';
        
        return result;
      });
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast.error('Erro ao buscar dados dos leads');
      return [];
    }
  };

  const exportToCSV = async () => {
    setIsLoading(true);
    try {
      const data = await getLeadsData();
      if (data.length === 0) {
        toast.warning('Nenhum lead encontrado com os filtros aplicados');
        return;
      }

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Arquivo CSV exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar arquivo CSV');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    setIsLoading(true);
    try {
      const data = await getLeadsData();
      if (data.length === 0) {
        toast.warning('Nenhum lead encontrado com os filtros aplicados');
        return;
      }

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Leads', 14, 15);
      
      // Informações do relatório
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 25);
      doc.text(`Total de leads: ${data.length}`, 14, 30);

      // Preparar dados para a tabela
      const headers = Object.keys(data[0] || {});
      const rows = data.map(item => headers.map(header => item[header] || ''));

      // Criar tabela usando autoTable importado
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [2, 39, 54] },
        columnStyles: {
          0: { cellWidth: 'auto' },
        },
        margin: { top: 40 },
      });

      doc.save(`leads_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`);
      toast.success('Arquivo PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      dateFilter: { type: 'all' },
      selectedTags: [],
      nameFilter: '',
      phoneFilter: '',
      columnFilter: 'all',
    });
    setDateRange({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exportar Leads</h1>
          <p className="text-muted-foreground">
            Exporte seus leads do CRM com filtros personalizados
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros de Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Filtros de Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={filters.dateFilter.type === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateFilterChange('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filters.dateFilter.type === 'last7' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateFilterChange('last7')}
                >
                  Últimos 7 dias
                </Button>
                <Button
                  variant={filters.dateFilter.type === 'last30' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateFilterChange('last30')}
                >
                  Últimos 30 dias
                </Button>
                <Button
                  variant={filters.dateFilter.type === 'thisMonth' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateFilterChange('thisMonth')}
                >
                  Este mês
                </Button>
              </div>

              {filters.dateFilter.type === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.start ? format(dateRange.start, 'dd/MM/yyyy') : 'Selecionar'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.start}
                          onSelect={(date) => handleDateRangeChange(date, dateRange.end)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Data final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.end ? format(dateRange.end, 'dd/MM/yyyy') : 'Selecionar'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange.end}
                          onSelect={(date) => handleDateRangeChange(dateRange.start, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateFilterChange('range')}
                className={cn(filters.dateFilter.type === 'range' && 'bg-accent')}
              >
                Período personalizado
              </Button>
            </CardContent>
          </Card>

          {/* Filtros de Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameFilter">Filtrar por Nome</Label>
                  <Input
                    id="nameFilter"
                    placeholder="Digite o nome..."
                    value={filters.nameFilter}
                    onChange={(e) => setFilters(prev => ({ ...prev, nameFilter: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneFilter">Filtrar por Telefone</Label>
                  <Input
                    id="phoneFilter"
                    placeholder="Digite o telefone..."
                    value={filters.phoneFilter}
                    onChange={(e) => setFilters(prev => ({ ...prev, phoneFilter: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="columnFilter">Filtrar por Coluna</Label>
                <Select value={filters.columnFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, columnFilter: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as colunas</SelectItem>
                    {availableColumns_.map(column => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div>
                  <Label>Filtrar por Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant={filters.selectedTags.includes(tag.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        style={{
                          backgroundColor: filters.selectedTags.includes(tag.id) ? tag.cor : 'transparent',
                          borderColor: tag.cor,
                          color: filters.selectedTags.includes(tag.id) ? 'white' : tag.cor
                        }}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seleção de Colunas */}
          <Card>
            <CardHeader>
              <CardTitle>Colunas para Exportação</CardTitle>
              <CardDescription>
                Selecione as colunas que deseja incluir na exportação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableColumns.map(column => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={column.selected}
                      onCheckedChange={() => handleColumnToggle(column.id)}
                    />
                    <Label
                      htmlFor={column.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {column.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo e Ações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{leadCount}</div>
                <div className="text-sm text-muted-foreground">leads serão exportados</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Colunas selecionadas:</div>
                <div className="text-xs text-muted-foreground">
                  {availableColumns.filter(col => col.selected).map(col => col.label).join(', ')}
                </div>
              </div>

              {filters.selectedTags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Tags filtradas:</div>
                    <div className="flex flex-wrap gap-1">
                      {filters.selectedTags.map(tagId => {
                        const tag = availableTags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge key={tag.id} variant="outline" style={{ borderColor: tag.cor, color: tag.cor }}>
                            {tag.nome}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exportar</CardTitle>
              <CardDescription>
                Escolha o formato de exportação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={exportToCSV} 
                disabled={isLoading || leadCount === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              
              <Button 
                onClick={exportToPDF} 
                disabled={isLoading || leadCount === 0}
                variant="outline"
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>

              {leadCount === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Nenhum lead encontrado com os filtros aplicados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Exportar;