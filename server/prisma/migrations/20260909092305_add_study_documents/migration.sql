-- CreateTable
CREATE TABLE "document_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_documents" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "file_url" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "study_documents" ADD CONSTRAINT "study_documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "document_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
