-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: flig_db
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
-- Dumping data for table `assinaturas`
--

LOCK TABLES `assinaturas` WRITE;
/*!40000 ALTER TABLE `assinaturas` DISABLE KEYS */;
INSERT INTO `assinaturas` VALUES (1,3,2,'pending','2025-10-13','2025-11-13',189.90,'BRL',NULL,NULL,'2025-10-13 00:27:46','2025-10-13 00:27:46'),(2,3,2,'pending','2025-10-13','2025-11-13',189.90,'BRL',NULL,NULL,'2025-10-13 00:30:45','2025-10-13 00:30:45'),(3,3,1,'pending','2025-10-13','2025-11-13',89.90,'BRL',NULL,NULL,'2025-10-13 00:39:58','2025-10-13 00:39:58'),(4,3,2,'pending','2025-10-13','2025-11-13',189.90,'BRL',NULL,NULL,'2025-10-13 00:46:51','2025-10-13 00:46:51'),(5,3,1,'pending','2025-10-13','2025-11-13',89.90,'BRL',NULL,NULL,'2025-10-13 00:51:00','2025-10-13 00:51:00');
/*!40000 ALTER TABLE `assinaturas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `configuracoes_sistema`
--

LOCK TABLES `configuracoes_sistema` WRITE;
/*!40000 ALTER TABLE `configuracoes_sistema` DISABLE KEYS */;
INSERT INTO `configuracoes_sistema` VALUES (1,'max_avancos_por_pagamento','8','Número máximo de posições que podem ser avançadas por pagamento','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(2,'valor_base_avancos','2.00','Valor base por posição avançada','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(3,'tempo_estimado_por_posicao','5','Tempo estimado em minutos por posição na fila','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(4,'redis_connection_timeout','5000','Timeout de conexão com Redis em milissegundos','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(5,'encryption_key_rotation_days','90','Dias para rotação da chave de criptografia','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(6,'max_queue_size','1000','Número máximo de clientes por fila','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(7,'auto_close_inactive_queues_hours','24','Horas para fechar automaticamente filas inativas','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(8,'enable_payment_simulation','true','Habilitar simulação de pagamentos (apenas para testes)','boolean','2025-10-06 23:01:38','2025-10-06 23:01:38'),(9,'notification_retry_attempts','3','Número de tentativas para reenvio de notificações','number','2025-10-06 23:01:38','2025-10-06 23:01:38'),(10,'notification_retry_delay','5000','Delay entre tentativas de reenvio em milissegundos','number','2025-10-06 23:01:38','2025-10-06 23:01:38');
/*!40000 ALTER TABLE `configuracoes_sistema` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `estabelecimentos`
--

LOCK TABLES `estabelecimentos` WRITE;
/*!40000 ALTER TABLE `estabelecimentos` DISABLE KEYS */;
INSERT INTO `estabelecimentos` VALUES (1,'BANCO DO BRASIL SA','00000000000191','04757020','Avenida Doutor Mário Vilas Boas Rodrigues','','housegreg@domicile.com','$2a$12$M5ZuUIfXKOk4G3hSdbLSK.ige4KSexfP/TL71n1pmYRZxErqb8GCC','','','',100,'ativo','2025-10-06 23:10:35','2025-10-06 23:10:35',NULL,NULL,NULL,NULL),(2,'MARIA CLARA OTICAS LTDA','48803580000181','05728020','Rua Cantori','','housegregory@house.com','$2a$12$TXTxsWE4SIG3mZWfO2dkD.loTPQkRxE6VvaOkjbmv/YZmcexQ407.','','','',100,'ativo','2025-10-07 01:33:55','2025-10-07 01:33:55',NULL,NULL,NULL,NULL),(3,'BEATRIZ ALMEIDA DE MOURA LTDA','57773654000175','04757020','Avenida Doutor Mário Vilas Boas Rodrigues','11987732110','rafaelmatosoliveira7@gmail.com','$2a$12$G4uUlK1kB2sGcPsJWt1oZ.DIZfVftkks6Q1BrKHFYyKDqNtHkUqYW',NULL,NULL,NULL,100,'ativo','2025-10-12 01:24:55','2025-10-12 01:24:55',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `estabelecimentos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `filas`
--

LOCK TABLES `filas` WRITE;
/*!40000 ALTER TABLE `filas` DISABLE KEYS */;
INSERT INTO `filas` VALUES ('21d0df66-4e35-4728-9e96-1cde55a9e18e','Teste2',2,'','ativa',8,2.00,5,0,0.00,'2025-10-08 05:08:33','2025-10-08 05:08:33',0.00,0,'2025-10-12 20:25:58',0,5,NULL,'manual',0.00,0),('28ff84d5-0555-42da-a0a2-e9d1f3c70666','Teste',3,'','encerrada',8,2.00,5,0,0.00,'2025-10-12 06:01:05','2025-10-13 00:51:13',0.00,0,'2025-10-12 21:51:13',0,5,NULL,'manual',0.00,0),('44782c94-747f-423a-9c77-eccf79a8f7e7','FilaTeste',2,'','ativa',8,2.00,5,0,0.00,'2025-10-08 04:30:47','2025-10-08 04:30:47',0.00,0,'2025-10-12 20:25:58',0,5,NULL,'manual',0.00,0),('4d8d502c-fe10-4e16-bff9-b37b4eb9e346','Teste',3,'','encerrada',8,2.00,5,0,0.00,'2025-10-12 04:42:20','2025-10-13 00:51:21',3.00,3,'2025-10-12 21:51:21',1,2,'2025-10-12 21:25:41','automatico',0.00,0),('87df000d-5b68-4696-9c99-d357af3e3655','Teste',3,'','ativa',8,2.00,5,0,0.00,'2025-10-13 00:51:37','2025-10-13 00:51:37',0.00,0,'2025-10-12 21:51:36',0,5,NULL,'manual',0.00,0),('d06d9529-d390-4331-b4b1-9c76e31a7e74','Teste2',3,'','ativa',8,2.00,5,0,0.00,'2025-10-12 05:10:56','2025-10-12 23:24:32',10.48,12,'2025-10-12 23:24:32',0,5,NULL,'manual',0.42,12);
/*!40000 ALTER TABLE `filas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_log_system_events` AFTER INSERT ON `filas` FOR EACH ROW BEGIN
    INSERT INTO logs_sistema (nivel, modulo, acao, descricao, dados_extras)
    VALUES ('info', 'filas', 'criacao', CONCAT('Nova fila criada: ', NEW.nome), JSON_OBJECT('queue_id', NEW.id, 'estabelecimento_id', NEW.estabelecimento_id));
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
-- Dumping data for table `historico_clientes_filas`
--

LOCK TABLES `historico_clientes_filas` WRITE;
/*!40000 ALTER TABLE `historico_clientes_filas` DISABLE KEYS */;
INSERT INTO `historico_clientes_filas` VALUES (11,'client-1','4d8d502c-fe10-4e16-bff9-b37b4eb9e346','Cliente','00000000000','cliente1@teste.com',1,NULL,NULL,0.00,'atendido','2025-10-12 20:51:44',NULL,'2025-10-12 20:49:44','2025-10-12 23:51:44',2.00,NULL),(12,'client-2','4d8d502c-fe10-4e16-bff9-b37b4eb9e346','Cliente','00000000000','cliente2@teste.com',1,NULL,NULL,0.00,'atendido','2025-10-12 20:51:44',NULL,'2025-10-12 20:47:44','2025-10-12 23:51:44',4.00,NULL),(13,'client-3','4d8d502c-fe10-4e16-bff9-b37b4eb9e346','Cliente','00000000000','cliente3@teste.com',1,NULL,NULL,0.00,'atendido','2025-10-12 20:51:44',NULL,'2025-10-12 20:48:44','2025-10-12 23:51:44',3.00,NULL),(142,'client-001','d06d9529-d390-4331-b4b1-9c76e31a7e74','Ana Silva','11999999999',NULL,1,1,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(143,'client-002','d06d9529-d390-4331-b4b1-9c76e31a7e74','Bruno Santos','11999999999',NULL,2,2,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(144,'client-003','d06d9529-d390-4331-b4b1-9c76e31a7e74','Carla Lima','11999999999',NULL,3,3,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(145,'client-004','d06d9529-d390-4331-b4b1-9c76e31a7e74','Diego Costa','11999999999',NULL,4,4,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(146,'client-005','d06d9529-d390-4331-b4b1-9c76e31a7e74','Elena Rocha','11999999999',NULL,5,5,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(147,'client-006','d06d9529-d390-4331-b4b1-9c76e31a7e74','Felipe Alves','11999999999',NULL,6,6,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(148,'client-007','d06d9529-d390-4331-b4b1-9c76e31a7e74','Gabriela Souza','11999999999',NULL,7,7,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(149,'client-008','d06d9529-d390-4331-b4b1-9c76e31a7e74','Henrique Oliveira','11999999999',NULL,8,8,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(150,'client-009','d06d9529-d390-4331-b4b1-9c76e31a7e74','Isabela Ferreira','11999999999',NULL,9,9,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(151,'client-010','d06d9529-d390-4331-b4b1-9c76e31a7e74','João Pereira','11999999999',NULL,10,10,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(152,'3388bdc9-d3d3-448a-ae2e-1aa565a71f7c','d06d9529-d390-4331-b4b1-9c76e31a7e74','Rafael Matos','11999999999',NULL,11,11,NULL,0.00,'aguardando','2025-10-13 01:44:41',NULL,'2025-10-13 01:44:41',NULL,NULL,NULL),(153,'3070cab1-9e3d-44e4-809e-3bce72affdc8','d06d9529-d390-4331-b4b1-9c76e31a7e74','Cliente','00000000000','rafaelmo10@outlook.com.br',10,NULL,NULL,0.00,'aguardando','2025-10-13 01:49:58',NULL,'2025-10-13 01:49:58',NULL,NULL,NULL);
/*!40000 ALTER TABLE `historico_clientes_filas` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `logs_sistema`
--

LOCK TABLES `logs_sistema` WRITE;
/*!40000 ALTER TABLE `logs_sistema` DISABLE KEYS */;
INSERT INTO `logs_sistema` VALUES (1,'info','filas','criacao','Nova fila criada: FilaTeste','{\"queue_id\": \"44782c94-747f-423a-9c77-eccf79a8f7e7\", \"estabelecimento_id\": 2}',NULL,NULL,'2025-10-08 01:30:47'),(2,'info','filas','criacao','Nova fila criada: Teste2','{\"queue_id\": \"21d0df66-4e35-4728-9e96-1cde55a9e18e\", \"estabelecimento_id\": 2}',NULL,NULL,'2025-10-08 02:08:33'),(3,'info','filas','criacao','Nova fila criada: Teste','{\"queue_id\": \"4d8d502c-fe10-4e16-bff9-b37b4eb9e346\", \"estabelecimento_id\": 3}',NULL,NULL,'2025-10-12 01:42:19'),(4,'info','filas','criacao','Nova fila criada: Teste2','{\"queue_id\": \"d06d9529-d390-4331-b4b1-9c76e31a7e74\", \"estabelecimento_id\": 3}',NULL,NULL,'2025-10-12 02:10:56'),(5,'info','filas','criacao','Nova fila criada: Teste','{\"queue_id\": \"28ff84d5-0555-42da-a0a2-e9d1f3c70666\", \"estabelecimento_id\": 3}',NULL,NULL,'2025-10-12 03:01:04'),(6,'info','filas','criacao','Nova fila criada: Teste','{\"queue_id\": \"87df000d-5b68-4696-9c99-d357af3e3655\", \"estabelecimento_id\": 3}',NULL,NULL,'2025-10-12 21:51:36');
/*!40000 ALTER TABLE `logs_sistema` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `notificacoes`
--

LOCK TABLES `notificacoes` WRITE;
/*!40000 ALTER TABLE `notificacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacoes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `planos`
--

LOCK TABLES `planos` WRITE;
/*!40000 ALTER TABLE `planos` DISABLE KEYS */;
INSERT INTO `planos` VALUES (1,'Essencial','Plano básico para pequenos estabelecimentos',89.90,'monthly',3,50,'{\"suporte_email\": true, \"filas_ilimitadas\": false, \"relatorios_basicos\": true}',1,'2025-10-13 00:15:29','2025-10-13 00:15:29'),(2,'Profissional','Plano completo para estabelecimentos em crescimento',189.90,'monthly',NULL,NULL,'{\"api_access\": true, \"filas_ilimitadas\": true, \"suporte_prioritario\": true, \"relatorios_avancados\": true}',1,'2025-10-13 00:15:29','2025-10-13 00:15:29'),(3,'Essencial','Plano básico para pequenos estabelecimentos',89.90,'monthly',3,50,'{\"suporte_email\": true, \"filas_ilimitadas\": false, \"relatorios_basicos\": true}',1,'2025-10-13 00:15:43','2025-10-13 00:15:43'),(4,'Profissional','Plano completo para estabelecimentos em crescimento',189.90,'monthly',NULL,NULL,'{\"api_access\": true, \"filas_ilimitadas\": true, \"suporte_prioritario\": true, \"relatorios_avancados\": true}',1,'2025-10-13 00:15:43','2025-10-13 00:15:43');
/*!40000 ALTER TABLE `planos` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `relatorios_diarios`
--

LOCK TABLES `relatorios_diarios` WRITE;
/*!40000 ALTER TABLE `relatorios_diarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `relatorios_diarios` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `transacoes_pagamentos`
--

LOCK TABLES `transacoes_pagamentos` WRITE;
/*!40000 ALTER TABLE `transacoes_pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `transacoes_pagamentos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `tr_update_queue_stats_after_transaction` AFTER INSERT ON `transacoes_pagamentos` FOR EACH ROW BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE filas 
        SET 
            receita_total = receita_total + NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.queue_id;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
-- Dumping data for table `user_devices`
--

LOCK TABLES `user_devices` WRITE;
/*!40000 ALTER TABLE `user_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_devices` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Gregório House','05452815473',NULL,'','gregoriohouse@email.com','$2a$12$kSXmKdVap/uZ/RViw/sTu.jTs5uH42RNL2QzGHkRNS06HuEhqa9Rq','','Xique-Xique',NULL,NULL,NULL,'BA','2025-10-07 01:37:42','2025-10-07 01:37:42',NULL,NULL),(2,'Usuário Teste','32186402106',NULL,'','bolso@naro.com','$2a$12$MJyIlustvZoKiBRd3TPJh.si24dHUVSkr.x9ea7TymyOy2/BhEZ7q','','São Paulo',NULL,NULL,NULL,'SP','2025-10-08 01:18:35','2025-10-08 01:18:35',NULL,NULL),(3,'Teste User','11144477735',NULL,NULL,'teste@teste.com','$2a$12$UErTjUCzfsR06m4JyBALfusVY4i/K4Gi6xjPiZPFsQFv2/UTBhC26','12345-678','Rua Teste',NULL,NULL,NULL,'123','2025-10-09 13:41:53','2025-10-11 21:29:06',NULL,NULL),(4,'Teste3','89521283386',NULL,NULL,'teste5@email.com','$2a$12$3BqeFCoVxOy34pBsntQNoOI/yWhuepgyyP3qSeU9oujouTzy7zFrG',NULL,'São Paulo',NULL,NULL,NULL,'SP','2025-10-11 02:10:52','2025-10-11 02:10:52',NULL,NULL),(5,'Teste','12345678909',NULL,'11999999999','teste4@teste.com','$2a$12$6ZAfleFLLGBY5RfPqQvwGOPhqWOaxk9kLD8sddBYetrBYt8lTSn1u','01234567','Rua Teste',NULL,NULL,NULL,'123','2025-10-11 04:00:53','2025-10-11 04:00:53',NULL,NULL),(6,'Teste Cache','98765432100',NULL,'11999999999','teste-cache@teste.com','$2a$12$JwcbyuNKOnZLKmu0yw.li.PTREt1CTwqZse6mqTRodKur5UFH38hG','01234567','Rua Teste',NULL,NULL,NULL,'123','2025-10-11 04:09:38','2025-10-11 04:09:38',NULL,NULL),(7,'Teste','54418334165',NULL,'1199831948','teste3@email.com','$2a$12$QGv1j7fj4iDQfhNL/S7wA.q1IyrkhfmV6HhAiF.M6eI8ti3N7kZbi','04728001','Avenida Arquiteto Carlos Bratke',NULL,NULL,NULL,'111','2025-10-11 04:21:51','2025-10-11 04:21:51',NULL,NULL),(8,'TesteNovo','01552828832',NULL,'11986673120','testenovo@email.com','$2a$12$AkwO337jRBk1gqvHwe2C3OBKHZ4p2inmGTEyLbKwR5PAXjkVob8VG','01310100','Avenida Paulista',NULL,NULL,NULL,'111','2025-10-11 04:33:11','2025-10-11 04:33:11',NULL,NULL),(9,'TesteNovo2','56415361139',NULL,'11987762108','testenovo2@email.com','$2a$12$JlGsf2nzf2qLg7fkgZF86Op361vYDC8Fc1VxVox0UiXBMwWYBX6ZK','20040020','Praça Pio X',NULL,NULL,NULL,'121','2025-10-11 04:38:08','2025-10-11 04:38:08',NULL,NULL),(10,'TesteNovo3','41481647695',NULL,'11987732719','testando@email.com','$2a$12$1e1wcFuid98T4Eq/2A7LCuOLMLBWVoDbeUtDdUu5YGTYCfzlWnd5e','01310100','Avenida Paulista',NULL,NULL,NULL,'100','2025-10-11 04:46:18','2025-10-11 04:46:18',NULL,NULL),(11,'Rafael Matos','48054815875',NULL,'11947757210','rafaelmo10@outlook.com.br','$2a$12$rM8grfyqvaeIPtdX0jjOA.U/p3KyK0I10U/s8Wc5fdoqC85Dr72Ja','04728001','Avenida Arquiteto Carlos Bratke',NULL,NULL,NULL,'630','2025-10-11 21:14:10','2025-10-11 23:51:21',NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

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

-- Dump completed on 2025-10-12 23:10:10
