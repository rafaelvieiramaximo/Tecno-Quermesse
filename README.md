# Sistema Bancário para Quermesse 🎟️💳

Este projeto consiste em um sistema de controle financeiro voltado para eventos de quermesse, onde usuários utilizam um "cartão" com QR Code para abastecer e gastar seus créditos em diversas barracas do evento.

## 🧠 Conceito

O sistema simula um banco digital local para o evento, permitindo o controle seguro e prático das transações realizadas entre administradores e vendedores de barracas.

## 🔐 Tipos de Acesso

- **Administrador:** Responsável por inserir créditos nas contas dos usuários via QR Code. Também poderá visualizar relatórios e gerenciar o fluxo de caixa.
- **Operador de Barraca:** Responsável por debitar os créditos dos cartões dos usuários após a venda de produtos ou serviços.

## ⚙️ Funcionalidades

- Leitura de QR Code para identificação de usuários.
- Cadastro de contas e saldo inicial.
- Abastecimento de créditos via interface do administrador.
- Débito de créditos em tempo real pelas barracas.
- Controle de autenticação por tipo de usuário (admin e operador).
- Registros em banco de dados com `INSERT` e `UPDATE` nas contas.
- Registro de transações para histórico e auditoria.

## 💾 Tecnologias

- NextJS (Framework)
- TypeScript
- Banco de dados relacional (ex: PostgreSQL, MySQL ou SQLite)
- Leitura de QR Code (via câmera do dispositivo)
- Supabase (BackEnd)

## 📌 Objetivo

Facilitar o controle de pagamentos e consumo dentro da quermesse, substituindo fichas físicas por um sistema digital intuitivo, seguro e rastreável.

---

Este sistema foi pensado para ser leve, portátil e funcional mesmo em ambientes com infraestrutura limitada, ideal para eventos temporários como quermesses e festas comunitárias.
# Tecno-Quermesse
