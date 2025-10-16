--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: driver_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.driver_status AS ENUM (
    'actif',
    'inactif',
    'conge'
);


ALTER TYPE public.driver_status OWNER TO neondb_owner;

--
-- Name: maintenance_urgency; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.maintenance_urgency AS ENUM (
    'urgent',
    'soon',
    'scheduled'
);


ALTER TYPE public.maintenance_urgency OWNER TO neondb_owner;

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.transaction_type AS ENUM (
    'recette',
    'depense'
);


ALTER TYPE public.transaction_type OWNER TO neondb_owner;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'admin_entreprise',
    'gestionnaire',
    'chauffeur'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

--
-- Name: vehicle_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.vehicle_status AS ENUM (
    'disponible',
    'en_location',
    'en_maintenance',
    'hors_service'
);


ALTER TYPE public.vehicle_status OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clients (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    nom text NOT NULL,
    email text,
    telephone text NOT NULL,
    adresse text,
    entreprise text,
    solde numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.clients OWNER TO neondb_owner;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.drivers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    user_id character varying,
    nom text NOT NULL,
    prenom text NOT NULL,
    telephone text NOT NULL,
    email text,
    numero_permis text,
    date_expiration_permis timestamp without time zone,
    vehicule_assigne_id character varying,
    status public.driver_status DEFAULT 'actif'::public.driver_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.drivers OWNER TO neondb_owner;

--
-- Name: fuel_records; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.fuel_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    vehicule_id character varying NOT NULL,
    chauffeur_id character varying,
    date timestamp without time zone DEFAULT now() NOT NULL,
    quantite numeric(10,2) NOT NULL,
    cout_unitaire numeric(10,2) NOT NULL,
    cout_total numeric(10,2) NOT NULL,
    kilometrage integer NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.fuel_records OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    client_id character varying NOT NULL,
    numero_facture text NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    date_echeance timestamp without time zone,
    montant_total numeric(10,2) NOT NULL,
    montant_paye numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    status text DEFAULT 'impayee'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: maintenance_records; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.maintenance_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    vehicule_id character varying NOT NULL,
    type text NOT NULL,
    description text,
    date_prevu timestamp without time zone,
    date_realise timestamp without time zone,
    kilometrage_prevu integer,
    kilometrage_realise integer,
    cout numeric(10,2),
    urgency public.maintenance_urgency DEFAULT 'scheduled'::public.maintenance_urgency NOT NULL,
    complete boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.maintenance_records OWNER TO neondb_owner;

--
-- Name: organization_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organization_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    registre_commerce text,
    nis text,
    nif text,
    article_imposition text,
    nom_complet text,
    adresse_complete text,
    ville text,
    code_postal text,
    pays text DEFAULT 'Algérie'::text,
    telephone text,
    email text,
    site_web text,
    logo text,
    couleur_primaire text DEFAULT '#2563eb'::text,
    couleur_secondaire text DEFAULT '#64748b'::text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organization_settings OWNER TO neondb_owner;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organizations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    nom text NOT NULL,
    email text NOT NULL,
    telephone text,
    adresse text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.organizations OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    type public.transaction_type NOT NULL,
    montant numeric(10,2) NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    categorie text NOT NULL,
    description text,
    vehicule_id character varying,
    client_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    replit_auth_id text,
    organization_id character varying NOT NULL,
    nom text NOT NULL,
    prenom text NOT NULL,
    email text NOT NULL,
    telephone text,
    role public.user_role DEFAULT 'gestionnaire'::public.user_role NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vehicles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    organization_id character varying NOT NULL,
    immatriculation text NOT NULL,
    marque text NOT NULL,
    modele text NOT NULL,
    type text NOT NULL,
    annee integer,
    kilometrage integer DEFAULT 0 NOT NULL,
    heures_travail integer DEFAULT 0,
    status public.vehicle_status DEFAULT 'disponible'::public.vehicle_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vehicles OWNER TO neondb_owner;

--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clients (id, organization_id, nom, email, telephone, adresse, entreprise, solde, created_at) FROM stdin;
82d1770f-d78c-4a86-8ab5-df4a271ace3a	1aefc11b-decc-401e-b5b2-30288157c3ea	Client-NlGO	\N	0623456789	\N	\N	0.00	2025-10-14 11:12:47.292321
d520b467-ebf1-4b89-b5a8-fb92d536a1ad	04c12766-5d27-4530-9924-9178c4bbc6e3	Client-Jdri	vDr3Y-@example.com	07kDsgGCzO	\N	\N	0.00	2025-10-14 11:19:01.584249
4399ee60-8be3-4b17-a61b-ee732e9fd9b6	3c389414-411e-42ca-aa0b-07072c301cba	Client-jLr7	client-jlr7@example.com	07NFXR6Evo	\N	Entreprise Test	0.00	2025-10-14 11:27:15.193496
359909a0-7a86-4a11-b014-98fd6a3cae77	8b5f1846-bcc4-4718-9076-2beb671e8b43	LOUNES	test@exemple.com	0567980034	Alger	ENPS	25000.00	2025-10-14 18:24:39.051033
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.drivers (id, organization_id, user_id, nom, prenom, telephone, email, numero_permis, date_expiration_permis, vehicule_assigne_id, status, created_at) FROM stdin;
66e6cb48-d8b4-4ac1-9550-369f8b075539	1aefc11b-decc-401e-b5b2-30288157c3ea	\N	Dupont	Jean	0612345678	\N	\N	\N	\N	actif	2025-10-14 11:11:42.242068
258e419c-adca-4288-8fa4-985d0c1c64ac	04c12766-5d27-4530-9924-9178c4bbc6e3	\N	Dupont-Jdw	Jean	06i9bKUc8A	\N	\N	\N	\N	actif	2025-10-14 11:17:32.763112
699152a5-f736-4866-ae71-a6d6fa0b8866	3c389414-411e-42ca-aa0b-07072c301cba	\N	Test-qBX	Jean	06mRzU1ISP	\N	\N	\N	\N	actif	2025-10-14 11:26:00.40702
\.


--
-- Data for Name: fuel_records; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.fuel_records (id, organization_id, vehicule_id, chauffeur_id, date, quantite, cout_unitaire, cout_total, kilometrage, notes, created_at) FROM stdin;
c84fdbbe-f45a-4a0c-b751-0768a72ef93b	3c389414-411e-42ca-aa0b-07072c301cba	ffbfefe2-a46a-426d-a73a-975b05696184	699152a5-f736-4866-ae71-a6d6fa0b8866	2025-10-14 00:00:00	45.00	1.75	78.75	51000	\N	2025-10-14 11:29:57.134198
c8932985-7c47-412d-8acc-68713b808bf3	8b5f1846-bcc4-4718-9076-2beb671e8b43	2b2f280b-eb7f-4d60-abc9-783ce2686054	\N	2025-10-14 00:00:00	15.00	5.00	75.00	12000	\N	2025-10-14 18:25:40.973525
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, organization_id, client_id, numero_facture, date, date_echeance, montant_total, montant_paye, status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: maintenance_records; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.maintenance_records (id, organization_id, vehicule_id, type, description, date_prevu, date_realise, kilometrage_prevu, kilometrage_realise, cout, urgency, complete, notes, created_at) FROM stdin;
\.


--
-- Data for Name: organization_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organization_settings (id, organization_id, registre_commerce, nis, nif, article_imposition, nom_complet, adresse_complete, ville, code_postal, pays, telephone, email, site_web, logo, couleur_primaire, couleur_secondaire, updated_at) FROM stdin;
bdaf4d3f-ef37-4e40-8b70-97d6634b5782	5dfd8617-a1a7-4083-9c1c-e9f906105d36	RC-hAZBaN	aSrHBsUN3LfdTRL	vdsZ8y152l0XfD5	Article 23	SARL FleetPro Transport	123 Rue de la République	Alger	16000		+213 123 456 789	contact@fleetpro.dz		\N	#10b981	#64748b	2025-10-14 12:52:54.623
2616addc-2aad-42a0-b4ac-aba62d5bdcd3	8b5f1846-bcc4-4718-9076-2beb671e8b43	\N	\N	\N	\N	\N	\N	\N	\N	Algérie	\N	\N	\N	\N	#0e74e1	#111878	2025-10-14 13:08:13.142
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organizations (id, nom, email, telephone, adresse, created_at) FROM stdin;
beade17b-f135-4fce-a3cc-c1e1bbdc65c4	Entreprise Admin FleetPro	admin@fleetpro.test	\N	\N	2025-10-14 10:15:50.411294
8b5f1846-bcc4-4718-9076-2beb671e8b43	Entreprise AID Mohamed	urbanmind.dz@outlook.fr	\N	\N	2025-10-14 10:32:27.020697
1aefc11b-decc-401e-b5b2-30288157c3ea	Entreprise John Doe	iXil1n@example.com	\N	\N	2025-10-14 11:08:39.174995
04c12766-5d27-4530-9924-9178c4bbc6e3	Entreprise John Doe	zt02VO@example.com	\N	\N	2025-10-14 11:15:11.453826
3c389414-411e-42ca-aa0b-07072c301cba	Entreprise John Doe	OVY_0a@example.com	\N	\N	2025-10-14 11:23:25.745511
5dfd8617-a1a7-4083-9c1c-e9f906105d36	Entreprise John Doe	pKF_rc@example.com	\N	\N	2025-10-14 12:51:02.669551
d0c627e1-d7ac-482d-b6a1-5926dfba3ca7	Entreprise Marie Martin	marie.martinYOfs@example.com	\N	\N	2025-10-14 13:12:31.41918
0603ef73-21f7-49cf-b704-b45d40e08349	Entreprise Admin User	adminh4fP@example.com	\N	\N	2025-10-14 13:16:40.119185
6ab5691c-7718-483f-818e-df8006cdcf4d	Entreprise Simple Driver	driverfTa5@example.com	\N	\N	2025-10-14 13:20:00.595931
807574c1-1133-4c10-92ff-6ac9821eb6f1	Entreprise Admin User	admin_qGMSDE@example.com	\N	\N	2025-10-14 13:24:42.846338
ec96d207-b8e8-4fcb-a5e2-386446f5f496	Entreprise Claire Dubois	claire.dubois_dl3@example.com	\N	\N	2025-10-14 13:26:57.1993
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
QVXoBz0JBeA5vhOSC_Irx93czwgpIyPi	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T13:26:57.354Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760452017, "iat": 1760448417, "iss": "https://test-mock-oidc.replit.app/", "jti": "9a303d1f455441f24c9ae555307c3dbc", "sub": "F7ykZB", "email": "claire.dubois_dl3@example.com", "auth_time": 1760448416, "last_name": "Dubois", "first_name": "Claire"}, "expires_at": 1760452017, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQ4NDE3LCJleHAiOjE3NjA0NTIwMTcsInN1YiI6IkY3eWtaQiIsImVtYWlsIjoiY2xhaXJlLmR1Ym9pc19kbDNAZXhhbXBsZS5jb20iLCJmaXJzdF9uYW1lIjoiQ2xhaXJlIiwibGFzdF9uYW1lIjoiRHVib2lzIn0.Xd0CHFqlN0F1DfFwT-lZJf-Es4bRYlc9ujj0_DTaSf_EOjHEvIrDE7ERe0FSFBetpD74Z_u_qbtsMDB1ckWMoOJRjm2c1_KUU2R3-sqV0xo0-G8tsDdwZtZ5OAneHYXslGulE7_jE2c_9PHvH4xZWJX9jwRmZKvGiTlv6o8aQkLDYAJjjGOV2dEY1iJf0TC4KZ7ivNVbfeL8boCxubastTlnNDo70cWY2nlgwzFlmmwz6LI0ufCP2EaL4frRMjf0K3zGKvunL9XrSZigKdprbdP9lder0TfJP-eFnVxK65eoHec7ArsFBWZGpbNf6sm9Cy3BjnY6_rtO9s4YKlUH_g", "refresh_token": "eyJzdWIiOiJGN3lrWkIiLCJlbWFpbCI6ImNsYWlyZS5kdWJvaXNfZGwzQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkNsYWlyZSIsImxhc3RfbmFtZSI6IkR1Ym9pcyJ9"}}}	2025-10-21 13:28:31
hmAVRfT-FP_jzr2ivVZcVvaOcAgZRWsA	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T13:24:42.998Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760451882, "iat": 1760448282, "iss": "https://test-mock-oidc.replit.app/", "jti": "9421dfce71d8402099cac013b0933307", "sub": "qGMSDE", "email": "admin_qGMSDE@example.com", "auth_time": 1760448282, "last_name": "User", "first_name": "Admin"}, "expires_at": 1760451882, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQ4MjgyLCJleHAiOjE3NjA0NTE4ODIsInN1YiI6InFHTVNERSIsImVtYWlsIjoiYWRtaW5fcUdNU0RFQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkFkbWluIiwibGFzdF9uYW1lIjoiVXNlciJ9.jsP5TwFrFk8XZOfrKJBjrcd1Qjsqko9ABxsSTwSvnlg7Seb7Nsz2bruBzf0Nt8HnuMcJ5f8SrcXut6V7FI9iLUIid5JGkvOsnaBhvVn4bswnEF0p18El3THi_lGYyQ0c8QPawsbpoHn_Zke1gbCrNeQYHQO0sQqKv3Ys7pDC7Qqyu1ujLRapvT8x-dv76yB1i9AQN73ALIKIu3ggb_X9ogobCDgrB9WueTuUcPT-DMrjtOiaAiDt5hVvMSPviGvZJJWCm4TAcgMRjlpTZktjwbzYoAmIHWT2UkelIrkxpPmpHikaq-L8HTIcA9LhmAZLtochHkLDG98wOGL5kQE3dg", "refresh_token": "eyJzdWIiOiJxR01TREUiLCJlbWFpbCI6ImFkbWluX3FHTVNERUBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJBZG1pbiIsImxhc3RfbmFtZSI6IlVzZXIifQ"}}}	2025-10-21 13:25:47
gItuxup8Q2Hu8_Gy3tyfgpjnX6AW21UN	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T18:38:52.025Z", "httpOnly": true, "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "CmsW8oPeleG7ntofJ0krjGfhfDLfqw8shMJohgOxXFA"}}	2025-10-22 18:49:23
jaAu2hY3evC-GYwXhIG2nk_DSj8YcPtT	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T13:19:13.197Z", "httpOnly": true, "originalMaxAge": 604800000}}	2025-10-21 13:19:19
RMPFSmd0ueHHCqwrD1aRjBJINPF9q5Ci	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T13:20:00.748Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760451600, "iat": 1760448000, "iss": "https://test-mock-oidc.replit.app/", "jti": "4faf45bac7b84376152b463d65bcb4e3", "sub": "5SUKjf", "role": "chauffeur", "email": "driverfTa5@example.com", "auth_time": 1760448000, "last_name": "Driver", "first_name": "Simple"}, "expires_at": 1760451600, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQ4MDAwLCJleHAiOjE3NjA0NTE2MDAsInN1YiI6IjVTVUtqZiIsImVtYWlsIjoiZHJpdmVyZlRhNUBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJTaW1wbGUiLCJsYXN0X25hbWUiOiJEcml2ZXIiLCJyb2xlIjoiY2hhdWZmZXVyIn0.o9CExwYcnIbFWDDonxRdRQS5RereGvsXTIaiIUfroJDR2o7dNeTyZNbN_7X56PRVSC-dWNqognqC0R4oOKLZ3R9bCzuiyefYP3kmqvHT5wBvx4V_MidZxE6rwGS91q40ztciVI6fVgIC3VesylzuKzgE9JJcMkxNuTO52Dpy_Xc08NwJLGrQBiDkanIY6Xl46WZ9mX85OpkK4F8ofH5kpUw2WOvaGWqR5YLxGrEQQkl5MB4zjqBu4arm4-SeMtsBsCIupAFQAs7MJ4vIxjhUXMi_7MAfsOp3FyDb37TpJALINwlOLFwuiUn1ecRdugDoBkkIYWlTP655p9qVIY9IpA", "refresh_token": "eyJzdWIiOiI1U1VLamYiLCJlbWFpbCI6ImRyaXZlcmZUYTVAZXhhbXBsZS5jb20iLCJmaXJzdF9uYW1lIjoiU2ltcGxlIiwibGFzdF9uYW1lIjoiRHJpdmVyIiwicm9sZSI6ImNoYXVmZmV1ciJ9"}}}	2025-10-21 13:21:22
oqbosF8JriaKpqiLRKvslBWExpRnRCUW	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T13:12:31.572Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760451151, "iat": 1760447551, "iss": "https://test-mock-oidc.replit.app/", "jti": "6fda4d2ff4ab666fa09c7580173dde53", "sub": "kI719J", "email": "marie.martinYOfs@example.com", "auth_time": 1760447551, "last_name": "Martin", "first_name": "Marie"}, "expires_at": 1760451151, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQ3NTUxLCJleHAiOjE3NjA0NTExNTEsInN1YiI6ImtJNzE5SiIsImVtYWlsIjoibWFyaWUubWFydGluWU9mc0BleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJNYXJpZSIsImxhc3RfbmFtZSI6Ik1hcnRpbiJ9.DRCbZ78X8d4AN0tRdhR-IRP4ghb0FxT0-dGQ6nTmgdw2HOdRJbgrF7AGQuw5_v4AWZYk_8-Bs8IpsbVQnjd0S5QB4zxqfShwuPVsWMU8kvbu6WkY9vvAiD92DsP6QkZK_1yCPRa5DJ7Ox14n-l5XiDuNiFvLHW2PgsQVchwlSNBZNqittLmZfsK2Oi2-Y8Uq8pGOoOLkyKyAw6yoyxuJS_WBrboyisFPOFTKPu6pxzRvJby7YWPV10Knz0_7m7KpIdDwwc8Rfq_kRzBVQhacyUXBiBSYoQ0MnnC6qoPSnp--QR6ZHGJnNumHZDsNOCZ9JPx7YF5v7HaByJAVxrro9Q", "refresh_token": "eyJzdWIiOiJrSTcxOUoiLCJlbWFpbCI6Im1hcmllLm1hcnRpbllPZnNAZXhhbXBsZS5jb20iLCJmaXJzdF9uYW1lIjoiTWFyaWUiLCJsYXN0X25hbWUiOiJNYXJ0aW4ifQ"}}}	2025-10-21 13:14:00
5m86nlKI9ARidDnEXA2WN29lDUv5Geh5	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T19:22:09.075Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760473328, "iat": 1760469728, "iss": "https://replit.com/oidc", "sub": "48618592", "email": "urbanmind.dz@outlook.fr", "at_hash": "QQS-el0wq5iQr9qWi_Sodw", "username": "urbanminddz", "auth_time": 1760437944, "last_name": "Mohamed", "first_name": "AID"}, "expires_at": 1760473328, "access_token": "ZXUr0umpQ3K-Li4Wrf53LbGG6yUhMYNZdHEvmyzAJBy", "refresh_token": "Xn8ztd58CcU7HnbhHVyE1RlQi5siSnYtkO8vXLo-h8d"}}}	2025-10-21 19:22:58
Rpvp8_zOsgn9uBFR-pUS2OLblTahzTN_	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T10:15:50.559Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760440550, "iat": 1760436950, "iss": "https://test-mock-oidc.replit.app/", "jti": "fbefe9308854816c3da1559765b8d1bd", "sub": "test-user-123", "email": "admin@fleetpro.test", "auth_time": 1760436950, "last_name": "FleetPro", "first_name": "Admin"}, "expires_at": 1760440550, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDM2OTUwLCJleHAiOjE3NjA0NDA1NTAsInN1YiI6InRlc3QtdXNlci0xMjMiLCJlbWFpbCI6ImFkbWluQGZsZWV0cHJvLnRlc3QiLCJmaXJzdF9uYW1lIjoiQWRtaW4iLCJsYXN0X25hbWUiOiJGbGVldFBybyJ9.gfXK5eSsib2XujbVBw1KP6IOvgPYz8gobGJg_ShGqNgptW8jVrfU22Aq5UYXcVLI8_ZqunUYPSAwMvyzbU5zkseB5TaYcFzkTZcdMSgUMHdNwfogDdmFm03gKttuGsUhClbRvwZ8KFaNi9cGSL57-wpwFiZHLwix43fkfmrCZu1nRMCjD4Cf2ezrBmAISSqJRaIYgfxpYu1l_HhqAGOKvwLBJPQVu3k6cHspqOKalI3WWf3rZmHM8hErAGIREDkI5NVW5MEOv-bVk7k8AuSij7Ubqu9QSjzNIoSmRLGeORloQoiPkBbWBFq_9lasEi6UtkQT3H-NMTyP1CElN3kJ1w", "refresh_token": "eyJzdWIiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJhZG1pbkBmbGVldHByby50ZXN0IiwiZmlyc3RfbmFtZSI6IkFkbWluIiwibGFzdF9uYW1lIjoiRmxlZXRQcm8ifQ"}}}	2025-10-21 10:20:31
tFKevGHBT61CdQXGYrc5oG-99naa_T7Q	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T11:08:39.317Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760443718, "iat": 1760440118, "iss": "https://test-mock-oidc.replit.app/", "jti": "9f22ae6f2145baded99bf1d0fdc0388d", "sub": "iXil1n", "email": "iXil1n@example.com", "auth_time": 1760440118, "last_name": "Doe", "first_name": "John"}, "expires_at": 1760443718, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQwMTE4LCJleHAiOjE3NjA0NDM3MTgsInN1YiI6ImlYaWwxbiIsImVtYWlsIjoiaVhpbDFuQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.X6O-Xqt6dAOzaN14gk71RKtGeVgNkRZtEnBRPkweJS-x5ok_pxWN0TYTOK0rkucGhxv9JIhaGcPQPEW93Pj8n9MnHnnGdHymiC7Jbp3mKXTVqr6bygbE9GzI-2O5TBI0dGoQaXBrcB1VgvY8LzYFf6x-Wftp7omca5A9yGGjJ08kL1hidAh80AV16G6WM7B0JTNtST7qzGLA7mE-gf8llKSa5EVHPR5BnzXBYv5uLwy-QhB8fkDPT_Z0E0k6vz6E_5aPiXriZYP58N6nxe7xSmVpzurJYAkAramKabfQCXDCbGScBvfWxAOHHoZ9Oq4PC3pnq1k329P0b2IiyuhDVA", "refresh_token": "eyJzdWIiOiJpWGlsMW4iLCJlbWFpbCI6ImlYaWwxbkBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-10-21 11:13:31
rSOuGB0OcIzccTBeynklTAk-1kmj5nEg	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T12:51:02.815Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760449862, "iat": 1760446262, "iss": "https://test-mock-oidc.replit.app/", "jti": "93e3caf61db9e93e9703576fcaccbab8", "sub": "pKF_rc", "email": "pKF_rc@example.com", "auth_time": 1760446262, "last_name": "Doe", "first_name": "John"}, "expires_at": 1760449862, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQ2MjYyLCJleHAiOjE3NjA0NDk4NjIsInN1YiI6InBLRl9yYyIsImVtYWlsIjoicEtGX3JjQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.ttsOrMsb_3GrGiGAq2hGm1Qjgwc3Hds2wxQH_nXf4I5M5g7Hv1aeQ3SMBPiVa4dyyaNGRtIlr_RonX9X4k7JKotaLISRWMURykZPRdEEtzcI2-ufwevmpj7wvokD8ZBDxcm2PCxFpfzpFRSbivP8NehupfTPrySTYHpycuUIOwRwyIOJMgeWlBvFxLfZRGYtucwQAe7uQMas2_8RVkKBIND-XBubpRBDs-J_P6LZUmMfTBWWxKrvWsJAQtMVVX8aokIpfcAq1YN0JmIAC1-AqiP38SutmODK6XdZY4rWI670BE5oD07beXOtTAYmVYYg2pholUXZrpzJLEZaPDBiVg", "refresh_token": "eyJzdWIiOiJwS0ZfcmMiLCJlbWFpbCI6InBLRl9yY0BleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-10-21 12:52:55
nxlpkX2byxBWbVJKywaPUHg3gJ-od_JW	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T11:23:25.903Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760444605, "iat": 1760441005, "iss": "https://test-mock-oidc.replit.app/", "jti": "1f1b521f670dece2ddb4c3daf6d20e0c", "sub": "OVY_0a", "email": "OVY_0a@example.com", "auth_time": 1760441005, "last_name": "Doe", "first_name": "John"}, "expires_at": 1760444605, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQxMDA1LCJleHAiOjE3NjA0NDQ2MDUsInN1YiI6Ik9WWV8wYSIsImVtYWlsIjoiT1ZZXzBhQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.pMqsKwVq1W0Yw2usH049LQnq4vxQcwYZow02Vew3cU6jAr1h91D39GTfB2P8WtnGG9dpV8nekoOVII3MGR3l_Gim1MD2v7v-q8vxL0s3Dejw6bDDYsbxB-_YizytEl0WBSTfTJU0FXwd6geq6VGr2OptDrFTnwp6YwphwPL7w9UxLSJYKUHWafl5IWu9IA9VkkA-HDfFhuIXlxPUcmGW24931eDheJ0xQvK2UhFuWKXljJrICxs2q-Pufbn3Gqb99xGkn8A2bt6Qq5LfJk17JSWh2NWOVesAAVUaZE7QzC9x3QD490WCZmaXIpuD_NSVdH9e4QI4bKfdAb7Zm6eOeQ", "refresh_token": "eyJzdWIiOiJPVllfMGEiLCJlbWFpbCI6Ik9WWV8wYUBleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-10-21 11:31:29
_hKbHDPHH4SfVVvK5NfMwwxMkntNFC2U	{"cookie": {"path": "/", "secure": true, "expires": "2025-10-21T11:15:11.587Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": {"claims": {"aud": "cc6b8ba0-f73b-418e-9472-577faa1a2f51", "exp": 1760444111, "iat": 1760440511, "iss": "https://test-mock-oidc.replit.app/", "jti": "97b609d918a7a14a0400ee02c32b77b8", "sub": "zt02VO", "email": "zt02VO@example.com", "auth_time": 1760440511, "last_name": "Doe", "first_name": "John"}, "expires_at": 1760444111, "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijc4MDgyZTlmZjVhOTA1YjIifQ.eyJpc3MiOiJodHRwczovL3Rlc3QtbW9jay1vaWRjLnJlcGxpdC5hcHAvIiwiaWF0IjoxNzYwNDQwNTExLCJleHAiOjE3NjA0NDQxMTEsInN1YiI6Inp0MDJWTyIsImVtYWlsIjoienQwMlZPQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJsYXN0X25hbWUiOiJEb2UifQ.RA6XygO18XCrft_31I-rZar796-igYPSva-RoQRtiHnOS3m44kgMbYu4AorIYfi4cKOQNkBtvBSeG-C9m4FFqFqdYeABPwmpGBuklXcdYUOUUvZP7degRUzitr5HItuUT2LBBH_i6Jiwe4u-uoxf_ERPFkT5ER2-7lwSye8iz4SnvauDcfGfuOZ_v-vD2XbGN1mCKbQSqTSzwTWDjXnUShtJB7Nd785xyTEakBu9r-jGHxaYDq7zEKmFICMViTFcdIwRD2UtDWDOHO4XqmjNdRY7HnQXd-UZzyZP2eGCerFFoCDm-EzDGMLkCwezVhzQSRfUFJHW_itneFuZQgOyjQ", "refresh_token": "eyJzdWIiOiJ6dDAyVk8iLCJlbWFpbCI6Inp0MDJWT0BleGFtcGxlLmNvbSIsImZpcnN0X25hbWUiOiJKb2huIiwibGFzdF9uYW1lIjoiRG9lIn0"}}}	2025-10-21 11:20:46
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, organization_id, type, montant, date, categorie, description, vehicule_id, client_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, replit_auth_id, organization_id, nom, prenom, email, telephone, role, created_at) FROM stdin;
d2003aca-0cf3-49a0-93b2-690db315a6a7	test-user-123	beade17b-f135-4fce-a3cc-c1e1bbdc65c4	FleetPro	Admin	admin@fleetpro.test	\N	admin_entreprise	2025-10-14 10:15:50.456484
85a31342-0684-46ba-a7d2-a988c3dcf999	48618592	8b5f1846-bcc4-4718-9076-2beb671e8b43	Mohamed	AID	urbanmind.dz@outlook.fr	\N	admin_entreprise	2025-10-14 10:32:27.069464
d0b1f5e8-826b-41e7-b3d9-6506d3df87ef	iXil1n	1aefc11b-decc-401e-b5b2-30288157c3ea	Doe	John	iXil1n@example.com	\N	admin_entreprise	2025-10-14 11:08:39.221041
33f9aac6-046b-4a8a-bc16-7ed2dcdef40e	zt02VO	04c12766-5d27-4530-9924-9178c4bbc6e3	Doe	John	zt02VO@example.com	\N	admin_entreprise	2025-10-14 11:15:11.495256
6f4fe48b-67db-4b77-92a0-0e51297c09f2	OVY_0a	3c389414-411e-42ca-aa0b-07072c301cba	Doe	John	OVY_0a@example.com	\N	admin_entreprise	2025-10-14 11:23:25.794293
4db38865-a01d-4cb2-a9a6-f03cc96b877b	pKF_rc	5dfd8617-a1a7-4083-9c1c-e9f906105d36	Doe	John	pKF_rc@example.com	\N	admin_entreprise	2025-10-14 12:51:02.712386
7a0c7e54-17d4-4c32-874e-4a362cedfb00	kI719J	d0c627e1-d7ac-482d-b6a1-5926dfba3ca7	Martin	Marie	marie.martinYOfs@example.com	\N	admin_entreprise	2025-10-14 13:12:31.467375
04c0fc63-dabd-4d40-9d04-14254bc0db47	\N	d0c627e1-d7ac-482d-b6a1-5926dfba3ca7	Martin	Marie	marie.martinvsfR@example.com	+213 555 123 456	gestionnaire	2025-10-14 13:13:35.620179
db9aa9c4-d903-4f03-8b41-6955e3426a26	2TwlO4	0603ef73-21f7-49cf-b704-b45d40e08349	User	Admin	adminh4fP@example.com	\N	admin_entreprise	2025-10-14 13:16:40.160488
7d1775a1-c37f-4ad3-b2ed-0b2cde4f5db8	\N	0603ef73-21f7-49cf-b704-b45d40e08349	User	Test	testdGK8@example.com	+213 555 999 888	chauffeur	2025-10-14 13:17:40.041932
82358bde-78c5-4ff5-b0cf-3e9203708b86	5SUKjf	6ab5691c-7718-483f-818e-df8006cdcf4d	Driver	Simple	driverfTa5@example.com	\N	admin_entreprise	2025-10-14 13:20:00.644063
b87b1309-e63d-40ec-94e3-99b44c809438	\N	6ab5691c-7718-483f-818e-df8006cdcf4d	Dupont	Jean	test8-1M@example.com	+213 123 456 789	chauffeur	2025-10-14 13:21:21.349111
ee956adb-0256-486e-998e-db21ddc2fd04	qGMSDE	807574c1-1133-4c10-92ff-6ac9821eb6f1	User	Admin	admin_qGMSDE@example.com	\N	admin_entreprise	2025-10-14 13:24:42.893865
c7e1021e-2860-4e7d-b10d-b8c8228b7118	\N	807574c1-1133-4c10-92ff-6ac9821eb6f1	Bernard	Sophie	sophie.bernard3oZq@example.com	+213 777 888 999	gestionnaire	2025-10-14 13:25:21.113161
95b4eadc-625d-4eeb-97da-c5122d6aa0fd	\N	807574c1-1133-4c10-92ff-6ac9821eb6f1					gestionnaire	2025-10-14 13:25:46.499258
bb8ed988-95cd-4e50-b3f2-e3c952f29a90	F7ykZB	ec96d207-b8e8-4fcb-a5e2-386446f5f496	Dubois	Claire	claire.dubois_dl3@example.com	\N	admin_entreprise	2025-10-14 13:26:57.25669
92e24cf4-be49-4943-a4c6-c03917a35bd1	\N	ec96d207-b8e8-4fcb-a5e2-386446f5f496	Dubois	Claire	claire.duboisLQy5@example.com	+213 666 555 444	chauffeur	2025-10-14 13:28:30.778458
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicles (id, organization_id, immatriculation, marque, modele, type, annee, kilometrage, heures_travail, status, created_at) FROM stdin;
a21620ea-b63d-4252-a821-32e52845fc98	beade17b-f135-4fce-a3cc-c1e1bbdc65c4	AB-7HZ-CD	Renault	Trafic	utilitaire	2022	45000	500	disponible	2025-10-14 10:17:59.749929
0903aa3c-37aa-4fbe-aba9-e68633ea63b7	1aefc11b-decc-401e-b5b2-30288157c3ea	TEST-_AJ-	Toyota	Corolla	voiture	2023	50000	1200	disponible	2025-10-14 11:10:24.93428
98b1c33b-92bc-4bc6-bfb3-353a8e97fa1d	04c12766-5d27-4530-9924-9178c4bbc6e3	TEST-1b3P	Toyota	Corolla	voiture	2023	50000	0	disponible	2025-10-14 11:16:35.867783
ffbfefe2-a46a-426d-a73a-975b05696184	3c389414-411e-42ca-aa0b-07072c301cba	VEH-Rnu2	Toyota	Corolla	voiture	2023	50000	0	disponible	2025-10-14 11:24:32.45113
1d4f04fe-c5d1-4490-89ca-3e0cf8398f56	8b5f1846-bcc4-4718-9076-2beb671e8b43	010033-125-16	DACIA	STEPWAY	voiture	2024	12000	0	disponible	2025-10-14 12:47:43.120889
dd9aaa33-7242-4e63-97ec-5155c11a9f9a	8b5f1846-bcc4-4718-9076-2beb671e8b43	021345-124-15	FIAT	TIPO	voiture	2024	12000	0	disponible	2025-10-14 12:48:23.090306
b1cda871-eba1-4a4b-996a-b2c0f5b539d7	8b5f1846-bcc4-4718-9076-2beb671e8b43	012233-125-16	Renault	Clio4	voiture	2024	12000	0	disponible	2025-10-14 12:56:40.612537
1e64a184-8388-401a-ac80-ead1e6143bcc	8b5f1846-bcc4-4718-9076-2beb671e8b43	012203-124-16	Peugeot	2008	voiture	2024	12000	0	disponible	2025-10-14 12:57:12.319262
26280508-1b6e-466b-ab01-d7c82195cc78	8b5f1846-bcc4-4718-9076-2beb671e8b43	09543-225-16	DACIA	DUSTER	voiture	2024	12000	0	disponible	2025-10-14 12:57:55.229754
2b2f280b-eb7f-4d60-abc9-783ce2686054	8b5f1846-bcc4-4718-9076-2beb671e8b43	012203-125-16	FIAT	500X	voiture	2024	12000	0	disponible	2025-10-14 12:58:31.464431
\.


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: fuel_records fuel_records_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fuel_records
    ADD CONSTRAINT fuel_records_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: maintenance_records maintenance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_pkey PRIMARY KEY (id);


