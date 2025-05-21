

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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."boarding_guide_contacts" (
    "id" integer NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "name" character varying(64) NOT NULL,
    "phone" character varying(32) NOT NULL,
    "role" character varying(64)
);


ALTER TABLE "public"."boarding_guide_contacts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."boarding_guide_contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."boarding_guide_contacts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."boarding_guide_contacts_id_seq" OWNED BY "public"."boarding_guide_contacts"."id";



CREATE TABLE IF NOT EXISTS "public"."boarding_guide_notices" (
    "id" integer NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "notice" "text" NOT NULL,
    "order" integer DEFAULT 0
);


ALTER TABLE "public"."boarding_guide_notices" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."boarding_guide_notices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."boarding_guide_notices_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."boarding_guide_notices_id_seq" OWNED BY "public"."boarding_guide_notices"."id";



CREATE TABLE IF NOT EXISTS "public"."boarding_guide_routes" (
    "id" integer NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "time" character varying(32) NOT NULL,
    "place" character varying(255) NOT NULL,
    "order" integer DEFAULT 0
);


ALTER TABLE "public"."boarding_guide_routes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."boarding_guide_routes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."boarding_guide_routes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."boarding_guide_routes_id_seq" OWNED BY "public"."boarding_guide_routes"."id";



CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "type" character varying NOT NULL,
    "content" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rounding_timetable_contacts" (
    "id" integer NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "name" character varying(50) NOT NULL,
    "phone" character varying(30),
    "role" character varying(50)
);


ALTER TABLE "public"."rounding_timetable_contacts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rounding_timetable_contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."rounding_timetable_contacts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rounding_timetable_contacts_id_seq" OWNED BY "public"."rounding_timetable_contacts"."id";



CREATE TABLE IF NOT EXISTS "public"."rounding_timetable_footers" (
    "id" integer NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "footer" "text"
);


ALTER TABLE "public"."rounding_timetable_footers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rounding_timetable_footers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."rounding_timetable_footers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rounding_timetable_footers_id_seq" OWNED BY "public"."rounding_timetable_footers"."id";



CREATE TABLE IF NOT EXISTS "public"."rounding_timetable_notices" (
    "id" integer NOT NULL,
    "tour_id" "uuid" NOT NULL,
    "notice" "text" NOT NULL,
    "order" integer DEFAULT 0
);


ALTER TABLE "public"."rounding_timetable_notices" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rounding_timetable_notices_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."rounding_timetable_notices_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rounding_timetable_notices_id_seq" OWNED BY "public"."rounding_timetable_notices"."id";



CREATE TABLE IF NOT EXISTS "public"."singsing_boarding_places" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "address" character varying,
    "description" "text",
    "map_url" character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "boarding_main" character varying,
    "boarding_sub" character varying,
    "parking_main" character varying,
    "parking_map_url" character varying
);


ALTER TABLE "public"."singsing_boarding_places" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_boarding_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "place_id" "uuid",
    "date" "date" NOT NULL,
    "depart_time" time without time zone,
    "arrive_time" time without time zone,
    "parking_info" character varying,
    "memo" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."singsing_boarding_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "name" character varying(255) NOT NULL,
    "phone" character varying(20) NOT NULL,
    "team_name" character varying(255),
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying DEFAULT '확정'::character varying,
    "pickup_location" character varying,
    "emergency_contact" character varying,
    "join_count" integer DEFAULT 0,
    "is_confirmed" boolean DEFAULT false,
    "email" character varying,
    "role" character varying(20),
    "room_id" "uuid",
    "gender" character varying(10)
);


ALTER TABLE "public"."singsing_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_pickup_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "participant_id" "uuid",
    "pickup_location" character varying(100) NOT NULL,
    "pickup_time" time without time zone,
    "seat_no" character varying(10),
    "memo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "place_id" "uuid"
);


ALTER TABLE "public"."singsing_pickup_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "room_type" character varying(50) NOT NULL,
    "capacity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "room_seq" integer,
    "room_number" character varying(20)
);


