export const FILE_LOG_MESSAGES = {
    UPLOAD_ROLLBACK_FAILED: (fileId: string) =>
        `Failed to roll back uploaded file (file ID: ${fileId}) after creation failure`,
    
    UPDATE_ROLLBACK_FAILED: (fileId: string) =>
        `Failed to roll back uploaded file (file ID: ${fileId}) after update failure for`,
    
    OLD_FILE_CLEANUP_FAILED: (entityLabel: string, fileId: string) =>
        `"${entityLabel}" updated successfully, but failed to delete old file (file ID: ${fileId})`,

    DELETE_CASCADE_CLEANUP_FAILED: (entityLabel: string, fileId: string) =>
        `${entityLabel} deleted, but cleanup of associated file (file ID: ${fileId}) failed`,
} as const;