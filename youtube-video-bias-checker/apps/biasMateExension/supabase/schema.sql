


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



CREATE TYPE "public"."political_leaning_enum" AS ENUM (
    'left',
    'left-leaning',
    'center',
    'right-leaning',
    'right'
);


ALTER TYPE "public"."political_leaning_enum" OWNER TO "postgres";


CREATE TYPE "public"."term_modifier_enum" AS ENUM (
    'pro',
    'anti',
    'neo',
    'post',
    'proto'
);


ALTER TYPE "public"."term_modifier_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_analysis_terms"("p_analysis_id" "uuid") RETURNS TABLE("term" "text", "definition" "text", "source_url" "text", "modifier" "public"."term_modifier_enum", "display_term" "text")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.term,
        pt.definition,
        pt.source_url,
        pat.modifier,
        -- Generate display term with modifier prefix
        CASE 
            WHEN pat.modifier = 'anti' THEN 'Anti-' || pt.term
            WHEN pat.modifier = 'pro' THEN 'Pro-' || pt.term
            WHEN pat.modifier = 'neo' THEN 'Neo-' || pt.term
            WHEN pat.modifier = 'post' THEN 'Post-' || pt.term
            WHEN pat.modifier = 'proto' THEN 'Proto-' || pt.term
            ELSE pt.term
        END AS display_term
    FROM political_analysis_terms pat
    JOIN political_terms pt ON pt.id = pat.term_id
    WHERE pat.analysis_id = p_analysis_id
    ORDER BY pt.term;
END;
$$;


ALTER FUNCTION "public"."get_analysis_terms"("p_analysis_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_modified_definition"("p_definition" "text", "p_modifier" "public"."term_modifier_enum") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN CASE p_modifier
        WHEN 'anti' THEN 'Opposition to or rejection of: ' || p_definition
        WHEN 'pro' THEN 'Advocacy or support for: ' || p_definition
        WHEN 'neo' THEN 'A modern revival or reinterpretation of: ' || p_definition
        WHEN 'post' THEN 'A perspective that moves beyond or after: ' || p_definition
        WHEN 'proto' THEN 'An early or foundational form of: ' || p_definition
        ELSE p_definition
    END;
END;
$$;


ALTER FUNCTION "public"."get_modified_definition"("p_definition" "text", "p_modifier" "public"."term_modifier_enum") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."political_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "video_id" character varying(11) NOT NULL,
    "political_leaning" "public"."political_leaning_enum" NOT NULL,
    "summary_and_analysis" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."political_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."political_analysis_terms" (
    "analysis_id" "uuid" NOT NULL,
    "term_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "modifier" "public"."term_modifier_enum"
);


ALTER TABLE "public"."political_analysis_terms" OWNER TO "postgres";


COMMENT ON TABLE "public"."political_analysis_terms" IS 'Junction table linking political analyses to referenced political terms';



COMMENT ON COLUMN "public"."political_analysis_terms"."modifier" IS 'Optional modifier prefix: anti (opposition), pro (support), neo (modern revival), post (after/beyond), proto (early form)';



CREATE TABLE IF NOT EXISTS "public"."political_terms" (
    "id" bigint NOT NULL,
    "term" "text" NOT NULL,
    "definition" "text" NOT NULL,
    "source_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "search_vector" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", (("term" || ' '::"text") || "definition"))) STORED,
    CONSTRAINT "political_terms_definition_check" CHECK (("char_length"("definition") > 0)),
    CONSTRAINT "political_terms_term_check" CHECK (("char_length"("term") > 0))
);


ALTER TABLE "public"."political_terms" OWNER TO "postgres";


ALTER TABLE "public"."political_terms" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."political_terms_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."video_metadata" (
    "video_id" character varying(11) NOT NULL,
    "title" "text" NOT NULL,
    "channel_name" character varying(255) NOT NULL,
    "upload_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."video_metadata" OWNER TO "postgres";


ALTER TABLE ONLY "public"."political_analysis"
    ADD CONSTRAINT "political_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."political_analysis_terms"
    ADD CONSTRAINT "political_analysis_terms_pkey" PRIMARY KEY ("analysis_id", "term_id");



ALTER TABLE ONLY "public"."political_terms"
    ADD CONSTRAINT "political_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."video_metadata"
    ADD CONSTRAINT "video_metadata_pkey" PRIMARY KEY ("video_id");



CREATE INDEX "idx_analysis_terms_modifier" ON "public"."political_analysis_terms" USING "btree" ("modifier") WHERE ("modifier" IS NOT NULL);



CREATE INDEX "idx_analysis_terms_term_id" ON "public"."political_analysis_terms" USING "btree" ("term_id");



CREATE INDEX "idx_political_analysis_created_at" ON "public"."political_analysis" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_political_analysis_leaning" ON "public"."political_analysis" USING "btree" ("political_leaning");



CREATE INDEX "idx_political_analysis_video_id" ON "public"."political_analysis" USING "btree" ("video_id");



CREATE INDEX "idx_video_metadata_channel_name" ON "public"."video_metadata" USING "btree" ("channel_name");



CREATE INDEX "idx_video_metadata_upload_date" ON "public"."video_metadata" USING "btree" ("upload_date");



CREATE INDEX "political_terms_search_idx" ON "public"."political_terms" USING "gin" ("search_vector");



CREATE UNIQUE INDEX "unique_political_term" ON "public"."political_terms" USING "btree" ("lower"("term"));



CREATE OR REPLACE TRIGGER "update_political_analysis_updated_at" BEFORE UPDATE ON "public"."political_analysis" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_video_metadata_updated_at" BEFORE UPDATE ON "public"."video_metadata" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."political_analysis_terms"
    ADD CONSTRAINT "political_analysis_terms_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "public"."political_analysis"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."political_analysis_terms"
    ADD CONSTRAINT "political_analysis_terms_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "public"."political_terms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."political_analysis"
    ADD CONSTRAINT "political_analysis_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "public"."video_metadata"("video_id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated delete on political_analysis_terms" ON "public"."political_analysis_terms" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated insert on political_analysis" ON "public"."political_analysis" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on political_analysis_terms" ON "public"."political_analysis_terms" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on video_metadata" ON "public"."video_metadata" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow public read access on political_analysis" ON "public"."political_analysis" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on political_analysis_terms" ON "public"."political_analysis_terms" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on video_metadata" ON "public"."video_metadata" FOR SELECT USING (true);



ALTER TABLE "public"."political_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."political_analysis_terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."political_terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."video_metadata" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_analysis_terms"("p_analysis_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_analysis_terms"("p_analysis_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_analysis_terms"("p_analysis_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_modified_definition"("p_definition" "text", "p_modifier" "public"."term_modifier_enum") TO "anon";
GRANT ALL ON FUNCTION "public"."get_modified_definition"("p_definition" "text", "p_modifier" "public"."term_modifier_enum") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_modified_definition"("p_definition" "text", "p_modifier" "public"."term_modifier_enum") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."political_analysis" TO "anon";
GRANT ALL ON TABLE "public"."political_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."political_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."political_analysis_terms" TO "anon";
GRANT ALL ON TABLE "public"."political_analysis_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."political_analysis_terms" TO "service_role";



GRANT ALL ON TABLE "public"."political_terms" TO "anon";
GRANT ALL ON TABLE "public"."political_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."political_terms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."political_terms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."political_terms_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."political_terms_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."video_metadata" TO "anon";
GRANT ALL ON TABLE "public"."video_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."video_metadata" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







