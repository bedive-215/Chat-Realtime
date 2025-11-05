CREATE DATABASE  IF NOT EXISTS `chat_realtime` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `chat_realtime`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: chat_realtime
-- ------------------------------------------------------
-- Server version	9.1.0

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
-- Table structure for table `chat_participants`
--

DROP TABLE IF EXISTS `chat_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_participants` (
  `chat_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`chat_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_participants`
--

LOCK TABLES `chat_participants` WRITE;
/*!40000 ALTER TABLE `chat_participants` DISABLE KEYS */;
INSERT INTO `chat_participants` VALUES (1,2,'2025-09-08 08:57:25'),(1,5,'2025-09-08 08:57:25'),(2,1,'2025-09-20 13:00:43'),(2,5,'2025-09-20 13:00:43'),(3,4,'2025-09-20 13:00:43'),(3,5,'2025-09-20 13:00:43'),(4,3,'2025-09-20 13:00:43'),(4,5,'2025-09-20 13:00:43'),(6,6,'2025-09-28 13:53:13'),(6,7,'2025-09-28 13:53:13'),(7,2,'2025-10-29 14:30:06'),(7,7,'2025-10-29 14:30:06'),(8,7,'2025-10-29 15:00:00'),(8,9,'2025-10-29 15:00:00'),(9,7,'2025-10-29 15:00:38'),(9,8,'2025-10-29 15:00:38');
/*!40000 ALTER TABLE `chat_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chats` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `is_group` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chats`
--

LOCK TABLES `chats` WRITE;
/*!40000 ALTER TABLE `chats` DISABLE KEYS */;
INSERT INTO `chats` VALUES (1,NULL,0,'2025-09-08 08:57:25'),(2,NULL,0,'2025-09-20 13:00:02'),(3,NULL,0,'2025-09-20 13:00:02'),(4,NULL,0,'2025-09-20 13:00:02'),(5,NULL,0,'2025-09-20 13:00:02'),(6,NULL,0,'2025-09-28 13:53:13'),(7,NULL,0,'2025-10-29 14:30:06'),(8,NULL,0,'2025-10-29 15:00:00'),(9,NULL,0,'2025-10-29 15:00:38');
/*!40000 ALTER TABLE `chats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `requester_id` bigint NOT NULL,
  `receiver_id` bigint NOT NULL,
  `status` enum('pending','accepted','declined','blocked') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`requester_id`,`receiver_id`),
  KEY `fk_receiver` (`receiver_id`),
  CONSTRAINT `fk_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requester` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (44,1,2,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(45,1,3,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(46,1,4,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(47,1,5,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(48,2,3,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(49,2,4,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(50,2,5,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(51,3,4,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(52,3,5,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(53,4,5,'accepted','2025-09-18 17:30:53','2025-09-18 17:30:53'),(64,6,7,'accepted','2025-09-28 13:49:18','2025-09-28 13:53:12'),(65,1,7,'pending','2025-09-30 13:25:37','2025-09-30 13:25:37'),(66,5,7,'pending','2025-10-08 12:46:29','2025-10-08 12:46:29'),(67,2,7,'accepted','2025-10-29 13:56:22','2025-10-29 14:30:06'),(68,9,7,'accepted','2025-10-29 14:50:54','2025-10-29 15:00:00'),(69,8,7,'accepted','2025-10-29 15:00:33','2025-10-29 15:00:38');
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `phone_number` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_avatar` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone_number` (`phone_number`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'alice','0123456789','alice@gmail.com','$2b$10$Uyr/bmmOmPx3T4fwuJvBLOuLxp9m9iYhVCCBmtYOTRzTHU1fXNykm','2025-09-01 07:55:46','2025-09-17 13:01:54','https://res.cloudinary.com/dc0cssmpo/image/upload/v1758114115/avatars/dkym05eyzcfhiffogdre.jpg'),(2,'bedive','0123456987','bedive@gmail.com','$2b$10$cIXzyh.n0tU8DvrUo3XIkeelI8K5w4TNmavH8z2hXNcj/KFVUv1g2','2025-09-05 08:47:33','2025-09-05 08:47:33',NULL),(3,'jonh','0133456789','jonh@gmail.com','$2b$10$dF1ggvuymTZiiilUIheEyeSMHETJUtdjMi/.gFjNX/eh9W.A3RjSC','2025-09-12 14:05:18','2025-09-12 14:05:18',NULL),(4,'hana','0329858598','hana@gmail.com','$2b$10$i2O2t7Nmf3.SaPnWLn1FoeiXu/JHkbHi4ogOG.RuxlwwcrIVNLNLq','2025-09-13 09:12:05','2025-09-13 09:12:05',NULL),(5,'xhasi','0325989865','xhasi@gmail.com','$2b$10$knCoqc5OrurlZlg699eZ8eDnVzZmC3MaQQy3oh3HMmgckGhQhwjY6','2025-09-13 09:33:11','2025-09-16 14:15:29','https://res.cloudinary.com/dc0cssmpo/image/upload/v1758032130/avatars/odwf7ipv1fytynq1jeko.jpg'),(6,'bedivex','0123455987','bedivex@gmail.com','$2b$10$Ahl9enInbPF9r8kdi8sOXOBXpnJhbqq/Tc9UyxdVX99AXIcFqK9zC','2025-09-13 09:40:14','2025-09-13 09:40:14',NULL),(7,'bankai','0123458789','bankai@gmail.com','$2b$10$fxYYKmIQtmvIHme5b1Emnur4/s3sCcFTaapll2mu..I9y0NMUNZaS','2025-09-13 10:12:46','2025-09-13 10:12:46',NULL),(8,'jonhdoe','0323456789','jonhdoe@gmail.com','$2b$10$oxlgA6/xLf4RQw2.BfmN.ee1x8ExNuI7EeJDYS5g9PnyrMRoMobB.','2025-09-13 10:30:38','2025-09-13 10:30:38',NULL),(9,'hanaba','0327474841','hanaba@gmail.com','$2b$10$NmWzhzpL/G0yuxe8gZn/buIOMQ2B0tMmK4MonrbKvr8b2d9P.nDEG','2025-09-13 12:34:33','2025-09-13 12:34:33',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'chat_realtime'
--

--
-- Dumping routines for database 'chat_realtime'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-05  9:05:39
