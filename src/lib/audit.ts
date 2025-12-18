import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

interface AuditLogParams {
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValues?: any;
  newValues?: any;
  userId?: string; // Optional, if not provided we try to get it from session
}

export async function createAuditLog({
  tableName,
  recordId,
  action,
  oldValues,
  newValues,
  userId,
}: AuditLogParams) {
  try {
    let finalUserId = userId;

    if (!finalUserId) {
      const session = await auth();
      finalUserId = session?.user?.id;
    }

    if (!finalUserId) {
      console.warn(`Audit log skipped for ${tableName} ${recordId}: No user ID found`);
      return;
    }

    await prisma.auditLog.create({
      data: {
        userId: finalUserId,
        tableName,
        recordId,
        action,
        oldValues: oldValues ? (oldValues as any) : undefined,
        newValues: newValues ? (newValues as any) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // We don't want to fail the main request if audit logging fails, so we just log the error
  }
}