ALTER TABLE "public"."singsing_rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "title" character varying(255) NOT NULL,
    "description" "text",
    "meal_breakfast" boolean DEFAULT false,
    "meal_lunch" boolean DEFAULT false,
    "meal_dinner" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "date" "date",
    "menu_breakfast" "text",
    "menu_lunch" "text",
    "menu_dinner" "text"
);


ALTER TABLE "public"."singsing_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_tee_time_players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tee_time_id" "uuid",
    "participant_id" "uuid",
    "order_no" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."singsing_tee_time_players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_tee_times" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tour_id" "uuid",
    "date" "date" NOT NULL,
    "course" character varying(50) NOT NULL,
    "team_no" integer NOT NULL,
    "tee_time" time without time zone NOT NULL,
    "players" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."singsing_tee_times" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."singsing_tours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "golf_course" character varying(255) NOT NULL,
    "accommodation" character varying(255) NOT NULL,
    "price" integer NOT NULL,
    "max_participants" integer NOT NULL,
    "includes" "text",
    "excludes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "driver_name" character varying(255),
    "reservation_notice" "text",
    "schedule_notice" "text"
);


ALTER TABLE "public"."singsing_tours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tour_products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "golf_course" "text",
    "hotel" "text",
    "reservation_notice" "text",
    "schedule" "jsonb",
    "note" "text",
    "usage_guide" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "usage_bus" "text",
    "usage_round" "text",
    "usage_hotel" "text",
    "usage_meal" "text",
    "usage_locker" "text",
    "usage_tour" "text",
    "courses" "text"[]
);


ALTER TABLE "public"."tour_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(50) NOT NULL,
    "phone" character varying(20) NOT NULL,
    "email" character varying(100),
    "team" character varying(50),
    "role" character varying(20) DEFAULT 'member'::character varying,
    "emergency_phone" character varying(20),
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."boarding_guide_contacts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."boarding_guide_contacts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."boarding_guide_notices" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."boarding_guide_notices_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."boarding_guide_routes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."boarding_guide_routes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rounding_timetable_contacts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rounding_timetable_contacts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rounding_timetable_footers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rounding_timetable_footers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rounding_timetable_notices" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rounding_timetable_notices_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."boarding_guide_contacts"
    ADD CONSTRAINT "boarding_guide_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boarding_guide_notices"
    ADD CONSTRAINT "boarding_guide_notices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."boarding_guide_routes"
    ADD CONSTRAINT "boarding_guide_routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rounding_timetable_contacts"
    ADD CONSTRAINT "rounding_timetable_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rounding_timetable_footers"
    ADD CONSTRAINT "rounding_timetable_footers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rounding_timetable_notices"
    ADD CONSTRAINT "rounding_timetable_notices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_boarding_places"
    ADD CONSTRAINT "singsing_boarding_places_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_boarding_schedules"
    ADD CONSTRAINT "singsing_boarding_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_participants"
    ADD CONSTRAINT "singsing_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_pickup_points"
    ADD CONSTRAINT "singsing_pickup_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_rooms"
    ADD CONSTRAINT "singsing_rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_schedules"
    ADD CONSTRAINT "singsing_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_tee_time_players"
    ADD CONSTRAINT "singsing_tee_time_players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_tee_times"
    ADD CONSTRAINT "singsing_tee_times_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."singsing_tours"
    ADD CONSTRAINT "singsing_tours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tour_products"
    ADD CONSTRAINT "tour_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_boarding_schedules_place_id" ON "public"."singsing_boarding_schedules" USING "btree" ("place_id");



CREATE INDEX "idx_boarding_schedules_tour_id" ON "public"."singsing_boarding_schedules" USING "btree" ("tour_id");



CREATE INDEX "idx_pickup_points_place_id" ON "public"."singsing_pickup_points" USING "btree" ("place_id");



ALTER TABLE ONLY "public"."boarding_guide_contacts"
    ADD CONSTRAINT "boarding_guide_contacts_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boarding_guide_notices"
    ADD CONSTRAINT "boarding_guide_notices_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."boarding_guide_routes"
    ADD CONSTRAINT "boarding_guide_routes_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_boarding_schedules"
    ADD CONSTRAINT "singsing_boarding_schedules_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."singsing_boarding_places"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_boarding_schedules"
    ADD CONSTRAINT "singsing_boarding_schedules_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_participants"
    ADD CONSTRAINT "singsing_participants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."singsing_rooms"("id");



