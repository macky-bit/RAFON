<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
startAppSession();
requireAuthenticatedUser();

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requestPayload(): array
{
    $payload = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($payload)) {
        respond(['error' => 'The request body must contain valid JSON.'], 400);
    }
    return $payload;
}

function validDate(string $date): bool
{
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    return $parsed !== false && $parsed->format('Y-m-d') === $date;
}

function validatedTransaction(array $payload, PDO $pdo): array
{
    $date = trim((string) ($payload['date'] ?? ''));
    $reference = trim((string) ($payload['ref'] ?? ''));
    $debitCode = trim((string) ($payload['debitCode'] ?? ''));
    $creditCode = trim((string) ($payload['creditCode'] ?? ''));
    $explanation = trim((string) ($payload['explanation'] ?? ''));
    $debitAmount = round((float) ($payload['debitAmount'] ?? 0), 2);
    $creditAmount = round((float) ($payload['creditAmount'] ?? 0), 2);

    if (!validDate($date)) respond(['error' => 'A valid transaction date is required.'], 422);
    if ($reference === '' || strlen($reference) > 50) respond(['error' => 'The reference is required and must not exceed 50 characters.'], 422);
    if ($explanation === '' || strlen($explanation) > 500) respond(['error' => 'The explanation is required and must not exceed 500 characters.'], 422);
    if ($debitCode === '' || $creditCode === '' || $debitCode === $creditCode) respond(['error' => 'Choose two different debit and credit accounts.'], 422);
    if ($debitAmount <= 0 || $creditAmount <= 0 || (int) round($debitAmount * 100) !== (int) round($creditAmount * 100)) {
        respond(['error' => 'Debit and credit amounts must be positive and equal.'], 422);
    }

    $statement = $pdo->prepare('SELECT id, code, title FROM accounts WHERE code IN (?, ?) AND is_active = TRUE');
    $statement->execute([$debitCode, $creditCode]);
    $accounts = [];
    foreach ($statement->fetchAll() as $account) $accounts[$account['code']] = $account;
    if (!isset($accounts[$debitCode], $accounts[$creditCode])) {
        respond(['error' => 'One or both selected accounts do not exist or are inactive.'], 422);
    }

    return compact('date', 'reference', 'debitCode', 'creditCode', 'explanation', 'debitAmount', 'creditAmount', 'accounts');
}

function transactionRecord(int $id, array $data): array
{
    $debit = $data['accounts'][$data['debitCode']];
    $credit = $data['accounts'][$data['creditCode']];
    return [
        'id' => $id, 'date' => $data['date'], 'ref' => $data['reference'],
        'debitAcc' => $debit['title'], 'debitCode' => $data['debitCode'],
        'debitAmount' => $data['debitAmount'], 'creditAcc' => $credit['title'],
        'creditCode' => $data['creditCode'], 'creditAmount' => $data['creditAmount'],
        'explanation' => $data['explanation'],
    ];
}

function journalAudit(PDO $pdo, string $action, string $reference, string $detail): array
{
    $user = currentUser()['fullName'] ?? 'System User';
    $statement = $pdo->prepare(
        'INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)'
    );
    $statement->execute([$user, $action, $reference, $detail, 'VERIFIED']);
    return [
        'timestamp' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
        'user' => $user, 'action' => $action,
        'ref' => $reference, 'detail' => $detail, 'status' => 'VERIFIED',
    ];
}

function loadAccountingData(PDO $pdo): array
{
    $accounts = $pdo->query(
        "SELECT code, title, category, normal_balance AS normal
         FROM accounts WHERE is_active = TRUE
         ORDER BY CAST(code AS UNSIGNED), code"
    )->fetchAll();

    $entries = $pdo->query(
        "SELECT je.id, DATE_FORMAT(je.entry_date, '%Y-%m-%d') AS date,
                je.reference_number AS ref, debit_account.title AS debitAcc,
                debit_account.code AS debitCode, debit_line.amount AS debitAmount,
                credit_account.title AS creditAcc, credit_account.code AS creditCode,
                credit_line.amount AS creditAmount, je.explanation
         FROM journal_entries je
         INNER JOIN journal_lines debit_line
             ON debit_line.journal_entry_id = je.id AND debit_line.line_type = 'Debit'
         INNER JOIN accounts debit_account ON debit_account.id = debit_line.account_id
         INNER JOIN journal_lines credit_line
             ON credit_line.journal_entry_id = je.id AND credit_line.line_type = 'Credit'
         INNER JOIN accounts credit_account ON credit_account.id = credit_line.account_id
         WHERE je.status = 'POSTED' ORDER BY je.entry_date, je.id"
    )->fetchAll();

    foreach ($entries as &$entry) {
        $entry['id'] = (int) $entry['id'];
        $entry['debitAmount'] = (float) $entry['debitAmount'];
        $entry['creditAmount'] = (float) $entry['creditAmount'];
    }
    unset($entry);

    $logs = $pdo->query(
        "SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS timestamp,
                user_name AS user, action, reference_number AS ref,
                details AS detail, status
         FROM audit_logs ORDER BY created_at, id"
    )->fetchAll();

    return ['chartOfAccounts' => $accounts, 'journalEntries' => $entries, 'auditLogs' => $logs];
}

