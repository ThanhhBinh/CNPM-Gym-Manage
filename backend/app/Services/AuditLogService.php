<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditLogService
{
    public static function log($userId, $action, $entityType, $entityId, $oldValues = null, $newValues = null, $ipAddress = null)
    {
        return AuditLog::create([
            'user_id' => $userId,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress ?? request()->ip(),
        ]);
    }
}
