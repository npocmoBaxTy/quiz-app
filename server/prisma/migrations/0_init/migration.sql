-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "answer_options" (
    "id" UUID NOT NULL,
    "question_id" UUID,
    "text" TEXT,
    "is_correct" BOOLEAN,

    CONSTRAINT "answer_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_questions" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "order_index" INTEGER,
    "points" INTEGER,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "attempt_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" UUID NOT NULL,
    "quiz_id" UUID,
    "student_id" UUID,
    "started_at" TIMESTAMP(6),
    "finished_at" TIMESTAMP(6),
    "score" INTEGER,
    "status" VARCHAR,
    "max_score" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_students" (
    "group_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,

    CONSTRAINT "group_students_pkey" PRIMARY KEY ("group_id","student_id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "name" VARCHAR,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR,
    "parent_id" UUID,

    CONSTRAINT "question_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "text" TEXT,
    "type" VARCHAR,
    "created_by" UUID,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_assignments" (
    "id" UUID NOT NULL,
    "quiz_id" UUID,
    "group_id" UUID,
    "start_date" TIMESTAMP(6),
    "due_date" TIMESTAMP(6),
    "student_id" UUID,

    CONSTRAINT "quiz_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "quiz_id" UUID,
    "question_id" UUID,
    "points" INTEGER,
    "order_index" INTEGER,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" UUID NOT NULL,
    "title" VARCHAR,
    "passing" INTEGER,
    "created_by" UUID,
    "time_limit" INTEGER,
    "attempt_limit" INTEGER,
    "published" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "questions_limit" INTEGER,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID,
    "question_id" UUID,
    "answer_option_id" UUID,
    "text_answer" TEXT,
    "is_correct" BOOLEAN,
    "points" INTEGER,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_attempt_question_option" ON "student_answers"("attempt_id", "question_id", "answer_option_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "answer_options" ADD CONSTRAINT "answer_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt_questions" ADD CONSTRAINT "attempt_questions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt_questions" ADD CONSTRAINT "attempt_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "group_students" ADD CONSTRAINT "group_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question_categories" ADD CONSTRAINT "question_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "question_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_assignments" ADD CONSTRAINT "quiz_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_answer_option_id_fkey" FOREIGN KEY ("answer_option_id") REFERENCES "answer_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