--
-- Name: organization_settings organization_settings_organization_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_organization_id_unique UNIQUE (organization_id);


--
-- Name: organization_settings organization_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_replit_auth_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_replit_auth_id_unique UNIQUE (replit_auth_id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: clients clients_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: drivers drivers_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: drivers drivers_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: drivers drivers_vehicule_assigne_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_vehicule_assigne_id_vehicles_id_fk FOREIGN KEY (vehicule_assigne_id) REFERENCES public.vehicles(id);


--
-- Name: fuel_records fuel_records_chauffeur_id_drivers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fuel_records
    ADD CONSTRAINT fuel_records_chauffeur_id_drivers_id_fk FOREIGN KEY (chauffeur_id) REFERENCES public.drivers(id);


--
-- Name: fuel_records fuel_records_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fuel_records
    ADD CONSTRAINT fuel_records_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: fuel_records fuel_records_vehicule_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fuel_records
    ADD CONSTRAINT fuel_records_vehicule_id_vehicles_id_fk FOREIGN KEY (vehicule_id) REFERENCES public.vehicles(id);


--
-- Name: invoices invoices_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: invoices invoices_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: maintenance_records maintenance_records_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: maintenance_records maintenance_records_vehicule_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.maintenance_records
    ADD CONSTRAINT maintenance_records_vehicule_id_vehicles_id_fk FOREIGN KEY (vehicule_id) REFERENCES public.vehicles(id);


--
-- Name: organization_settings organization_settings_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: transactions transactions_client_id_clients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_client_id_clients_id_fk FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: transactions transactions_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: transactions transactions_vehicule_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vehicule_id_vehicles_id_fk FOREIGN KEY (vehicule_id) REFERENCES public.vehicles(id);


--
-- Name: users users_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: vehicles vehicles_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

