-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 21 avr. 2026 à 13:24
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `creaditn`
--

-- --------------------------------------------------------

--
-- Structure de la table `cards`
--

CREATE TABLE `cards` (
  `id` bigint(20) NOT NULL,
  `encrypted_card_number` varchar(255) NOT NULL,
  `expiry_date` varchar(5) NOT NULL,
  `is_default` bit(1) NOT NULL,
  `status` enum('ACTIVE','BLOCKED') NOT NULL,
  `type` enum('MASTERCARD','VISA') NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `card_number` varchar(1024) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `card_sequence`
--

CREATE TABLE `card_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `card_sequence`
--

INSERT INTO `card_sequence` (`next_val`) VALUES
(1);

-- --------------------------------------------------------

--
-- Structure de la table `creadi_scores`
--

CREATE TABLE `creadi_scores` (
  `id` bigint(20) NOT NULL,
  `badge` varchar(255) DEFAULT NULL,
  `behavior_score` int(11) DEFAULT NULL,
  `children_score` int(11) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `kyc_score` int(11) DEFAULT NULL,
  `level` enum('EXCELLENT','GOOD','HIGH_RISK','MEDIUM') NOT NULL,
  `marital_score` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `risk` enum('CRITICAL','HIGH','LOW','MODERATE') NOT NULL,
  `salary_score` int(11) DEFAULT NULL,
  `total_score` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `creadi_scores`
--

INSERT INTO `creadi_scores` (`id`, `badge`, `behavior_score`, `children_score`, `created_at`, `kyc_score`, `level`, `marital_score`, `reason`, `risk`, `salary_score`, `total_score`, `user_id`) VALUES
(1, NULL, 100, 100, '2026-04-20 12:32:52.000000', 0, 'HIGH_RISK', 50, 'Your score is at high risk level due to clean fraud record. Consider improving: identity not yet verified, no salary information provided.', 'CRITICAL', 0, 250, 1),
(2, 'SILVER', 200, 100, '2026-04-20 18:26:12.000000', 300, 'EXCELLENT', 50, 'Your score is excellent due to verified identity, stable salary, clean fraud record.', 'LOW', 200, 850, 1),
(3, 'SILVER', 200, 100, '2026-04-21 00:37:44.000000', 300, 'EXCELLENT', 50, 'Your score is excellent due to verified identity, stable salary, clean fraud record.', 'LOW', 200, 850, 1),
(4, NULL, 100, 100, '2026-04-21 00:39:11.000000', 0, 'HIGH_RISK', 50, 'Your score is at high risk level due to clean fraud record. Consider improving: identity not yet verified, no salary information provided.', 'CRITICAL', 0, 250, 2),
(5, 'SILVER', 200, 100, '2026-04-21 00:44:55.000000', 300, 'EXCELLENT', 50, 'Your score is excellent due to verified identity, stable salary, clean fraud record.', 'LOW', 200, 850, 1);

-- --------------------------------------------------------

--
-- Structure de la table `creadi_score_sequence`
--

CREATE TABLE `creadi_score_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `creadi_score_sequence`
--

INSERT INTO `creadi_score_sequence` (`next_val`) VALUES
(6);

-- --------------------------------------------------------

--
-- Structure de la table `credit_requests`
--

CREATE TABLE `credit_requests` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `down_payment` decimal(38,2) NOT NULL,
  `monthly_amount` decimal(38,2) NOT NULL,
  `number_of_installments` int(11) NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `total_amount` decimal(38,2) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `credit_requests`
--

INSERT INTO `credit_requests` (`id`, `created_at`, `down_payment`, `monthly_amount`, `number_of_installments`, `product_name`, `status`, `total_amount`, `user_id`) VALUES
(1, '2026-04-20 12:33:36.000000', 10.00, 30.00, 3, NULL, 'APPROVED', 100.00, 1),
(2, '2026-04-20 12:33:42.000000', 26.00, 77.67, 3, 'Zara Oversized Blazer', 'APPROVED', 259.00, 1),
(3, '2026-04-20 15:31:08.000000', 50.00, 150.00, 3, NULL, 'APPROVED', 500.00, 1),
(4, '2026-04-21 00:43:53.000000', 50.00, 150.00, 3, NULL, 'APPROVED', 500.00, 1),
(5, '2026-04-21 00:49:26.000000', 50.00, 150.00, 3, NULL, 'APPROVED', 500.00, 1),
(6, '2026-04-21 00:57:07.000000', 50.00, 150.00, 3, NULL, 'APPROVED', 500.00, 1),
(7, '2026-04-21 00:57:15.000000', 19.00, 56.67, 3, 'Zara Quilted Jacket', 'APPROVED', 189.00, 1);

-- --------------------------------------------------------

--
-- Structure de la table `credit_request_sequence`
--

CREATE TABLE `credit_request_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `credit_request_sequence`
--

INSERT INTO `credit_request_sequence` (`next_val`) VALUES
(8);

-- --------------------------------------------------------

--
-- Structure de la table `credit_scores`
--

CREATE TABLE `credit_scores` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `employment_type` varchar(255) DEFAULT NULL,
  `max_credit_amount` decimal(38,2) DEFAULT NULL,
  `monthly_expenses` decimal(38,2) DEFAULT NULL,
  `salary` decimal(38,2) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `years_of_experience` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `credit_score_sequence`
--

CREATE TABLE `credit_score_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `credit_score_sequence`
--

INSERT INTO `credit_score_sequence` (`next_val`) VALUES
(1);

-- --------------------------------------------------------

--
-- Structure de la table `financial_profiles`
--

CREATE TABLE `financial_profiles` (
  `id` bigint(20) NOT NULL,
  `employment_status` enum('FULL_TIME','OTHER','PART_TIME','SELF_EMPLOYED','STUDENT','UNEMPLOYED') NOT NULL,
  `monthly_salary` decimal(12,2) NOT NULL,
  `risk_level` enum('CRITICAL','HIGH','LOW','MODERATE') NOT NULL,
  `salary_day` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `financial_profile_sequence`
--

CREATE TABLE `financial_profile_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `financial_profile_sequence`
--

INSERT INTO `financial_profile_sequence` (`next_val`) VALUES
(1);

-- --------------------------------------------------------

--
-- Structure de la table `installments`
--

CREATE TABLE `installments` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `due_date` date NOT NULL,
  `paid_date` datetime(6) DEFAULT NULL,
  `penalty` decimal(38,2) DEFAULT NULL,
  `status` enum('OVERDUE','PAID','PENDING') NOT NULL,
  `credit_request_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `installments`
--

INSERT INTO `installments` (`id`, `amount`, `due_date`, `paid_date`, `penalty`, `status`, `credit_request_id`) VALUES
(1, 30.00, '2026-05-20', '2026-04-20 12:33:48.000000', 0.00, 'PAID', 1),
(2, 30.00, '2026-06-20', '2026-04-20 15:30:48.000000', 0.00, 'PAID', 1),
(3, 30.00, '2026-07-20', '2026-04-20 15:30:48.000000', 0.00, 'PAID', 1),
(4, 77.67, '2026-05-20', '2026-04-20 15:30:48.000000', 0.00, 'PAID', 2),
(5, 77.67, '2026-06-20', '2026-04-20 15:30:48.000000', 0.00, 'PAID', 2),
(6, 77.67, '2026-07-20', '2026-04-20 15:30:48.000000', 0.00, 'PAID', 2),
(7, 150.00, '2026-05-20', '2026-04-20 18:24:51.000000', 0.00, 'PAID', 3),
(8, 150.00, '2026-06-20', '2026-04-20 18:24:51.000000', 0.00, 'PAID', 3),
(9, 150.00, '2026-07-20', '2026-04-20 18:24:51.000000', 0.00, 'PAID', 3),
(10, 150.00, '2026-05-21', '2026-04-21 00:49:29.000000', 0.00, 'PAID', 4),
(11, 150.00, '2026-06-21', '2026-04-21 00:49:29.000000', 0.00, 'PAID', 4),
(12, 150.00, '2026-07-21', '2026-04-21 00:49:29.000000', 0.00, 'PAID', 4),
(13, 150.00, '2026-05-21', '2026-04-21 00:49:29.000000', 0.00, 'PAID', 5),
(14, 150.00, '2026-06-21', '2026-04-21 00:49:29.000000', 0.00, 'PAID', 5),
(15, 150.00, '2026-07-21', '2026-04-21 00:49:29.000000', 0.00, 'PAID', 5),
(16, 150.00, '2026-05-21', NULL, 0.00, 'PENDING', 6),
(17, 150.00, '2026-06-21', NULL, 0.00, 'PENDING', 6),
(18, 150.00, '2026-07-21', NULL, 0.00, 'PENDING', 6),
(19, 56.67, '2026-05-21', NULL, 0.00, 'PENDING', 7),
(20, 56.67, '2026-06-21', NULL, 0.00, 'PENDING', 7),
(21, 56.67, '2026-07-21', NULL, 0.00, 'PENDING', 7);

-- --------------------------------------------------------

--
-- Structure de la table `installment_sequence`
--

CREATE TABLE `installment_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `installment_sequence`
--

INSERT INTO `installment_sequence` (`next_val`) VALUES
(22);

-- --------------------------------------------------------

--
-- Structure de la table `kyc_documents`
--

CREATE TABLE `kyc_documents` (
  `id` bigint(20) NOT NULL,
  `admin_comment` varchar(255) DEFAULT NULL,
  `cin_back_url` varchar(255) DEFAULT NULL,
  `cin_front_url` varchar(255) DEFAULT NULL,
  `cin_number` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `ocr_result` varchar(255) DEFAULT NULL,
  `selfie_url` varchar(255) DEFAULT NULL,
  `status` enum('APPROVED','NOT_SUBMITTED','PENDING','REJECTED') NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `kyc_documents`
--

INSERT INTO `kyc_documents` (`id`, `admin_comment`, `cin_back_url`, `cin_front_url`, `cin_number`, `created_at`, `ocr_result`, `selfie_url`, `status`, `user_id`) VALUES
(1, 'Auto-approved by Didit AI (confidence: 94%)', '/api/files/kyc/1/cin_back.jpg', '/api/files/kyc/1/cin_front.jpg', NULL, '2026-04-20 12:33:27.000000', NULL, '/api/files/kyc/1/selfie.jpg', 'APPROVED', 1);

-- --------------------------------------------------------

--
-- Structure de la table `kyc_document_sequence`
--

CREATE TABLE `kyc_document_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `kyc_document_sequence`
--

INSERT INTO `kyc_document_sequence` (`next_val`) VALUES
(2);

-- --------------------------------------------------------

--
-- Structure de la table `merchants`
--

CREATE TABLE `merchants` (
  `id` bigint(20) NOT NULL,
  `active` bit(1) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `merchant_sequence`
--

CREATE TABLE `merchant_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `merchant_sequence`
--

INSERT INTO `merchant_sequence` (`next_val`) VALUES
(1);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('CREDIT_APPROVED','CREDIT_REJECTED','INSTALLMENT_OVERDUE','KYC_VALIDATED','PAYMENT_CONFIRMED','PAYMENT_REMINDER') NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `created_at`, `message`, `is_read`, `title`, `type`, `user_id`) VALUES
(1, '2026-04-20 12:33:30.000000', 'Your identity has been verified successfully.', b'0', 'KYC Approved', 'KYC_VALIDATED', 1),
(2, '2026-04-20 12:33:36.000000', 'Your credit request of 100 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1),
(3, '2026-04-20 12:33:42.000000', 'Your credit request of 259 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1),
(4, '2026-04-20 12:33:48.000000', 'Payment of 30 DT confirmed. Ref: TXN-659DCE7D', b'0', 'Payment Confirmed', 'PAYMENT_CONFIRMED', 1),
(5, '2026-04-20 15:30:48.000000', 'All your due installments have been paid successfully.', b'0', 'All Installments Paid', 'PAYMENT_CONFIRMED', 1),
(6, '2026-04-20 15:31:08.000000', 'Your credit request of 500 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1),
(7, '2026-04-20 18:24:51.000000', 'All your due installments have been paid successfully.', b'0', 'All Installments Paid', 'PAYMENT_CONFIRMED', 1),
(8, '2026-04-21 00:43:53.000000', 'Your credit request of 500 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1),
(9, '2026-04-21 00:49:26.000000', 'Your credit request of 500 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1),
(10, '2026-04-21 00:49:29.000000', 'All your due installments have been paid successfully.', b'0', 'All Installments Paid', 'PAYMENT_CONFIRMED', 1),
(11, '2026-04-21 00:57:07.000000', 'Your credit request of 500 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1),
(12, '2026-04-21 00:57:15.000000', 'Your credit request of 189 DT has been approved.', b'0', 'Credit Approved', 'CREDIT_APPROVED', 1);

-- --------------------------------------------------------

--
-- Structure de la table `notification_sequence`
--

CREATE TABLE `notification_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification_sequence`
--

INSERT INTO `notification_sequence` (`next_val`) VALUES
(13);

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(38,2) NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `transaction_reference` varchar(255) DEFAULT NULL,
  `installment_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `payments`
--

INSERT INTO `payments` (`id`, `amount`, `paid_at`, `payment_method`, `transaction_reference`, `installment_id`, `user_id`) VALUES
(1, 30.00, '2026-04-20 12:33:48.000000', 'CARD', 'TXN-659DCE7D', 1, 1),
(2, 30.00, '2026-04-20 15:30:48.000000', 'CARD', 'TXN-D8070420', 2, 1),
(3, 30.00, '2026-04-20 15:30:48.000000', 'CARD', 'TXN-90267622', 3, 1),
(4, 77.67, '2026-04-20 15:30:48.000000', 'CARD', 'TXN-5F394C7D', 4, 1),
(5, 77.67, '2026-04-20 15:30:48.000000', 'CARD', 'TXN-8136CC89', 5, 1),
(6, 77.67, '2026-04-20 15:30:48.000000', 'CARD', 'TXN-94B534A8', 6, 1),
(7, 150.00, '2026-04-20 18:24:51.000000', 'CARD', 'TXN-4A878A1D', 7, 1),
(8, 150.00, '2026-04-20 18:24:51.000000', 'CARD', 'TXN-5EF6EC97', 8, 1),
(9, 150.00, '2026-04-20 18:24:51.000000', 'CARD', 'TXN-502FD991', 9, 1),
(10, 150.00, '2026-04-21 00:49:29.000000', 'CARD', 'TXN-5DE0CF56', 10, 1),
(11, 150.00, '2026-04-21 00:49:29.000000', 'CARD', 'TXN-2668FD55', 11, 1),
(12, 150.00, '2026-04-21 00:49:29.000000', 'CARD', 'TXN-05CBBB4A', 12, 1),
(13, 150.00, '2026-04-21 00:49:29.000000', 'CARD', 'TXN-58FFC173', 13, 1),
(14, 150.00, '2026-04-21 00:49:29.000000', 'CARD', 'TXN-16C78086', 14, 1),
(15, 150.00, '2026-04-21 00:49:29.000000', 'CARD', 'TXN-713AE9AA', 15, 1);

-- --------------------------------------------------------

--
-- Structure de la table `payment_sequence`
--

CREATE TABLE `payment_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `payment_sequence`
--

INSERT INTO `payment_sequence` (`next_val`) VALUES
(16);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `kyc_failed_attempts` int(11) DEFAULT NULL,
  `kyc_fraud_flag` bit(1) NOT NULL,
  `kyc_provider` varchar(255) NOT NULL,
  `kyc_status` enum('APPROVED','NOT_SUBMITTED','PENDING','REJECTED') NOT NULL,
  `kyc_submitted_at` datetime(6) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `marital_status` varchar(255) DEFAULT NULL,
  `monthly_salary` double DEFAULT NULL,
  `number_of_children` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `payment_score_modifier` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `address`, `created_at`, `email`, `first_name`, `kyc_failed_attempts`, `kyc_fraud_flag`, `kyc_provider`, `kyc_status`, `kyc_submitted_at`, `last_name`, `marital_status`, `monthly_salary`, `number_of_children`, `password_hash`, `phone`, `profession`, `profile_photo_url`, `updated_at`, `payment_score_modifier`) VALUES
(1, 'Bb', '2026-04-20 12:32:52.000000', 'besbes@gmail.com', 'rayen', 0, b'0', 'DIDIT', 'APPROVED', '2026-04-20 12:33:30.000000', 'Besbes', 'Célibataire', 1500, 0, 'besbes123', '20409390', NULL, NULL, '2026-04-20 12:33:30.000000', NULL),
(2, 'Lld', '2026-04-21 00:39:11.000000', 'vdirassacoding@gmail.com', 'rayen', 0, b'0', 'LEGACY', 'NOT_SUBMITTED', NULL, 'Besbes', NULL, NULL, NULL, 'azert1234', '20409390', NULL, NULL, '2026-04-21 00:39:11.000000', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user_sequence`
--

CREATE TABLE `user_sequence` (
  `next_val` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user_sequence`
--

INSERT INTO `user_sequence` (`next_val`) VALUES
(3);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKcmanafgwbibfijy2o5isfk3d5` (`user_id`);

--
-- Index pour la table `creadi_scores`
--
ALTER TABLE `creadi_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK5ksgepgsgxt26v5vky2ie49qs` (`user_id`);

--
-- Index pour la table `credit_requests`
--
ALTER TABLE `credit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKqqaj53cdd5yui6nr9faqxro7r` (`user_id`);

--
-- Index pour la table `credit_scores`
--
ALTER TABLE `credit_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK1nto9m99wner50ufmho33p8ph` (`user_id`);

--
-- Index pour la table `financial_profiles`
--
ALTER TABLE `financial_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK4jrh39uvndm2javq34lb1jexu` (`user_id`);

--
-- Index pour la table `installments`
--
ALTER TABLE `installments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK7k1jkwkhmkrcepft7pu7cnq00` (`credit_request_id`);

--
-- Index pour la table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKllb8bcbbyo994afdepf7f7j63` (`user_id`);

--
-- Index pour la table `merchants`
--
ALTER TABLE `merchants`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKrwn36natqiwaseu5c3jvaun3` (`transaction_reference`),
  ADD KEY `FKp0wyj2pahks5oh3qs9qstfnsj` (`installment_id`),
  ADD KEY `FKj94hgy9v5fw1munb90tar2eje` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `cards`
--
ALTER TABLE `cards`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `financial_profiles`
--
ALTER TABLE `financial_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `cards`
--
ALTER TABLE `cards`
  ADD CONSTRAINT `FKcmanafgwbibfijy2o5isfk3d5` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `creadi_scores`
--
ALTER TABLE `creadi_scores`
  ADD CONSTRAINT `FK5ksgepgsgxt26v5vky2ie49qs` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `credit_requests`
--
ALTER TABLE `credit_requests`
  ADD CONSTRAINT `FKqqaj53cdd5yui6nr9faqxro7r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `credit_scores`
--
ALTER TABLE `credit_scores`
  ADD CONSTRAINT `FK1nto9m99wner50ufmho33p8ph` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `financial_profiles`
--
ALTER TABLE `financial_profiles`
  ADD CONSTRAINT `FKqt6pnf8hhik2gmxj31f4bm63v` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `installments`
--
ALTER TABLE `installments`
  ADD CONSTRAINT `FK7k1jkwkhmkrcepft7pu7cnq00` FOREIGN KEY (`credit_request_id`) REFERENCES `credit_requests` (`id`);

--
-- Contraintes pour la table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD CONSTRAINT `FKllb8bcbbyo994afdepf7f7j63` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `FKj94hgy9v5fw1munb90tar2eje` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKp0wyj2pahks5oh3qs9qstfnsj` FOREIGN KEY (`installment_id`) REFERENCES `installments` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
