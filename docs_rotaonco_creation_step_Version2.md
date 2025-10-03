# RotaOnco — Guia de Criação (para Codex)

Propósito
- Este documento instrui o Codex a implementar o RotaOnco end‑to‑end, em incrementos pequenos, testáveis e documentados, usando o monorepo já criado com Bun + Hono + TanStack Router (web) + React Native + NativeWind (mobile) + MySQL/Drizzle + Turborepo + Better Auth.
- Cada etapa deve gerar artefatos (código, testes, migrações, especificações e docs). Ambiguidades devem ser registradas como perguntas.

Resumo do Contexto (derivado do documento de requisitos)
- Objetivo: Apoiar a gestão clínica e a pesquisa em estomatologia oncológica com um Dashboard Web (profissionais/pesquisadores) e um App Mobile (pacientes e profissionais), sobre base única de dados.
- Perfis/RBAC:
  - Paciente: acesso via PIN de 4 dígitos; visualiza consultas, confirma presença, ligações rápidas, conteúdos em áudio, botão de emergência. Sem envio de mensagens/áudios para o serviço.
  - Profissional: cadastro/validação institucional; agenda, pacientes, registro de presenças/faltas, intercorrências, relatórios básicos.
  - Pesquisador: acesso ampliado a relatórios e exportações, filtros avançados.
  - Administrador (implícito): valida profissionais, gerencia permissões.
- Regras de negócio destacadas:
  - Agendamentos: retornos quinzenais até triagem oncológica; trimestrais após conclusão do tratamento.
  - Comunicação: preferir WhatsApp para lembretes; SMS como fallback.
  - Indicadores obrigatórios: tempos de espera entre etapas; taxas de comparecimento/adesão; detecção de faltas consecutivas (risco de abandono).
- Integrações: WhatsApp (prioritário) e SMS (fallback) para lembretes; exportação de relatórios em PDF/XLSX.
- NFRs (essenciais/“importante” do documento):
  - Escopo de desempenho: até 5.000 pacientes e ~100 acessos concorrentes (RNF03).
  - Disponibilidade mínima 99,5% (RNF04).
  - Tempo de resposta: ≤3s operações comuns, ≤10s relatórios complexos (RNF06).
  - Acessibilidade (WCAG 2.1) com apoio a áudio no app do paciente (RNF05).
  - Auditoria de operações críticas (RNF08).
- Segurança (RS):
  - RS001: evitar duplicidade/identidade trocada no cadastro de pacientes — CPF como chave única e validação de duplicidade.
  - RS002: autenticação forte, bloqueio após 3 tentativas incorretas.
  - RS003: logs de auditoria com usuário/data/hora/ação.

Acordos de Trabalho para o Codex
- Iterar em PRs pequenos. Definição de Pronto (DoD) por PR: código + testes + lint/typecheck + build + docs + telemetria + checagem de segurança.
- “Tests first”: propor plano de testes e plano de alterações por arquivo antes de gerar código.
- Manter artefatos vivos: OpenAPI, schema/ERD, diagramas (Mermaid), ADRs, runbooks.
- Segurança/privacidade por padrão: validação de entrada, autorização em todo boundary, mínimo privilégio, auditoria.
- Diagramas em Mermaid; API em OpenAPI 3.0; scripts idempotentes.
- Registrar suposições e perguntas sempre que houver dúvida de requisito.

