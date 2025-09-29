import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CrmColuna {
  id: string;
  nome: string;
  ordem: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  nome: string;
  cor: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CrmCard {
  id: string;
  nome: string;
  telefone: string | null;
  tag_id: string | null;
  coluna_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  data_visita: string | null;
  tags?: Tag;
}

export const useCRM = () => {
  const { user } = useAuth();
  const [colunas, setColunas] = useState<CrmColuna[]>([]);
  const [cards, setCards] = useState<CrmCard[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardTags, setCardTags] = useState<Record<string, Tag[]>>({});

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadColunas();
      loadCards();
      loadTags();
      loadCardTags();
    }
  }, [user]);

  const loadColunas = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crm_colunas')
        .select('*')
        .eq('user_id', user.id)
        .order('ordem');

      if (error) throw error;
      setColunas(data || []);
    } catch (error) {
      console.error('Erro ao carregar colunas:', error);
    }
  };

  const loadCards = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('crm_cards')
        .select(`
          *,
          tags (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('nome');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  };

  const loadCardTags = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('crm_card_tags')
        .select('card_id, tag_id, tags ( id, nome, cor, user_id, created_at, updated_at )')
        .eq('user_id', user.id);

      if (error) throw error;

      const map: Record<string, Tag[]> = {};
      (data || []).forEach((row: any) => {
        const t: Tag | undefined = row.tags;
        if (!t) return;
        if (!map[row.card_id]) map[row.card_id] = [];
        map[row.card_id].push(t);
      });
      setCardTags(map);
    } catch (error) {
      console.error('Erro ao carregar tags dos cards:', error);
    }
  };
  // CRUD Colunas
  const createColuna = async (nome: string) => {
    if (!user) return;
    
    try {
      const maxOrdem = Math.max(...colunas.map(c => c.ordem), -1);
      const { data, error } = await supabase
        .from('crm_colunas')
        .insert({
          nome,
          ordem: maxOrdem + 1,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setColunas([...colunas, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar coluna:', error);
    }
  };

  const updateColuna = async (id: string, nome: string) => {
    try {
      const { data, error } = await supabase
        .from('crm_colunas')
        .update({ nome })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setColunas(colunas.map(c => c.id === id ? data : c));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar coluna:', error);
    }
  };

  const deleteColuna = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_colunas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setColunas(colunas.filter(c => c.id !== id));
      setCards(cards.filter(card => card.coluna_id !== id));
    } catch (error) {
      console.error('Erro ao deletar coluna:', error);
    }
  };

  // CRUD Cards
  const createCard = async (cardData: {
    nome: string;
    telefone?: string;
    tag_id?: string;
    coluna_id: string;
    data_visita?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('crm_cards')
        .insert({
          ...cardData,
          user_id: user.id
        })
        .select(`
          *,
          tags (*)
        `)
        .single();

      if (error) throw error;
      setCards([data, ...cards]);
      return data;
    } catch (error) {
      console.error('Erro ao criar card:', error);
    }
  };

  const updateCard = async (id: string, cardData: Partial<CrmCard>) => {
    try {
      const { data, error } = await supabase
        .from('crm_cards')
        .update(cardData)
        .eq('id', id)
        .select(`
          *,
          tags (*)
        `)
        .single();

      if (error) throw error;
      setCards(cards.map(card => card.id === id ? data : card));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
    }
  };

  const moveCard = async (cardId: string, novaColuna: string) => {
    try {
      const { data, error } = await supabase
        .from('crm_cards')
        .update({ coluna_id: novaColuna })
        .eq('id', cardId)
        .select(`
          *,
          tags (*)
        `)
        .single();

      if (error) throw error;
      setCards(cards.map(card => card.id === cardId ? data : card));
      return data;
    } catch (error) {
      console.error('Erro ao mover card:', error);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crm_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCards(cards.filter(card => card.id !== id));
    } catch (error) {
      console.error('Erro ao deletar card:', error);
    }
  };

  // CRUD Tags
  const createTag = async (nome: string, cor: string = '#3b82f6') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          nome,
          cor,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setTags([...tags, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar tag:', error);
    }
  };

  const updateTag = async (id: string, nome: string, cor: string) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update({ nome, cor })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTags(tags.map(t => t.id === id ? data : t));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tag:', error);
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTags(tags.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar tag:', error);
    }
  };

  // Tags por Card (muitos-para-muitos)
  const addTagToCard = async (cardId: string, tagId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('crm_card_tags')
        .insert({ card_id: cardId, tag_id: tagId, user_id: user.id })
        .select('card_id, tags ( id, nome, cor, user_id, created_at, updated_at )')
        .single();
      if (error) throw error;
      const t: Tag | undefined = (data as any)?.tags;
      if (!t) return;
      setCardTags(prev => ({
        ...prev,
        [cardId]: [...(prev[cardId] || []), t].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
      }));
    } catch (error) {
      console.error('Erro ao vincular tag ao card:', error);
    }
  };

  const removeTagFromCard = async (cardId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('crm_card_tags')
        .delete()
        .eq('card_id', cardId)
        .eq('tag_id', tagId);
      if (error) throw error;
      setCardTags(prev => ({
        ...prev,
        [cardId]: (prev[cardId] || []).filter(t => t.id !== tagId)
      }));
    } catch (error) {
      console.error('Erro ao desvincular tag do card:', error);
    }
  };

  const getTagsByCard = (cardId: string) => cardTags[cardId] || [];
  // Utilitários
  const getCardsByColuna = (colunaId: string) => {
    return cards.filter(card => card.coluna_id === colunaId);
  };

  const getCardCount = (colunaId: string) => {
    return getCardsByColuna(colunaId).length;
  };

  return {
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
    getCardCount,
    loadColunas,
    loadCards,
    loadTags,
    loadCardTags,
  };
};