-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "isFavorite" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "isFavorite" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "isFavorite" BOOLEAN DEFAULT false;
