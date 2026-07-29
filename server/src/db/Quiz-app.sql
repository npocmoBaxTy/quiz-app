CREATE TABLE "quizzes" (
  "id" uuid PRIMARY KEY,
  "title" varchar,
  "description" text,
  "passing" int,
  "created_by" uuid,
  "time_limit" int,
  "attempt_limit" int,
  "published" boolean,
  "created_at" timestamp
);

CREATE TABLE "quiz_questions" (
  "id" uuid PRIMARY KEY,
  "quiz_id" uuid,
  "question_id" uuid,
  "points" int,
  "order_index" int
);

CREATE TABLE "quiz_assignments" (
  "id" uuid PRIMARY KEY,
  "quiz_id" uuid,
  "group_id" uuid,
  "start_date" timestamp,
  "due_date" timestamp
);

CREATE TABLE "attempts" (
  "id" uuid PRIMARY KEY,
  "quiz_id" uuid,
  "student_id" uuid,
  "started_at" timestamp,
  "finished_at" timestamp,
  "score" int,
  "status" varchar
);

CREATE TABLE "student_answers" (
  "id" uuid PRIMARY KEY,
  "attempt_id" uuid,
  "question_id" uuid,
  "answer_option_id" uuid,
  "text_answer" text,
  "is_correct" boolean,
  "points" int
);

CREATE TABLE "attempt_questions" (
  "id" uuid PRIMARY KEY,
  "attempt_id" uuid NOT NULL,
  "question_id" uuid NOT NULL,
  "order_index" int,
  "points" int,
  "created_at" timestamp
);

CREATE TABLE "answer_options" (
  "id" uuid PRIMARY KEY,
  "question_id" uuid,
  "text" text,
  "is_correct" boolean
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "hemis_id" varchar UNIQUE,
  "name" varchar,
  "role" varchar,
  "created_at" timestamp
);

CREATE TABLE "groups" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "created_at" timestamp
);

CREATE TABLE "group_students" (
  "group_id" uuid,
  "student_id" uuid,
  PRIMARY KEY ("group_id", "student_id")
);

CREATE TABLE "question_categories" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "parent_id" uuid
);

CREATE TABLE "questions" (
  "id" uuid PRIMARY KEY,
  "text" text,
  "type" varchar,
  "difficulty" int,
  "created_by" uuid,
  "created_at" timestamp
);

ALTER TABLE "quizzes" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "quiz_questions" ADD FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "quiz_questions" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "quiz_assignments" ADD FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "quiz_assignments" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attempts" ADD FOREIGN KEY ("quiz_id") REFERENCES "quizzes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attempts" ADD FOREIGN KEY ("student_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "student_answers" ADD FOREIGN KEY ("attempt_id") REFERENCES "attempts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "student_answers" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "student_answers" ADD FOREIGN KEY ("answer_option_id") REFERENCES "answer_options" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attempt_questions" ADD FOREIGN KEY ("attempt_id") REFERENCES "attempts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "attempt_questions" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "answer_options" ADD FOREIGN KEY ("question_id") REFERENCES "questions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "group_students" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "group_students" ADD FOREIGN KEY ("student_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "question_categories" ADD FOREIGN KEY ("parent_id") REFERENCES "question_categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "questions" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
