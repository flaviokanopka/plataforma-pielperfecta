import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Tag,
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LineChart,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [cardsData, setCardsData] = useState<any[]>([]);
  const [totalCards, setTotalCards] = useState<number | null>(null);
  const [colunas, setColunas] = useState<Array<{ id: string; nome: string }>>([]);
  const [countsByColuna, setCountsByColuna] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topTags, setTopTags] = useState<Array<{ id: string; nome: string; cor: string; count: number }>>([]);
  const [cardsWithTagCount, setCardsWithTagCount] = useState<number>(0);
  const [cardsCreatedThisWeek, setCardsCreatedThisWeek] = useState<number>(0);
  const [cardsCreatedThisMonth, setCardsCreatedThisMonth] = useState<number>(0);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<Array<{ label: string; value: number }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ date: string; label: string; value: number }>>([]);
  const [weekRangeLabel, setWeekRangeLabel] = useState<string>('');
  const [monthRangeLabel, setMonthRangeLabel] = useState<string>('');
  const [weeklyChartType, setWeeklyChartType] = useState<'bar' | 'line'>('bar');
  const [monthlyChartType, setMonthlyChartType] = useState<'bar' | 'line'>('bar');
  const [qualifiedChartType, setQualifiedChartType] = useState<'bar' | 'line'>('line');
  const [qualifiedMonthOffset, setQualifiedMonthOffset] = useState<number>(0);
  const [qualifiedMonthlyData, setQualifiedMonthlyData] = useState<Array<{ date: string; label: string; value: number }>>([]);
  const [qualifiedCards, setQualifiedCards] = useState<any[]>([]);
  const [qualifiedMonthRangeLabel, setQualifiedMonthRangeLabel] = useState<string>('');
  const [hourlyData, setHourlyData] = useState<Array<{ hour: string; value: number; fill: string }>>([]);

  const getWeekRange = (offset: number) => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - distanceToMonday - offset * 7);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    
    return { start, end, label: `${start.toLocaleDateString('pt-BR')} - ${new Date(end.getTime() - 1).toLocaleDateString('pt-BR')}` };
  };

  const getMonthRange = (offset: number) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const label = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return { start, end, label };
  };

  const getWeeklyCounts = (data: any[], offset: number) => {
    const { start, end } = getWeekRange(offset);
    const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const counts = labels.map(() => 0);

    data.forEach((card) => {
      if (!card.created_at) return;
      const createdAt = new Date(card.created_at);
      if (Number.isNaN(createdAt.getTime())) return;
      if (createdAt >= start && createdAt < end) {
        const adjustedDay = (createdAt.getDay() + 6) % 7;
        counts[adjustedDay] += 1;
      }
    });

    return labels.map((label, index) => ({ label, value: counts[index] }));
  };

  const getMonthlyCounts = (data: any[], offset: number) => {
    const { start, end } = getMonthRange(offset);
    const map = new Map<string, number>();

    data.forEach((card) => {
      if (!card.created_at) return;
      const createdAt = new Date(card.created_at);
      if (Number.isNaN(createdAt.getTime())) return;
      if (createdAt >= start && createdAt < end) {
        // Usar um formato local para evitar problemas de fuso horário (YYYY-MM-DD)
        const year = createdAt.getFullYear();
        const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
        const day = createdAt.getDate().toString().padStart(2, '0');
        const key = `${year}-${month}-${day}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    });

    return Array.from(map.entries())
      .map(([date, value]) => ({
        date,
        // Ao criar a data para o label, especificar o fuso horário UTC para consistência
        label: new Date(`${date}T00:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' }),
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  useEffect(() => {
    const { label } = getWeekRange(weekOffset);
    setWeekRangeLabel(label);
    setWeeklyData(getWeeklyCounts(cardsData, weekOffset));
  }, [cardsData, weekOffset]);

  useEffect(() => {
    const { label } = getMonthRange(monthOffset);
    setMonthRangeLabel(label);
    setMonthlyData(getMonthlyCounts(cardsData, monthOffset));
  }, [cardsData, monthOffset]);

  useEffect(() => {
    const { label } = getMonthRange(qualifiedMonthOffset);
    setQualifiedMonthRangeLabel(label);
    setQualifiedMonthlyData(getMonthlyCounts(qualifiedCards, qualifiedMonthOffset));
  }, [qualifiedCards, qualifiedMonthOffset]);

  // SEO basics for this page
  useEffect(() => {
    document.title = 'Dashboard CRM - Visão Geral';
    const metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement | null;
    if (metaDesc) {
      metaDesc.content = 'Dashboard CRM com totais de clientes e funil por colunas (follow-up).';
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Dashboard CRM com totais de clientes e funil por colunas (follow-up).';
      document.head.appendChild(m);
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Buscar dados em paralelo para melhor performance
        const [
          colunasRes,
          cardsRes,
          tagsRes,
          cardTagsRes,
        ] = await Promise.all([
          supabase
            .from('crm_colunas')
            .select('id, nome, ordem')
            .eq('user_id', user.id)
            .order('ordem', { ascending: true }),
          supabase
            .from('crm_cards')
            .select('id, nome, telefone, coluna_id, created_at, data_visita, tag_id')
            .eq('user_id', user.id),
          supabase.from('tags').select('id, nome, cor').eq('user_id', user.id),
          supabase.from('crm_card_tags').select('card_id, tag_id').eq('user_id', user.id),
        ]);
        
        if (colunasRes.error) throw colunasRes.error;
        if (cardsRes.error) throw cardsRes.error;
        if (tagsRes.error) throw tagsRes.error;
        if (cardTagsRes.error) throw cardTagsRes.error;

        const cols = colunasRes.data || [];
        setColunas(cols.map((c: any) => ({ id: c.id, nome: c.nome })));

        const cards = cardsRes.data || [];
        setCardsData(cards);
        setTotalCards(cards.length);

        const counts: Record<string, number> = {};
        cards.forEach((card: any) => {
          if (!card.coluna_id) return;
          counts[card.coluna_id] = (counts[card.coluna_id] || 0) + 1;
        });
        setCountsByColuna(counts);

        const tags = tagsRes.data || [];
        const cardTags = cardTagsRes.data || [];


        // Calcular cards da semana atual (mesma lógica do gráfico)
        const { start: weekStart, end: weekEnd } = getWeekRange(0);
        const cardsWeek = cards.filter((card: any) => {
          if (!card.created_at) return false;
          const createdAt = new Date(card.created_at);
          return !Number.isNaN(createdAt.getTime()) && createdAt >= weekStart && createdAt < weekEnd;
        }).length;
        setCardsCreatedThisWeek(cardsWeek);

        // Calcular cards do mês atual (mesma lógica do gráfico)
        const { start: monthStart, end: monthEnd } = getMonthRange(0);
        const cardsMonth = cards.filter((card: any) => {
          if (!card.created_at) return false;
          const createdAt = new Date(card.created_at);
          return !Number.isNaN(createdAt.getTime()) && createdAt >= monthStart && createdAt < monthEnd;
        }).length;
        setCardsCreatedThisMonth(cardsMonth);

        const tagCoverageSet = new Set<string>();
        cards.forEach((card: any) => {
          if (card.tag_id) {
            tagCoverageSet.add(card.id);
          }
        });
        cardTags.forEach((relation: any) => {
          if (relation.card_id) {
            tagCoverageSet.add(relation.card_id);
          }
        });
        setCardsWithTagCount(tagCoverageSet.size);

        // Filtrar cards da coluna "Qualificados"
        const qualificadosColuna = cols.find((c: any) => c.nome.toLowerCase().includes('qualificados'));
        if (qualificadosColuna) {
          const filteredCards = cards.filter((card: any) => card.coluna_id === qualificadosColuna.id);
          setQualifiedCards(filteredCards);
        }

        // Calcular distribuição por hora
        const hourlyCounts = Array(24).fill(0).map((_, i) => ({
          hour: `${i.toString().padStart(2, '0')}`,
          value: 0,
        }));

        cards.forEach((card: any) => {
          if (card.created_at) {
            const hour = new Date(card.created_at).getHours();
            if (hourlyCounts[hour]) {
              hourlyCounts[hour].value++;
            }
          }
        });

        const colors = [
          '#1d4ed8', '#1e40af', '#1e3a8a', '#172554', // Tons de azul escuro
          '#ea580c', '#c2410c', '#9a3412', '#7c2d12', // Tons de laranja escuro
          '#16a34a', '#15803d', '#166534', '#14532d', // Tons de verde escuro
          '#9333ea', '#7e22ce', '#6b21a8', '#581c87', // Tons de roxo escuro
          '#eab308', '#ca8a04', '#a16207', '#854d0e', // Tons de amarelo escuro
          '#db2777', '#be185d', '#9d174d', '#831843', // Tons de rosa escuro
        ];


        const processedHourlyData = hourlyCounts.map((item, index) => ({
          ...item,
          fill: colors[index % colors.length],
        }));

        setHourlyData(processedHourlyData);

        const tagLookup = new Map(tags.map((tag: any) => [tag.id, tag]));
        const tagCountMap = new Map<string, number>();
        cards.forEach((card: any) => {
          if (card.tag_id) {
            tagCountMap.set(card.tag_id, (tagCountMap.get(card.tag_id) || 0) + 1);
          }
        });
        cardTags.forEach((relation: any) => {
          if (relation.tag_id) {
            tagCountMap.set(relation.tag_id, (tagCountMap.get(relation.tag_id) || 0) + 1);
          }
        });
        const computedTopTags = Array.from(tagCountMap.entries())
          .map(([tagId, count]) => {
            const tagInfo = tagLookup.get(tagId);
            return {
              id: tagId,
              nome: tagInfo?.nome ?? 'Tag desconhecida',
              cor: tagInfo?.cor ?? '#6b7280',
              count,
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setTopTags(computedTopTags);


        const recentCards = [...cards]
          .filter((card: any) => card.created_at)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        setRecentActivity(recentCards);

      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err);
        toast({
          description: 'Falha ao carregar dados do dashboard.',
          variant: 'destructive' as any
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);
  const chartData = useMemo(() => {
    return colunas.map(c => ({
      nome: c.nome,
      total: countsByColuna[c.id] || 0
    }));
  }, [colunas, countsByColuna]);
  const chartConfig = {
    total: {
      label: 'Total por coluna',
      color: 'hsl(var(--primary))'
    }
  } as const;
  return <div className="space-y-6">
      <header className="fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Insights e métricas para gestão estratégica.</p>
      </header>

      {/* Métricas Principais */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in" style={{ animationDelay: '0.1s' }}>
        <Card className="hover-lift gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {authLoading || loading || totalCards === null ? '—' : totalCards.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Cards com Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {loading || totalCards === null
                ? '—'
                : `${cardsWithTagCount} (${totalCards > 0 ? ((cardsWithTagCount / totalCards) * 100).toFixed(0) : 0}%)`}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Clientes na Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {loading ? '—' : cardsCreatedThisWeek}
            </div>
            <p className="text-xs text-muted-foreground">Novos Clientes nos últimos 7 dias</p>
          </CardContent>
        </Card>   

        <Card className="hover-lift gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Clientes no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {loading ? '—' : cardsCreatedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">Total de clientes no mês {monthRangeLabel || '—'}</p>
          </CardContent>
        </Card>
      </section>

      {/* Gráficos e Análises */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in" style={{ animationDelay: '0.2s' }}>
        <Card className="gradient-border">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribuição por Coluna CRM
              </CardTitle>
              <CardDescription>Clentes em cada etapa do funil</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-64">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Clientes Qualificados
              </CardTitle>
              <CardDescription>Mês: {qualifiedMonthRangeLabel || '—'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                <Button variant={qualifiedChartType === 'bar' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setQualifiedChartType('bar')}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button variant={qualifiedChartType === 'line' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setQualifiedChartType('line')}>
                  <LineChart className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => setQualifiedMonthOffset((prev) => prev + 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setQualifiedMonthOffset((prev) => Math.max(prev - 1, 0))} disabled={qualifiedMonthOffset === 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {qualifiedMonthlyData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Nenhum card qualificado neste mês.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="w-full h-64">
                {qualifiedChartType === 'bar' ? (
                  <BarChart data={qualifiedMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-total)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={qualifiedMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-total)" fill="var(--color-total)" fillOpacity={0.3} />
                  </AreaChart>
                )}
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in" style={{ animationDelay: '0.3s' }}>
        <Card className="gradient-border">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Clientes por Dia da Semana
              </CardTitle>
              <CardDescription>Semana: {weekRangeLabel || '—'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                <Button variant={weeklyChartType === 'bar' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setWeeklyChartType('bar')}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button variant={weeklyChartType === 'line' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setWeeklyChartType('line')}>
                  <LineChart className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset((prev) => prev + 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setWeekOffset((prev) => Math.max(prev - 1, 0))} disabled={weekOffset === 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {weeklyData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Nenhum cliente cadastrado nesta semana.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="w-full h-64">
                {weeklyChartType === 'bar' ? (
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-total)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-total)" fill="var(--color-total)" fillOpacity={0.3} />
                  </AreaChart>
                )}
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Clientes no Mês
              </CardTitle>
              <CardDescription>Mês: {monthRangeLabel || '—'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                <Button variant={monthlyChartType === 'bar' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setMonthlyChartType('bar')}>
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button variant={monthlyChartType === 'line' ? 'default' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setMonthlyChartType('line')}>
                  <LineChart className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={() => setMonthOffset((prev) => prev + 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setMonthOffset((prev) => Math.max(prev - 1, 0))} disabled={monthOffset === 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Nenhum cliente cadastrado neste mês.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="w-full h-64">
                {monthlyChartType === 'bar' ? (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-total)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-total)" fill="var(--color-total)" fillOpacity={0.3} />
                  </AreaChart>
                )}
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 fade-in" style={{ animationDelay: '0.4s' }}>
        <Card className="gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Distribuição de Clientes por Hora
            </CardTitle>
            <CardDescription>Atividade de cadastro ao longo do dia (24h)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="w-full h-80">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="80%"
                barSize={10}
                data={hourlyData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 23]}
                  dataKey="hour"
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  angleAxisId={0}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      return (
                        <div className="bg-background border p-2 rounded-lg shadow-xl">
                          <p className="text-sm font-bold text-foreground">{`${payload[0].payload.hour}:00 - ${String(parseInt(payload[0].payload.hour, 10) + 1).padStart(2, '0')}:00`}</p>
                          <p className="text-sm text-muted-foreground">{`Clientes: ${payload[0].value}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Análise Detalhada */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in" style={{ animationDelay: '0.5s' }}>
        <Card className="gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Resumo por Coluna
            </CardTitle>
            <CardDescription>Distribuição de clientes em cada etapa do funil.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {colunas.length === 0 && (authLoading || loading) ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))
              ) : (
                colunas.map(c => {
                  const count = countsByColuna[c.id] || 0;
                  const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;
                  return (
                    <div key={c.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{c.nome}</span>
                        <span className="text-muted-foreground">{count} clientes ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags Mais Usadas
            </CardTitle>
            <CardDescription>Principais categorias de clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTags.length === 0 && (authLoading || loading) ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : (
                topTags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.cor }}
                      />
                      <span className="text-sm font-medium">{tag.nome}</span>
                    </div>
                    <Badge variant="secondary">{tag.count} cards</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>;
};
export default Dashboard;