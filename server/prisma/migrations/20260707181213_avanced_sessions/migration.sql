/*
  Warnings:

  - The values [GROUP_INVITATION_ACCEPTED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `group_invitations` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('REACTION', 'COMMENT', 'MESSAGE', 'GROUP_INVITATION', 'GROUP_JOIN', 'SYSTEM', 'SUPPORT_ACCEPTED', 'SUPPORT_COMPLETED', 'SUPPORT_CANCELLED', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "group_invitations" DROP CONSTRAINT "group_invitations_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_invitations" DROP CONSTRAINT "group_invitations_inviteeId_fkey";

-- DropForeignKey
ALTER TABLE "group_invitations" DROP CONSTRAINT "group_invitations_inviterId_fkey";

-- DropTable
DROP TABLE "group_invitations";

-- DropEnum
DROP TYPE "GroupInvitationStatus";