Stack e Monorepo (ajuste caminhos conforme o seu repo)
- Runtime: Bun. Backend: Hono. ORM: Drizzle (MySQL via Docker). Auth: Better Auth.
- Web: React + TanStack Router (apps/web). Mobile: React Native + NativeWind (apps/mobile ou apps/native).
- API: apps/api. Pacotes compartilhados: packages/shared (tipos, utils, cliente API).
- Infra: infra (docker-compose, seeds, scripts). Docs: docs/*. CI: .github/workflows.
- Variáveis de ambiente (baseline):
  - DATABASE_URL=mysql://user:pass@localhost:3306/rotaonco
  - AUTH_SECRET=...
  - AUTH_ISSUER=...
  - AUTH_CALLBACK_URL=...
  - APP_URL_WEB=http://localhost:3000
  - API_URL=http://localhost:8787
- Setup local (ajuste aos scripts do seu monorepo):
  ```
  bun install
  docker compose up -d
  bun run db:generate
  bun run db:migrate
  bunx turbo run dev
  bunx turbo run lint
  bunx turbo run test
  bunx turbo run build
  ```

Plano de Execução por Fases (em PRs)

Fase 1 — Sumário de Requisitos (PR-01)
- Entregas:
  - docs/SUMMARY.md: escopo, atores, fluxos-chave, NFRs, riscos, suposições, perguntas abertas.
- Prompt para Codex:
  """
  Leia docs/requirements.docx ou docs/requirements.md. Gere docs/SUMMARY.md com: escopo, atores, fluxos essenciais, NFRs (RNF01–RNF09), riscos, suposições e perguntas abertas.
  """

Fase 2 — Arquitetura e Diagramas (PR-02)
- Entregas: docs/ARCHITECTURE.md com:
  - Diagrama de contexto, componentes e topologia (local/staging/prod).
  - Sequências principais: cadastro profissional, login profissional, login paciente (PIN), agendar consulta, confirmação de presença, registro de intercorrência, lembrete automático, geração de relatório.
  - Justificativas de escolhas e trade-offs.
- Prompt:
  """
  Proponha a arquitetura alvo (Web, Mobile, API, DB, Auth, Notificações, Relatórios, CI/CD). Forneça diagramas Mermaid (contexto, componentes, sequências) e topologia de deploy. Salve em docs/ARCHITECTURE.md.
  """

Fase 3 — Modelo de Dados e Migrações (PR-03)
- Entregas:
  - docs/DATA_MODEL.md: Glossário + ERD (Mermaid) + notas de PII/retensão.
  - Schemas Drizzle e migrações + seeds iniciais (profissional admin; exemplos de pacientes).
  - Índices/constraints, unicidade, auditoria.
- Entidades sugeridas (ajuste conforme necessário):
  - users (profissionais/admin/pesquisadores), roles, user_roles
  - patients, patient_contacts (familiar), patient_status/stage
  - appointments
  - occurrences (intercorrências)
  - alerts
  - messages (envio de lembretes WhatsApp/SMS – outbound)
  - audit_logs
  - settings (parâmetros, ex.: números de emergência)
- ERD (rascunho):
  ```mermaid
  erDiagram
    users ||--o{ user_roles : has
    roles ||--o{ user_roles : has
    users ||--o{ appointments : schedules
    patients ||--o{ appointments : has
    patients ||--o{ occurrences : has
    patients ||--o{ alerts : triggers
    patients ||--o{ messages : receives
    patients ||--o{ patient_contacts : has
    users ||--o{ audit_logs : produces

    users {
      bigint id PK
      varchar name
      varchar email UK
      varchar cpf_crm_cro UK
      varchar specialty
      varchar phone
      boolean is_active
      datetime created_at
      datetime updated_at
    }

    roles {
      int id PK
      varchar name UK  // admin, professional, researcher
    }

    user_roles {
      bigint user_id FK
      int role_id FK
    }

    patients {
      bigint id PK
      varchar full_name
      varchar cpf UK
      date birth_date
      varchar phone
      varchar tumor_type
      varchar clinical_unit
      enum stage // pre_triage, in_treatment, post_treatment
      enum status // active, inactive, at_risk
      varchar emergency_phone
      varchar audio_material_url
      int pin_attempts
      datetime pin_blocked_until
      datetime created_at
      datetime updated_at
    }

    patient_contacts {
      bigint id PK
      bigint patient_id FK
      varchar name
      varchar relation
      varchar phone
    }

    appointments {
      bigint id PK
      bigint patient_id FK
      bigint professional_id FK
      datetime starts_at
      varchar type // consulta, retorno, triagem, etc.
      enum status // scheduled, confirmed, completed, no_show, canceled
      text notes
      datetime created_at
      datetime updated_at
    }

    occurrences {
      bigint id PK
      bigint patient_id FK
      varchar kind // dor, febre, sangramento, etc.
      tinyint intensity // 0..10
      enum source // patient, professional
      text notes
      datetime created_at
    }

    alerts {
      bigint id PK
      bigint patient_id FK
      varchar kind // falta_consecutiva, atraso_tratamento, sintoma_grave
      enum severity // low, medium, high
      enum status // open, acknowledged, closed
      datetime created_at
      datetime resolved_at
    }

    messages {
      bigint id PK
      bigint patient_id FK
      enum channel // whatsapp, sms
      text body
      varchar media_url
      enum status // queued, sent, failed
      datetime scheduled_at
      datetime sent_at
      text error
    }

    audit_logs {
      bigint id PK
      bigint user_id FK
      varchar action
      varchar entity
      bigint entity_id
      json details
      datetime created_at
    }
  ```
- Prompt:
  """
  Extraia as entidades do docs/SUMMARY.md e gere ERD, schemas Drizzle com índices/constraints (UK em cpf/cpf_crm_cro; FKs; cascatas seguras), migrações e seeds. Documente PII e retenção. Salve docs/DATA_MODEL.md e crie os arquivos em packages/shared/db e apps/api/drizzle.
  """

Fase 4 — API‑first (OpenAPI) (PR-04)
- Entregas:
  - apps/api/openapi.yaml cobrindo Web e Mobile.
  - docs/API_GUIDE.md com exemplos de requests/responses.
  - Padrões: auth, RBAC, paginação, erros, idempotência, rate limit, webhooks (se necessário).
- Endpoints (mapa inicial; detalhar no OpenAPI):
  - Auth: POST /auth/login (profissional), POST /auth/patient-pin (paciente), POST /auth/refresh, POST /auth/logout.
  - Users/Professionals: POST /professionals (cadastro/convite), GET/PUT /professionals/{id}.
  - Patients: CRUD /patients; GET /patients/search?q=; filtros por status/unidade/tumor.
  - Appointments: CRUD /appointments; GET /appointments?day=YYYY-MM-DD; POST /appointments/{id}/confirm; POST /appointments/{id}/decline; POST /appointments/{id}/status.
  - Occurrences: POST /patients/{id}/occurrences; GET /patients/{id}/occurrences.
  - Alerts: GET/POST/PATCH /alerts.
  - Reports: GET /reports/attendance; GET /reports/wait-times; GET /reports/adherence; GET /reports/adverse-effects; GET /reports/{kind}/export?format=pdf|xlsx.
  - Notifications: POST /notifications/appointment-reminders (job/batch).
- Prompt:
  """
  Projete OpenAPI 3.0 com RBAC (roles admin/professional/researcher/patient), paginação, esquema de erro padronizado, limites de taxa e idempotency keys onde aplicável. Marque endpoints por papel. Gere apps/api/openapi.yaml e docs/API_GUIDE.md.
  """

Fase 5 — Backend Hono (PR-05)
- Entregas:
  - apps/api/src: server, rotas modularizadas, middlewares (auth Better Auth, RBAC, validação com zod, rate limit), logging estruturado, tratador de erros.
  - Integração Drizzle (repos/services) e camada de casos de uso.
  - Health/readiness, auditoria (audit_logs), políticas de bloqueio após 3 tentativas (RNF07).
- Prompt:
  """
  Gere plano de alterações por arquivo para apps/api/src (server.ts, routes/*, middleware/*, services/*, repositories/*). Escreva testes primeiro. Depois implemente integrações (Better Auth, Drizzle), logs, auditoria e rate limiting.
  """

Fase 6 — Web Manager (PR-06)
- Entregas:
  - Mapa de rotas (TanStack Router) com layouts protegidos e checagem de papel.
  - Componentes: Tabela com filtros/sort/paginação, formulários com validação, estados de erro/carregando/vazio, acessibilidade básica (WCAG 2.1).
  - Cliente API tipado a partir do OpenAPI.
- Prompt:
  """
  Liste rotas, loaders, componentes e forma do estado para RF008, RF009, RF010–RF011, RF015–RF023, RF029–RF031. Escreva testes (unit + integração) e implemente. Integre cliente gerado do OpenAPI.
  """

Fase 7 — Mobile (PR-07)
- Entregas:
  - Navegação (stack/tabs), theming NativeWind, armazenamento seguro de token/PIN, fluxo “Sou Paciente” (RF004–RF006, RF025–RF026) e “Sou Profissional” (login + agenda diária RF007/RF028).
  - Padrões de UX simples, botões grandes, áudio educativo.
- Prompt:
  """
  Defina telas, navegação, armazenamento seguro e chamadas de API para RF004–RF006, RF025–RF028. Inclua A11y básica e reprodução de áudio. Escreva testes onde possível e plano de testes manuais.
  """

Fase 8 — Fatias Verticais (repetir por feature)
- S1 (MVP): RF003, RF001 (fluxo com aprovação), RF002, RF010, RF006/RF005 básicos, RF007/RF028 básicos.
- S2: RF015 (histórico), RF021/RF022 (busca/filtro), RF023 (vínculo).
- S3: RF016/RF018 (comparecimento/adesão) e exportações (RF020).
- S4: RF017/RF019 (tempos de espera/efeitos adversos).
- S5: RF013/RF029 (alertas) + RF014 (notificações) com adapters (whatsapp/sms).
- Para cada Sx:
  - Design notes -> testes -> implementação -> docs -> telemetria -> checklist de segurança.

Fase 9 — Observabilidade (PR-08)
- Logging estruturado, métricas e rastros.
- docs/OBSERVABILITY.md com painéis (latência, taxa de erro, throughput) e regras de alerta.

Fase 10 — CI/CD (PR-09)
- .github/workflows: instalar, lint, type-check, testes, build; migrações gated; artefatos; pré-visualizações (se aplicável); versionamento e release notes.

Fase 11 — Segurança e Conformidade (PR-10)
- Implementar bloqueio após 3 erros (RNF07), revisão de entrada (OWASP), política de segredo, auditoria completa (RS003), validações de duplicidade por CPF (RS001).

Fase 12 — UAT, Performance e Handover (PR-11)
- Plano de UAT mapeado aos RFs, testes de desempenho para limites (RNF03/RNF06), prontidão de produção, runbooks e handover.

Mapeamento RF -> Artefatos Técnicos (guia)
- RF001 Cadastro Profissional: OpenAPI Users/Professionals, rotas Hono, UI web form + validações, fluxo de aprovação admin.
- RF002 Cadastro Paciente: OpenAPI Patients, Drizzle patients/patient_contacts com UK (CPF), UI web.
- RF003 Login Profissional: Better Auth + rotas /auth/login, sessão, RBAC.
- RF004 Login Paciente (PIN): rota /auth/patient-pin, hash de PIN, bloqueio após 3 tentativas, sessão restrita.
- RF005 Home Paciente: mobile telas “Meu Cuidado”, consulta próxima, chamadas, áudio, emergências.
- RF006 Confirmação Presença: POST /appointments/{id}/confirm; mobile UI; atualiza status.
- RF007/RF028 Agenda Profissional: GET /appointments?day=; marcar realizada/falta.
- RF008 Dashboard Web: KPIs + alertas; agregações em consultas SQL otimizadas.
- RF009 Gestão Paciente: tabela com filtros/sort/paginação; exportação.
- RF010/011 Consultas: CRUD, conflitos de horário, cancelamento com motivo.
- RF012 Intercorrências: POST/GET occurrences; escala 0–10; fonte patient/professional.
- RF013/029 Alertas: job/trigger + UI painel; estados open/ack/closed.
- RF014 Notificações: adapter WhatsApp (primário) + SMS (fallback); registro em messages.
- RF015 Histórico: join de consultas + intercorrências.
- RF016/017/018/019/020 Relatórios: endpoints de agregação + export PDF/XLSX.
- RF021/022/023/024/025/026/027/030/031 conforme especificações.

RBAC (resumo)
- Paciente: somente endpoints “meus dados”/“minhas consultas” e confirmação; sem mensagens ativas.
- Profissional: CRUD pacientes/consultas, registro de ocorrências, visualização relatórios básicos.
- Pesquisador: leitura ampliada e relatórios completos/export.
- Admin: gestão de usuários/papéis, aprovação de profissionais.
- Back-end deve negar por padrão; UI deve ocultar ações não permitidas.

Especificação de API — Convenções
- Autenticação: Bearer JWT (Better Auth) para profissionais/pesquisadores/admin; sessão restrita para pacientes via PIN.
- Erros: objeto { code, message, details? } com HTTP coerente.
- Paginação: limit/offset ou cursor; sempre ordenação determinística.
- Idempotência: cabeçalho Idempotency-Key para POST sensíveis (ex.: agendamentos).
- Rate limit: por IP/usuário em endpoints de autenticação e ações críticas.

Estratégia de Testes
- Unit: serviços, validações, hooks.
- Integração: rotas API com DB (schema de teste/transactions).
- E2E: Web (Playwright) e Mobile (plano manual/Detox conforme viabilidade).
- Dados de teste: factories/fixtures; dados anonimizados para relatórios.
- Metas: cobertura 80%+ (linhas/branches); 100% em caminhos críticos de segurança/autenticação.

Checklists

Definição de Pronto (por PR)
- [ ] Código + testes unit/integ/E2E passaram
- [ ] Lint/type-check ok; build ok
- [ ] Docs atualizadas (README/GUIAS/CHANGELOG)
- [ ] Telemetria/logs adicionados
- [ ] Checklist de segurança (abaixo) ok
- [ ] Migrações revisadas e com rollback/forward-only conforme política
- [ ] Plano de rollback/feature flag considerado

Segurança
- [ ] Validação de entrada (zod) e sanitização
- [ ] Autorização em todas as rotas; negação por padrão
- [ ] Segredos seguros (.env local, secrets no CI)
- [ ] Auditoria (quem/quando/o quê) em operações críticas
- [ ] Bloqueio após 3 tentativas (RF/RNF)
- [ ] Unicidade por CPF (paciente) e CPF/CRM/CRO (profissional)
- [ ] Rate limiting em auth e ações críticas

Release
- [ ] Migrações forward-only, backup antes
- [ ] Flags de funcionalidade quando aplicável
- [ ] Plano de rollout/rollback
- [ ] Monitoramento com SLOs (latência, erro, throughput)
- [ ] Notas de versão automatizadas

Perguntas em Aberto (para validação)
- Confirmar se “Pesquisador” é um papel aplicado a um Profissional ou um usuário distinto.
- Confirmação: paciente terá CPF obrigatório? (RS001 sugere uso de CPF como chave única).
- Tipos de consulta e enumerações oficiais (consulta, retorno, triagem, etc.).
- Critérios exatos de detecção de “faltas consecutivas” e janelas de risco.
- Provedor de WhatsApp (ex.: Cloud API/fornecedor) e requisitos de template; provedor de SMS.
- Política de retenção de dados e anonimização para pesquisa.
- Necessidade de “unidades clínicas” mestre e matriz de permissões multiunidade?
- Requisitos de “export Excel” (XLSX real vs. CSV com extensão .xlsx).

Prompts Prontos para o Codex

1) Resumo de Requisitos
"""
Leia docs/requirements.md e gere docs/SUMMARY.md com escopo, atores, fluxos, NFRs, riscos, suposições e perguntas abertas.
"""

2) Arquitetura
"""
Proponha arquitetura alvo com diagramas Mermaid (contexto, componentes, sequências principais, topologia). Salve em docs/ARCHITECTURE.md.
"""

3) Modelo de Dados
"""
Gere ERD Mermaid e schemas Drizzle, migrações e seeds iniciais conforme docs/SUMMARY.md. Documente PII/retensão em docs/DATA_MODEL.md.
"""

4) API (OpenAPI)
"""
Modele OpenAPI 3.0 para Web e Mobile com auth, RBAC, paginação e erros. Gere apps/api/openapi.yaml e docs/API_GUIDE.md com exemplos.
"""

5) Backend (Hono)
"""
Liste plano de alterações por arquivo para rotas/serviços/repositórios/middlewares. Escreva testes primeiro; implemente depois com logs, auditoria e rate limiting.
"""

6) Web
"""
Para RF008–RF011 e RF015–RF023, liste rotas, loaders, componentes, AC e testes. Implemente consumindo cliente gerado do OpenAPI.
"""

7) Mobile
"""
Para RF004–RF007/RF028 e RF025–RF026, liste telas, navegação, estados e AC. Implemente com armazenamento seguro de token/PIN e reprodução de áudio.
"""

8) Relatórios/Export
"""
Implemente endpoints de agregação para RF016–RF019 e exportação (RF020). Garanta SLAs de tempo de resposta e paginação quando aplicável.
"""

Apêndice — Comandos Úteis (ajuste aos scripts reais)
- bun install
- docker compose up -d
- bun run db:generate
- bun run db:migrate
- bunx turbo run dev
- bunx turbo run lint
- bunx turbo run test
- bunx turbo run build