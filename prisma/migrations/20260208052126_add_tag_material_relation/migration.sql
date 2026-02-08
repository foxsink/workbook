-- CreateTable
CREATE TABLE "_MaterialToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MaterialToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MaterialToTag_B_index" ON "_MaterialToTag"("B");

-- AddForeignKey
ALTER TABLE "_MaterialToTag" ADD CONSTRAINT "_MaterialToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MaterialToTag" ADD CONSTRAINT "_MaterialToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
