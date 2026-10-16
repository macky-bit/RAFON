<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
startAppSession();
requireAuthenticatedUser();

function respondRecovery(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $pdo = Database::connection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $records = [];
        $queries = [
            'ingredient' => "SELECT ingredient_id AS id, ingredient_name AS name, deleted_at AS changedAt FROM ingredients WHERE deleted_at IS NOT NULL",
            'event' => "SELECT id, event_name AS name, deleted_at AS changedAt FROM catering_events WHERE deleted_at IS NOT NULL",
            'journal' => "SELECT je.id, je.reference_number AS name,
                COALESCE((SELECT MAX(al.created_at) FROM audit_logs al WHERE al.action = 'Deleted Transaction' AND al.reference_number = je.reference_number), je.created_at) AS changedAt
                FROM journal_entries je WHERE je.status = 'VOID'",
            'supplier' => "SELECT id, business_name AS name, COALESCE(archived_at, updated_at) AS changedAt FROM suppliers WHERE status = 'Inactive'",
        ];
        foreach ($queries as $type => $sql) {
            foreach ($pdo->query($sql)->fetchAll() as $row) {
                $records[] = [
                    'type' => $type,
                    'id' => (int) $row['id'],
                    'name' => $row['name'],
                    'changedAt' => $row['changedAt'],
                ];
            }
        }
        usort($records, static fn(array $a, array $b): int => strcmp((string) $b['changedAt'], (string) $a['changedAt']));
        if (($_GET['action'] ?? '') === 'download') {
            $type = (string) ($_GET['type'] ?? '');
            $status = (string) ($_GET['status'] ?? '');
            $search = mb_strtolower(trim((string) ($_GET['search'] ?? '')));
            if (!in_array($type, ['', 'ingredient', 'event', 'journal', 'supplier'], true) ||
                !in_array($status, ['', 'deleted', 'archived', 'voided'], true) || mb_strlen($search) > 120) {
                respondRecovery(['error' => 'Choose valid backup filters.'], 422);
            }
            $recordStatus = ['ingredient' => 'deleted', 'event' => 'deleted', 'journal' => 'voided', 'supplier' => 'archived'];
            $selected = array_values(array_filter($records, static fn(array $record): bool =>
                ($type === '' || $record['type'] === $type) &&
                ($status === '' || $recordStatus[$record['type']] === $status) &&
                ($search === '' || mb_stripos($record['name'], $search) !== false)
            ));
            $ids = static function (string $recordType) use ($selected): string {
                return implode(',', array_map('intval', array_column(array_filter($selected, static fn(array $record): bool => $record['type'] === $recordType), 'id')));
            };
            $ingredientIds = $ids('ingredient');
            $eventIds = $ids('event');
            $supplierIds = $ids('supplier');
            $journalIds = $ids('journal');
            $backup = [
                'exportedAt' => (new DateTimeImmutable())->format(DATE_ATOM),
                'filters' => ['search' => $search, 'type' => $type, 'status' => $status],
                'ingredients' => $ingredientIds === '' ? [] : $pdo->query("SELECT * FROM ingredients WHERE deleted_at IS NOT NULL AND ingredient_id IN ({$ingredientIds})")->fetchAll(),
                'cateringEvents' => $eventIds === '' ? [] : $pdo->query("SELECT * FROM catering_events WHERE deleted_at IS NOT NULL AND id IN ({$eventIds})")->fetchAll(),
                'suppliers' => $supplierIds === '' ? [] : $pdo->query("SELECT * FROM suppliers WHERE status = 'Inactive' AND id IN ({$supplierIds})")->fetchAll(),
                'journalEntries' => $journalIds === '' ? [] : $pdo->query("SELECT * FROM journal_entries WHERE status = 'VOID' AND id IN ({$journalIds})")->fetchAll(),
                'journalLines' => $journalIds === '' ? [] : $pdo->query("SELECT jl.* FROM journal_lines jl JOIN journal_entries je ON je.id = jl.journal_entry_id WHERE je.status = 'VOID' AND je.id IN ({$journalIds})")->fetchAll(),
            ];
            header('Content-Disposition: attachment; filename="rafon-recovery-backup-' . date('Y-m-d') . '.json"');
            echo json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
            exit;
        }
        respondRecovery(['records' => $records]);
    }

    if ($method !== 'POST') {
        header('Allow: GET, POST');
        respondRecovery(['error' => 'Method not allowed.'], 405);
    }

    $payload = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($payload)) respondRecovery(['error' => 'The request body must contain valid JSON.'], 400);
    $type = (string) ($payload['type'] ?? '');
    $id = filter_var($payload['id'] ?? null, FILTER_VALIDATE_INT);
    $targets = [
        'ingredient' => ['ingredients', 'ingredient_id', 'deleted_at IS NOT NULL', 'deleted_at = NULL', 'INGREDIENT-'],
        'event' => ['catering_events', 'id', 'deleted_at IS NOT NULL', 'deleted_at = NULL', 'EVENT-'],
        'journal' => ['journal_entries', 'id', "status = 'VOID'", "status = 'POSTED'", 'JOURNAL-'],
        'supplier' => ['suppliers', 'id', "status = 'Inactive'", "status = 'Active', archived_at = NULL", 'SUPPLIER-'],
    ];
    if (!isset($targets[$type]) || $id === false || $id <= 0) {
        respondRecovery(['error' => 'Choose a valid record to restore.'], 422);
    }

    [$table, $key, $condition, $change, $referencePrefix] = $targets[$type];
    $pdo->beginTransaction();
    $statement = $pdo->prepare("UPDATE {$table} SET {$change} WHERE {$key} = ? AND {$condition}");
    $statement->execute([$id]);
    if ($statement->rowCount() !== 1) {
        $pdo->rollBack();
        respondRecovery(['error' => 'This record is no longer available for recovery.'], 404);
    }
    $audit = $pdo->prepare('INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)');
    $audit->execute([
        currentUser()['fullName'] ?? 'System User',
        'Restored ' . ucfirst($type),
        $referencePrefix . $id,
        'Restored from Backup & Recovery',
        'VERIFIED',
    ]);
    $pdo->commit();
    respondRecovery(['restored' => ['type' => $type, 'id' => $id]]);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($exception->getMessage());
    respondRecovery(['error' => 'Recovery is unavailable. Run migration 007 if needed.'], 500);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($exception->getMessage());
    respondRecovery(['error' => 'An unexpected server error occurred.'], 500);
}