try {
    $pdo = Database::connection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        respond(loadAccountingData($pdo));
    }
    if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
        header('Allow: GET, POST, PUT, DELETE');
        respond(['error' => 'Method not allowed.'], 405);
    }

    $payload = requestPayload();
    $id = (int) ($payload['id'] ?? 0);
    if ($method !== 'POST' && $id <= 0) respond(['error' => 'A valid journal entry ID is required.'], 422);

    if ($method === 'DELETE') {
        $pdo->beginTransaction();
        $statement = $pdo->prepare('SELECT reference_number, status FROM journal_entries WHERE id = ? FOR UPDATE');
        $statement->execute([$id]);
        $existing = $statement->fetch();
        if (!$existing || $existing['status'] !== 'POSTED') {
            $pdo->rollBack();
            respond(['error' => 'This journal entry is no longer available.'], 404);
        }
        $pdo->prepare("UPDATE journal_entries SET status = 'VOID' WHERE id = ?")->execute([$id]);
        $auditLog = journalAudit($pdo, 'Deleted Transaction', $existing['reference_number'], 'Journal entry voided');
        $pdo->commit();
        respond(['id' => $id, 'auditLog' => $auditLog]);
    }

    $data = validatedTransaction($payload, $pdo);
    $debitAccount = $data['accounts'][$data['debitCode']];
    $creditAccount = $data['accounts'][$data['creditCode']];
    $detail = $debitAccount['title'] . ' / ' . $creditAccount['title'];

    $pdo->beginTransaction();
    if ($method === 'POST') {
        $statement = $pdo->prepare(
            'INSERT INTO journal_entries (entry_date, reference_number, explanation, created_by) VALUES (?, ?, ?, ?)'
        );
        $statement->execute([$data['date'], $data['reference'], $data['explanation'], currentUser()['fullName'] ?? 'System User']);
        $id = (int) $pdo->lastInsertId();
    } else {
        $statement = $pdo->prepare('SELECT status FROM journal_entries WHERE id = ? FOR UPDATE');
        $statement->execute([$id]);
        $existing = $statement->fetch();
        if (!$existing || $existing['status'] !== 'POSTED') {
            $pdo->rollBack();
            respond(['error' => 'This journal entry is no longer available.'], 404);
        }
        $pdo->prepare('UPDATE journal_entries SET entry_date = ?, reference_number = ?, explanation = ? WHERE id = ?')
            ->execute([$data['date'], $data['reference'], $data['explanation'], $id]);
    }

    $lineStatement = $pdo->prepare(
        'INSERT INTO journal_lines (journal_entry_id, account_id, line_type, amount) VALUES (?, ?, ?, ?)'
    );
    if ($method === 'PUT') $pdo->prepare('DELETE FROM journal_lines WHERE journal_entry_id = ?')->execute([$id]);
    $lineStatement->execute([$id, $debitAccount['id'], 'Debit', $data['debitAmount']]);
    $lineStatement->execute([$id, $creditAccount['id'], 'Credit', $data['creditAmount']]);

    $auditLog = journalAudit($pdo, $method === 'POST' ? 'Posted Transaction' : 'Edited Transaction', $data['reference'], $detail);
    $pdo->commit();

    respond([
        'entry' => transactionRecord($id, $data),
        'auditLog' => $auditLog,
    ], $method === 'POST' ? 201 : 200);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    if ((string) $exception->getCode() === '23000') respond(['error' => 'That reference code already exists. Use a unique reference.'], 409);
    error_log($exception->getMessage());
    respond(['error' => 'The database request could not be completed. Check the database configuration.'], 500);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log($exception->getMessage());
    respond(['error' => 'An unexpected server error occurred.'], 500);
}

