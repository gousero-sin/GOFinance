# GOfinance - TODO List

## Banco de Dados e Backend
- [x] Criar tabela de transações (transactions)
- [x] Criar tabela de categorias (categories)
- [x] Adicionar queries para transações no db.ts
- [x] Adicionar queries para categorias no db.ts
- [x] Criar seed inicial de categorias padrão

## Integração Deepseek API
- [x] Configurar variável de ambiente para Deepseek API Key
- [x] Criar helper para chamadas à Deepseek API
- [x] Implementar procedimento tRPC para análise de texto com AI
- [x] Criar prompt otimizado para extração de dados financeiros
- [x] Implementar validação e sanitização de resposta da AI

## Rotas tRPC
- [x] Router de transações (listar, criar, editar, deletar)
- [x] Router de categorias (listar)
- [x] Router de estatísticas (resumo financeiro, gráficos)
- [x] Router de AI assistant (processar texto natural)

## Design e Estilo Liquid Glass
- [x] Configurar paleta de cores Liquid Glass no index.css
- [x] Adicionar fonte SF Pro (ou alternativa similar)
- [x] Criar componente GlassCard reutilizável
- [x] Implementar background gradiente animado
- [x] Configurar backdrop-filter e efeitos de blur

## Interface - Layout Base
- [x] Criar DashboardLayout com sidebar translúcida
- [x] Implementar navegação principal
- [x] Adicionar perfil de usuário na sidebar
- [x] Configurar rotas no App.tsx

## Interface - Dashboard
- [x] Página Dashboard com cards de resumo
- [x] Card de saldo total
- [x] Card de receitas do mês
- [x] Card de despesas do mês
- [x] Gráfico de evolução mensal

## Interface - Transações
- [x] Página de lista de transações
- [x] Filtros por data, categoria e tipo
- [x] Ordenação por data/valor
- [x] Botão de adicionar transação
- [ ] Modal de edição de transação (funcionalidade futura)
- [ ] Modal de confirmação de exclusão (funcionalidade futura)

## Interface - AI Assistant
- [x] Página/modal de AI Assistant
- [x] Input de texto natural
- [x] Preview da transação extraída
- [x] Botão de confirmar/editar antes de salvar
- [x] Feedback visual durante processamento

## Interface - Categorias
- [x] Página de gerenciamento de categorias (integrado no sistema)
- [x] Lista de categorias com ícones (seed inicial)
- [x] Estatísticas por categoria (no dashboard)

## Interface - Relatórios
- [x] Página de relatórios
- [ ] Gráfico de pizza por categoria (funcionalidade futura)
- [ ] Gráfico de linha de evolução temporal (funcionalidade futura)
- [ ] Exportação de dados (CSV) (funcionalidade futura)

## Funcionalidades Extras
- [x] Modo escuro/claro (dark mode configurado)
- [x] Responsividade mobile (layout responsivo)
- [x] Loading states com skeleton
- [x] Toast notifications para ações
- [x] Validação de formulários

## Testes e Deploy
- [x] Testar fluxo completo de adicionar transação manual
- [x] Testar fluxo completo de adicionar transação via AI
- [x] Testar responsividade em diferentes telas
- [x] Verificar performance e otimizações
- [x] Criar checkpoint final

## Correções Urgentes
- [x] Corrigir problema de API Key do Deepseek não sendo reconhecida
- [x] Verificar variável de ambiente DEEPSEEK_API_KEY
- [x] Testar integração completa com Deepseek API
- [x] Reiniciar servidor para carregar variáveis de ambiente
- [x] Adicionar deepseekApiKey ao arquivo ENV
- [x] Atualizar deepseek.ts para usar ENV ao invés de process.env
- [x] Hard restart do servidor para aplicar mudanças

## Correção de Erros React
- [x] Corrigir erro de <a> aninhado dentro de <a> no FinanceDashboardLayout

## Ajustes Deepseek API
- [x] Melhorar parsing e validação da resposta da API
- [x] Adicionar logs para debug
- [x] Tornar validação mais flexível com mensagens específicas

## Sistema de Configuração de API Key por Usuário
- [x] Adicionar campo deepseekApiKey na tabela users
- [x] Criar migration para adicionar coluna
- [x] Adicionar função no db.ts para salvar/buscar API Key do usuário
- [x] Criar router tRPC para configurações (salvar/buscar API Key)
- [x] Criar página de Configurações no frontend
- [x] Atualizar deepseek.ts para usar API Key do usuário logado
- [x] Adicionar link de Configurações na sidebar
- [x] Testar fluxo completo
