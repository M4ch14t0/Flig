CREATE DATABASE  IF NOT EXISTS `flig_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `flig_db`;
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: flig_db
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assinaturas`
--

DROP TABLE IF EXISTS `assinaturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinaturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estabelecimento_id` int NOT NULL,
  `plano_id` int NOT NULL,
  `status` enum('active','inactive','cancelled','expired','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `data_inicio` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `moeda` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'BRL',
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subscription_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `plano_id` (`plano_id`),
  KEY `idx_estabelecimento` (`estabelecimento_id`),
  KEY `idx_status` (`status`),
  KEY `idx_vencimento` (`data_vencimento`),
  CONSTRAINT `assinaturas_ibfk_1` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assinaturas_ibfk_2` FOREIGN KEY (`plano_id`) REFERENCES `planos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `configuracoes_sistema`
--

DROP TABLE IF EXISTS `configuracoes_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `tipo` enum('string','number','boolean','json') COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chave` (`chave`),
  KEY `idx_chave` (`chave`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Configurações globais do sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estabelecimentos`
--

DROP TABLE IF EXISTS `estabelecimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estabelecimentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_empresa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cep_empresa` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco_empresa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone_empresa` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_empresa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_empresa` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `categoria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `horario_funcionamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `capacidade_maxima` int DEFAULT '100',
  `status` enum('ativo','inativo','suspenso') COLLATE utf8mb4_unicode_ci DEFAULT 'ativo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `plano_ativo_id` int DEFAULT NULL,
  `plano_vencimento` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnpj` (`cnpj`),
  UNIQUE KEY `email_empresa` (`email_empresa`),
  KEY `idx_cnpj` (`cnpj`),
  KEY `idx_email` (`email_empresa`),
  KEY `idx_status` (`status`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_estabelecimentos_reset_token` (`reset_token`),
  KEY `idx_estabelecimentos_reset_expires` (`reset_expires`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de estabelecimentos cadastrados no sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `filas`
--

DROP TABLE IF EXISTS `filas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filas` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estabelecimento_id` int NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ativa','pausada','encerrada') COLLATE utf8mb4_unicode_ci DEFAULT 'ativa',
  `max_avancos` int DEFAULT '8',
  `valor_avancos` decimal(10,2) DEFAULT '2.00',
  `tempo_estimado` int DEFAULT '5',
  `total_clientes_atendidos` int DEFAULT '0',
  `receita_total` decimal(12,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tempo_medio_espera` decimal(8,2) DEFAULT '0.00' COMMENT 'Tempo médio de espera em minutos',
  `total_atendidos_tempo` int DEFAULT '0' COMMENT 'Total de clientes atendidos para cálculo da média',
  `ultima_atualizacao_tempo` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última atualização do tempo médio',
  `chamada_automatica` tinyint(1) DEFAULT '0' COMMENT 'Se a fila tem chamada automática ativada',
  `intervalo_chamada` int DEFAULT '5' COMMENT 'Intervalo em minutos entre chamadas automáticas',
  `ultima_chamada` timestamp NULL DEFAULT NULL COMMENT 'Última vez que foi feita uma chamada automática',
  `modo_chamada` enum('manual','automatico','misto') COLLATE utf8mb4_unicode_ci DEFAULT 'manual' COMMENT 'Modo de chamada da fila',
  `tempo_medio_atendimento` decimal(10,2) DEFAULT '0.00' COMMENT 'Tempo médio de atendimento por cliente (minutos)',
  `total_atendimentos_calculados` int DEFAULT '0' COMMENT 'Total de atendimentos para cálculo do tempo médio',
  PRIMARY KEY (`id`),
  KEY `idx_estabelecimento` (`estabelecimento_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_filas_status_estabelecimento` (`status`,`estabelecimento_id`),
  KEY `idx_tempo_espera` (`tempo_medio_espera`),
  KEY `idx_chamada_automatica` (`chamada_automatica`,`ultima_chamada`),
  KEY `idx_modo_chamada` (`modo_chamada`),
  CONSTRAINT `filas_ibfk_1` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de filas virtuais criadas pelos estabelecimentos';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `historico_clientes_filas`
--

DROP TABLE IF EXISTS `historico_clientes_filas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_clientes_filas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_cliente` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone_cliente` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_cliente` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `posicao_inicial` int NOT NULL,
  `posicao_final` int DEFAULT NULL,
  `tempo_espera` int DEFAULT NULL,
  `valor_pago` decimal(10,2) DEFAULT '0.00',
  `status` enum('aguardando','chamado','atendido','cancelado','abandonou') COLLATE utf8mb4_unicode_ci DEFAULT 'aguardando',
  `data_entrada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `data_saida` timestamp NULL DEFAULT NULL,
  `tempo_entrada` timestamp NULL DEFAULT NULL COMMENT 'Momento exato que o cliente entrou na fila',
  `tempo_atendimento` timestamp NULL DEFAULT NULL COMMENT 'Momento exato que o cliente foi atendido',
  `tempo_espera_minutos` decimal(8,2) DEFAULT NULL COMMENT 'Tempo de espera calculado em minutos',
  `tempo_atendimento_minutos` decimal(10,2) DEFAULT NULL COMMENT 'Tempo que levou para atender este cliente (minutos)',
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_queue_id` (`queue_id`),
  KEY `idx_status` (`status`),
  KEY `idx_data_entrada` (`data_entrada`),
  KEY `idx_historico_status_data` (`status`,`data_entrada`),
  KEY `idx_tempo_entrada` (`tempo_entrada`),
  KEY `idx_tempo_atendimento` (`tempo_atendimento`),
  KEY `idx_tempo_espera` (`tempo_espera_minutos`),
  CONSTRAINT `historico_clientes_filas_ibfk_1` FOREIGN KEY (`queue_id`) REFERENCES `filas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico de clientes que passaram pelas filas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `logs_sistema`
--

DROP TABLE IF EXISTS `logs_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_sistema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nivel` enum('info','warning','error','debug') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `modulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acao` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `dados_extras` json DEFAULT NULL,
  `ip_origem` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nivel` (`nivel`),
  KEY `idx_modulo` (`modulo`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de eventos e erros do sistema';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notificacoes`
--

DROP TABLE IF EXISTS `notificacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_type` enum('cliente','estabelecimento') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` json DEFAULT NULL,
  `channels` json NOT NULL,
  `status` enum('sent','delivered','read','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'sent',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_notificacoes_user_status` (`user_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sistema de notificações para usuários';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assinatura_id` int NOT NULL,
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','cancelled','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `valor` decimal(10,2) NOT NULL,
  `moeda` varchar(3) COLLATE utf8mb4_unicode_ci DEFAULT 'BRL',
  `metodo_pagamento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_pagamento` timestamp NULL DEFAULT NULL,
  `data_vencimento` timestamp NULL DEFAULT NULL,
  `webhook_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assinatura_id` (`assinatura_id`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_status` (`status`),
  KEY `idx_data_pagamento` (`data_pagamento`),
  CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`assinatura_id`) REFERENCES `assinaturas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_type` enum('cliente','estabelecimento') COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user` (`user_id`,`user_type`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `planos`
--

DROP TABLE IF EXISTS `planos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `preco` decimal(10,2) NOT NULL,
  `periodo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `max_filas` int DEFAULT NULL,
  `max_clientes_por_fila` int DEFAULT NULL,
  `recursos` json DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `relatorios_diarios`
--

DROP TABLE IF EXISTS `relatorios_diarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relatorios_diarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estabelecimento_id` int NOT NULL,
  `queue_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_relatorio` date NOT NULL,
  `total_clientes` int DEFAULT '0',
  `clientes_atendidos` int DEFAULT '0',
  `tempo_medio_espera` decimal(8,2) DEFAULT '0.00',
  `receita_total` decimal(12,2) DEFAULT '0.00',
  `total_avancos` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_daily_report` (`estabelecimento_id`,`queue_id`,`data_relatorio`),
  KEY `idx_estabelecimento` (`estabelecimento_id`),
  KEY `idx_queue_id` (`queue_id`),
  KEY `idx_data_relatorio` (`data_relatorio`),
  CONSTRAINT `relatorios_diarios_ibfk_1` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `relatorios_diarios_ibfk_2` FOREIGN KEY (`queue_id`) REFERENCES `filas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relatórios diários de performance das filas';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transacoes_pagamentos`
--

DROP TABLE IF EXISTS `transacoes_pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transacoes_pagamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `positions` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('credit_card','debit_card','pix','boleto') COLLATE utf8mb4_unicode_ci DEFAULT 'credit_card',
  `status` enum('pending','approved','failed','confirmed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `payment_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_queue_id` (`queue_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_transacoes_status_queue` (`status`,`queue_id`),
  CONSTRAINT `transacoes_pagamentos_ibfk_1` FOREIGN KEY (`queue_id`) REFERENCES `filas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico de transações de pagamento para avanço de posições';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_devices`
--

DROP TABLE IF EXISTS `user_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `user_type` enum('cliente','estabelecimento') COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_type` enum('ios','android','web') COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_info` json DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `last_used` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device_token` (`device_token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_active` (`active`),
  KEY `idx_user_devices_active` (`user_id`,`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dispositivos registrados para push notifications';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_usuario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpf` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_nascimento` date DEFAULT NULL,
  `telefone_usuario` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_usuario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_usuario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cep_usuario` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco_usuario` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro_usuario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade_usuario` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uf_usuario` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_usuario` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`),
  UNIQUE KEY `email_usuario` (`email_usuario`),
  KEY `idx_cpf` (`cpf`),
  KEY `idx_email` (`email_usuario`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_usuarios_reset_token` (`reset_token`),
  KEY `idx_usuarios_reset_expires` (`reset_expires`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela de usuários (clientes) do sistema Flig';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `view_estatisticas_estabelecimentos`
--

DROP TABLE IF EXISTS `view_estatisticas_estabelecimentos`;
/*!50001 DROP VIEW IF EXISTS `view_estatisticas_estabelecimentos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_estatisticas_estabelecimentos` AS SELECT 
 1 AS `id`,
 1 AS `nome_empresa`,
 1 AS `cnpj`,
 1 AS `status`,
 1 AS `total_filas`,
 1 AS `filas_ativas`,
 1 AS `total_clientes_atendidos`,
 1 AS `receita_total`,
 1 AS `tempo_medio_estimado`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_estatisticas_filas`
--

DROP TABLE IF EXISTS `view_estatisticas_filas`;
/*!50001 DROP VIEW IF EXISTS `view_estatisticas_filas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_estatisticas_filas` AS SELECT 
 1 AS `id`,
 1 AS `nome`,
 1 AS `estabelecimento_id`,
 1 AS `nome_empresa`,
 1 AS `status`,
 1 AS `total_clientes_atendidos`,
 1 AS `receita_total`,
 1 AS `max_avancos`,
 1 AS `valor_avancos`,
 1 AS `tempo_estimado`,
 1 AS `total_transacoes`,
 1 AS `receita_confirmada`,
 1 AS `media_posicoes_avancadas`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `view_estatisticas_estabelecimentos`
--

/*!50001 DROP VIEW IF EXISTS `view_estatisticas_estabelecimentos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_estatisticas_estabelecimentos` AS select `e`.`id` AS `id`,`e`.`nome_empresa` AS `nome_empresa`,`e`.`cnpj` AS `cnpj`,`e`.`status` AS `status`,count(distinct `f`.`id`) AS `total_filas`,count(distinct (case when (`f`.`status` = 'ativa') then `f`.`id` end)) AS `filas_ativas`,sum(`f`.`total_clientes_atendidos`) AS `total_clientes_atendidos`,sum(`f`.`receita_total`) AS `receita_total`,avg(`f`.`tempo_estimado`) AS `tempo_medio_estimado` from (`estabelecimentos` `e` left join `filas` `f` on((`e`.`id` = `f`.`estabelecimento_id`))) group by `e`.`id`,`e`.`nome_empresa`,`e`.`cnpj`,`e`.`status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_estatisticas_filas`
--

/*!50001 DROP VIEW IF EXISTS `view_estatisticas_filas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_estatisticas_filas` AS select `f`.`id` AS `id`,`f`.`nome` AS `nome`,`f`.`estabelecimento_id` AS `estabelecimento_id`,`e`.`nome_empresa` AS `nome_empresa`,`f`.`status` AS `status`,`f`.`total_clientes_atendidos` AS `total_clientes_atendidos`,`f`.`receita_total` AS `receita_total`,`f`.`max_avancos` AS `max_avancos`,`f`.`valor_avancos` AS `valor_avancos`,`f`.`tempo_estimado` AS `tempo_estimado`,count(`t`.`id`) AS `total_transacoes`,sum((case when (`t`.`status` = 'approved') then `t`.`amount` else 0 end)) AS `receita_confirmada`,avg((case when (`t`.`status` = 'approved') then `t`.`positions` else NULL end)) AS `media_posicoes_avancadas` from ((`filas` `f` left join `estabelecimentos` `e` on((`f`.`estabelecimento_id` = `e`.`id`))) left join `transacoes_pagamentos` `t` on((`f`.`id` = `t`.`queue_id`))) group by `f`.`id`,`f`.`nome`,`f`.`estabelecimento_id`,`e`.`nome_empresa`,`f`.`status`,`f`.`total_clientes_atendidos`,`f`.`receita_total`,`f`.`max_avancos`,`f`.`valor_avancos`,`f`.`tempo_estimado` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-12 23:23:15
