# B-WORK — Sistema de Gestão de Obras | Construtora Engethan

Sistema web corporativo para administração de obras e acompanhamento da execução de serviços da Construtora Engethan.

## ⚠️ Observação importante sobre a stack

Este projeto foi construído na plataforma **Base44**, que fornece um backend completo (banco de dados, autenticação, armazenamento de arquivos e segurança por linha — RLS) — equivalente funcional ao Supabase. Por isso, **não utiliza Supabase externo nem Vercel**: o backend e o hosting são gerenciados pela própria plataforma Base44.

Tudo é **real e persistente**:
- Autenticação real (e-mail/senha e Google)
- Banco de dados real (entidades persistidas no backend da plataforma)
- Upload real de fotos (armazenamento de arquivos da plataforma)
- Segurança por linha (RLS) configurada por entidade
- CRUD completo em todos os módulos

Não há dados fictícios, mockups ou botões sem função. A aplicação começa vazia e o usuário cria todos os dados.

## 📋 Funcionalidades

### Autenticação
- Login com e-mail/senha e Google
- Cadastro de conta com confirmação
- Recuperação de senha
- Proteção de rotas (usuário não autenticado é redirecionado ao login)
- Logout

### Perfis e permissões
- **Administrador** (`admin`): gerencia obras, equipe, usuários e permissões
- **Funcionário** (`user`): acessa obras e registra informações
- Permissões aplicadas no backend via RLS, não apenas no frontend

### Módulos
- **Dashboard**: contagens reais (obras, andamento, concluídas, tarefas pendentes), obras e registros recentes, onboarding quando vazio
- **Obras**: listagem com busca, filtro por status e ordenação; CRUD completo
- **Página da obra** com abas:
  - **Visão geral**: informações e resumo
  - **Ambientes**: CRUD (Sala, Cozinha, Banheiro, etc.)
  - **Serviços/Tarefas**: CRUD, status (Pendente, Em andamento, Concluído, Cancelado), prioridade (Baixa, Média, Alta, Urgente), responsável, filtro e busca, conclusão rápida
  - **Fotos**: câmera/galeria no celular, preview, legenda, ambiente, galeria por obra, filtro por ambiente, exclusão
  - **Registros**: timeline com tipos (Ocorrência, Vistoria, Serviço, Observação, Entrega, Outro)
  - **Equipe**: membros reais do sistema, adicionar/remover (admin)
  - **Histórico**: auditoria automática de ações (criar, editar, excluir, concluir, adicionar/remover membro, enviar foto)
  - **Relatórios**: progresso de tarefas, serviços por status/prioridade, registros por tipo, totais — com impressão
- **Equipe** (global): lista de usuários reais, admin pode alterar permissões
- **Perfil**: editar nome

### Estados da aplicação
Todas as páginas tratam: loading, empty, error e success. Mensagens em português.

### Responsividade
Desktop, notebook, tablet e celular. Sidebar no desktop, menu hambúrguer no mobile. Upload de fotos otimizado para uso no canteiro de obras.

## 🏗️ Estrutura do projeto

```
src/
  components/
    AppLayout.jsx          # Layout com sidebar
    obras/
      ObraFormDialog.jsx
      AmbienteFormDialog.jsx
      TarefaFormDialog.jsx
      RegistroFormDialog.jsx
      PhotoUploader.jsx
      tabs/
        VisaoGeral.jsx
        AmbientesTab.jsx
        ServicosTab.jsx
        FotosTab.jsx
        RegistrosTab.jsx
        EquipeTab.jsx
        HistoricoTab.jsx
        RelatoriosTab.jsx
  pages/
    Dashboard.jsx
    Obras.jsx
    ObraDetalhe.jsx
    Equipe.jsx
    Perfil.jsx
  lib/
    bwork.js               # Constantes, helpers, log de histórico
base44/entities/           # Esquemas do banco (Obra, Ambiente, Tarefa, Foto, Registro, MembroObra, Historico)
```

## 🔐 Segurança (RLS)

Cada entidade possui regras de segurança por linha:
- **Obra**: leitura/edição/exclusão pelo criador ou administrador
- **Ambiente, Tarefa, Foto, Registro**: leitura para todos autenticados; edição/exclusão pelo criador ou admin
- **MembroObra**: leitura/criação para todos; gerenciamento por admin
- **Historico**: leitura/criação para todos; imutável; exclusão apenas por admin

## 🚀 Como usar

1. Crie uma conta pelo cadastro (o primeiro usuário pode ser promovido a admin pelo dashboard de usuários da plataforma)
2. Crie sua primeira obra
3. Adicione ambientes, serviços, fotos, registros e equipe
4. Acompanhe o histórico e os relatórios

## 📝 Regras de qualidade

- Nenhum dado fictício: a aplicação começa vazia
- Todo botão na interface executa uma ação real
- Histórico automático em todas as ações relevantes
- Tratamento de erros e estados vazios em todas as telas
- Validação de formulários