ALTER TABLE ONLY "public"."singsing_participants"
    ADD CONSTRAINT "singsing_participants_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_pickup_points"
    ADD CONSTRAINT "singsing_pickup_points_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."singsing_participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_pickup_points"
    ADD CONSTRAINT "singsing_pickup_points_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."singsing_boarding_places"("id");



ALTER TABLE ONLY "public"."singsing_pickup_points"
    ADD CONSTRAINT "singsing_pickup_points_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_rooms"
    ADD CONSTRAINT "singsing_rooms_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_schedules"
    ADD CONSTRAINT "singsing_schedules_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_tee_time_players"
    ADD CONSTRAINT "singsing_tee_time_players_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "public"."singsing_participants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_tee_time_players"
    ADD CONSTRAINT "singsing_tee_time_players_tee_time_id_fkey" FOREIGN KEY ("tee_time_id") REFERENCES "public"."singsing_tee_times"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."singsing_tee_times"
    ADD CONSTRAINT "singsing_tee_times_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "public"."singsing_tours"("id") ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."boarding_guide_contacts" TO "anon";
GRANT ALL ON TABLE "public"."boarding_guide_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."boarding_guide_contacts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."boarding_guide_contacts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."boarding_guide_contacts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."boarding_guide_contacts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."boarding_guide_notices" TO "anon";
GRANT ALL ON TABLE "public"."boarding_guide_notices" TO "authenticated";
GRANT ALL ON TABLE "public"."boarding_guide_notices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."boarding_guide_notices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."boarding_guide_notices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."boarding_guide_notices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."boarding_guide_routes" TO "anon";
GRANT ALL ON TABLE "public"."boarding_guide_routes" TO "authenticated";
GRANT ALL ON TABLE "public"."boarding_guide_routes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."boarding_guide_routes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."boarding_guide_routes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."boarding_guide_routes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."rounding_timetable_contacts" TO "anon";
GRANT ALL ON TABLE "public"."rounding_timetable_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."rounding_timetable_contacts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rounding_timetable_contacts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rounding_timetable_contacts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rounding_timetable_contacts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."rounding_timetable_footers" TO "anon";
GRANT ALL ON TABLE "public"."rounding_timetable_footers" TO "authenticated";
GRANT ALL ON TABLE "public"."rounding_timetable_footers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rounding_timetable_footers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rounding_timetable_footers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rounding_timetable_footers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."rounding_timetable_notices" TO "anon";
GRANT ALL ON TABLE "public"."rounding_timetable_notices" TO "authenticated";
GRANT ALL ON TABLE "public"."rounding_timetable_notices" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rounding_timetable_notices_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rounding_timetable_notices_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rounding_timetable_notices_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_boarding_places" TO "anon";
GRANT ALL ON TABLE "public"."singsing_boarding_places" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_boarding_places" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_boarding_schedules" TO "anon";
GRANT ALL ON TABLE "public"."singsing_boarding_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_boarding_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_participants" TO "anon";
GRANT ALL ON TABLE "public"."singsing_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_participants" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_pickup_points" TO "anon";
GRANT ALL ON TABLE "public"."singsing_pickup_points" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_pickup_points" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_rooms" TO "anon";
GRANT ALL ON TABLE "public"."singsing_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_rooms" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_schedules" TO "anon";
GRANT ALL ON TABLE "public"."singsing_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_tee_time_players" TO "anon";
GRANT ALL ON TABLE "public"."singsing_tee_time_players" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_tee_time_players" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_tee_times" TO "anon";
GRANT ALL ON TABLE "public"."singsing_tee_times" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_tee_times" TO "service_role";



GRANT ALL ON TABLE "public"."singsing_tours" TO "anon";
GRANT ALL ON TABLE "public"."singsing_tours" TO "authenticated";
GRANT ALL ON TABLE "public"."singsing_tours" TO "service_role";



GRANT ALL ON TABLE "public"."tour_products" TO "anon";
GRANT ALL ON TABLE "public"."tour_products" TO "authenticated";
GRANT ALL ON TABLE "public"."tour_products" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
