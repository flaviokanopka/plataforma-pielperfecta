import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, User, Bot, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatMessage {
  id: number;
  message: any;
  created_at: string;
  session_id: string;
}

interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
  lastMessage: string;
  messageCount: number;
  lastActivity: string;
  phoneNumber?: string;
}

export default function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('memoria_chat')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Agrupar mensagens por session_id
      const sessionsMap = new Map<string, ChatMessage[]>();
      
      data?.forEach((message: ChatMessage) => {
        if (!sessionsMap.has(message.session_id)) {
          sessionsMap.set(message.session_id, []);
        }
        sessionsMap.get(message.session_id)?.push(message);
      });

      // Converter para array de sessões
      const sessionsArray: ChatSession[] = Array.from(sessionsMap.entries()).map(([sessionId, messages]) => {
        const sortedMessages = messages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        const lastMessageText = typeof lastMessage.message === 'object' 
          ? lastMessage.message.content || lastMessage.message.text || 'Mensagem'
          : lastMessage.message;

        // Extrair número de telefone do session_id ou das mensagens
        const phoneNumber = sessionId.includes('@') 
          ? sessionId.split('@')[0]
          : sessionId;

        return {
          session_id: sessionId,
          messages: sortedMessages,
          lastMessage: lastMessageText,
          messageCount: messages.length,
          lastActivity: lastMessage.created_at,
          phoneNumber: phoneNumber
        };
      });

      // Ordenar por última atividade
      sessionsArray.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );

      setSessions(sessionsArray);
    } catch (error) {
      console.error('Erro ao carregar sessões de chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message: any) => {
    if (typeof message === 'string') {
      return message;
    }
    
    if (typeof message === 'object') {
      // Tenta extrair o conteúdo da mensagem
      if (message.content) return message.content;
      if (message.text) return message.text;
      if (message.message) return message.message;
      
      // Se for um objeto complexo, mostra o JSON formatado
      return JSON.stringify(message, null, 2);
    }
    
    return 'Mensagem não processada';
  };

  const getMessageRole = (message: any) => {
    if (typeof message === 'object') {
      if (message.role) return message.role;
      if (message.sender) return message.sender;
      if (message.type) return message.type;
    }
    return 'human'; // default para humano
  };

  const selectedSessionData = selectedSession 
    ? sessions.find(s => s.session_id === selectedSession)
    : null;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="md:col-span-2 h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mb-8 animate-fade-in-scale">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl chat-gradient-bg flex items-center justify-center shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chat com Clientes
            </h1>
            <p className="text-muted-foreground text-lg">
              Acompanhe todas as conversas realizadas com seus clientes
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lista de Sessões */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">Conversas</span>
              <Badge variant="secondary" className="ml-auto px-3 py-1 font-medium">
                {sessions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[650px] scrollbar-thin">
              {sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-primary/60" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conversa encontrada</h3>
                  <p className="text-muted-foreground">
                    As conversas com clientes aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {sessions.map((session, index) => (
                    <div
                      key={session.session_id}
                      className={`m-2 p-4 rounded-xl cursor-pointer chat-session-hover border transition-all duration-300 ${
                        selectedSession === session.session_id 
                          ? 'bg-gradient-to-r from-primary/10 to-accent/5 border-primary/30 shadow-lg' 
                          : 'bg-card/50 border-border/50 hover:border-primary/20'
                      }`}
                      onClick={() => setSelectedSession(session.session_id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-primary font-bold text-xl">
                              {session.phoneNumber?.charAt(0) || '#'}
                            </span>
                          </div>
                          {selectedSession === session.session_id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate text-foreground mb-1">
                            {session.phoneNumber || 'Número não identificado'}
                          </h4>
                          <p className="text-muted-foreground truncate mb-3 text-sm leading-relaxed">
                            {session.lastMessage}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.lastActivity), "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 font-medium px-3 py-1"
                            >
                              {session.messageCount}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Mensagens */}
        <Card className="md:col-span-2 overflow-hidden border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50 py-6">
            <CardTitle className="flex items-center gap-4 text-xl">
              {selectedSessionData ? (
                <>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-primary font-bold text-lg">
                        {selectedSessionData.phoneNumber?.charAt(0) || '#'}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedSessionData.phoneNumber || 'Conversa selecionada'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedSessionData.messageCount} mensagens
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="font-semibold">Selecione uma conversa</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedSessionData ? (
              <ScrollArea className="h-[600px] scrollbar-thin">
                <div className="p-6 space-y-6 bg-gradient-to-b from-muted/10 via-background/50 to-muted/20">
                  {selectedSessionData.messages.map((msg, index) => {
                    const role = getMessageRole(msg.message);
                    const isHuman = role === 'human' || role === 'user';
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex ${isHuman ? 'justify-start' : 'justify-end'} chat-bubble-enter`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className={`max-w-[75%] ${isHuman ? 'order-1' : 'order-2'}`}>
                          <div className={`relative group`}>
                            <div className={`inline-block p-4 rounded-2xl transition-all duration-300 ${
                              isHuman 
                                ? 'chat-message-assistant rounded-bl-md hover:shadow-lg' 
                                : 'chat-message-user rounded-br-md hover:shadow-lg'
                            }`}>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {renderMessage(msg.message)}
                              </div>
                            </div>
                            {/* Avatar */}
                            <div className={`absolute top-0 w-8 h-8 rounded-full bg-gradient-to-br ${
                              isHuman 
                                ? 'from-muted to-muted/80 -left-10' 
                                : 'from-primary to-accent -right-10'
                            } flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity`}>
                              {isHuman ? (
                                <User className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                          <div className={`text-xs text-muted-foreground mt-2 px-3 flex items-center gap-1 ${
                            isHuman ? 'justify-start' : 'justify-end'
                          }`}>
                            <Clock className="h-3 w-3 opacity-60" />
                            {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-center bg-gradient-to-b from-muted/5 to-muted/20">
                <div className="animate-fade-in-scale">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-xl">
                    <MessageSquare className="h-12 w-12 text-primary/60" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Selecione uma conversa
                  </h3>
                  <p className="text-muted-foreground text-lg max-w-md">
                    Escolha um número na lista ao lado para visualizar as mensagens trocadas
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}