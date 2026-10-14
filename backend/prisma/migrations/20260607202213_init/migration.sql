-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PERSONAL_EXPENSE', 'PERSONAL_INCOME', 'LENT_TO_FRIEND', 'BORROWED_FROM_FRIEND');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "friend_name" TEXT,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_transaction_type_idx" ON "Transaction"("transaction_type");

-- CreateIndex
CREATE INDEX "Transaction_friend_name_idx" ON "Transaction"("friend_name");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
