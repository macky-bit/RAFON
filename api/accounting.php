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

function validatedTransaction(array $payload, PDO $pdo, ?int $existingId = null): array
{
    $date = trim((string) ($payload['date'] ?? ''));
    $reference = trim((string) ($payload['ref'] ?? ''));
    $title = trim((string) ($payload['title'] ?? ''));
    $explanation = trim((string) ($payload['explanation'] ?? ''));
    $lines = $payload['lines'] ?? null;

    if (!validDate($date)) respond(['error' => 'A valid transaction date is required.'], 422);
    if ($reference === '' || strlen($reference) > 50) respond(['error' => 'The reference is required and must not exceed 50 characters.'], 422);
    if (!preg_match('/^[0-9]{5}$/D', $reference)) {
        $existingReference = null;
        if ($existingId !== null) {
            $referenceStatement = $pdo->prepare("SELECT reference_number FROM journal_entries WHERE id = ? AND status = 'POSTED'");
            $referenceStatement->execute([$existingId]);
            $existingReference = $referenceStatement->fetchColumn();
        }
        if ($existingReference !== $reference) respond(['error' => 'Transaction reference code must be exactly 5 digits.'], 422);
    }
    if ($title === '') respond(['error' => 'Enter a journal title.'], 422);
    if (mb_strlen($title) > 150) respond(['error' => 'Journal title must be 150 characters or fewer.'], 422);
    if ($explanation === '' || strlen($explanation) > 500) respond(['error' => 'The explanation is required and must not exceed 500 characters.'], 422);
    if (!is_array($lines) || count($lines) < 2 || count($lines) > 30) {
        respond(['error' => 'Add at least one debit and one credit line (30 lines maximum).'], 422);
    }
    $totals = ['Debit' => 0, 'Credit' => 0];
    $codes = [];
    foreach ($lines as &$line) {
        if (!is_array($line)) respond(['error' => 'Each journal line must be an object.'], 422);
        $type = (string) ($line['type'] ?? '');
        $code = trim((string) ($line['accountCode'] ?? ''));
        $amount = $line['amount'] ?? null;
        if (!isset($totals[$type]) || $code === '' || !is_numeric($amount) ||
            !is_finite((float) $amount) || (float) $amount <= 0 || (float) $amount > 9999999999999.99 ||
            abs((float) $amount * 100 - round((float) $amount * 100)) > 0.00001) {
            respond(['error' => 'Each line needs a valid account and a positive amount with at most two decimal places.'], 422);
        }
        $line = ['type' => $type, 'accountCode' => $code, 'amount' => round((float) $amount, 2)];
        $totals[$type] += (int) round($line['amount'] * 100);
        $codes[$code] = true;
    }
    unset($line);
    if ($totals['Debit'] <= 0 || $totals['Credit'] <= 0 || $totals['Debit'] !== $totals['Credit']) {
        respond(['error' => 'Total debits and credits must be positive and equal.'], 422);
    }

    $placeholders = implode(',', array_fill(0, count($codes), '?'));
    $statement = $pdo->prepare("SELECT id, code, title FROM accounts WHERE code IN ({$placeholders}) AND is_active = TRUE");
    $statement->execute(array_keys($codes));
    $accounts = [];
    foreach ($statement->fetchAll() as $account) $accounts[$account['code']] = $account;
    if (count($accounts) !== count($codes)) {
        respond(['error' => 'One or more selected accounts do not exist or are inactive.'], 422);
    }

    return compact('date', 'reference', 'title', 'explanation', 'lines', 'accounts');
}

function transactionRecord(int $id, array $data): array
{
    $lines = array_map(static function (array $line) use ($data): array {
        return [
            'type' => $line['type'], 'accountCode' => $line['accountCode'],
            'accountTitle' => $data['accounts'][$line['accountCode']]['title'],
            'amount' => $line['amount'],
        ];
    }, $data['lines']);
    $debits = array_values(array_filter($lines, static fn(array $line): bool => $line['type'] === 'Debit'));
    $credits = array_values(array_filter($lines, static fn(array $line): bool => $line['type'] === 'Credit'));
    return [
        'id' => $id, 'journalNumber' => max(1, (int) substr($data['date'], 0, 4) - 2025),
        'date' => $data['date'], 'ref' => $data['reference'], 'title' => $data['title'],
        'lines' => $lines,
        'debitAcc' => $debits[0]['accountTitle'], 'debitCode' => $debits[0]['accountCode'],
        'debitAmount' => array_sum(array_column($debits, 'amount')),
        'creditAcc' => $credits[0]['accountTitle'], 'creditCode' => $credits[0]['accountCode'],
        'creditAmount' => array_sum(array_column($credits, 'amount')),
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
        "SELECT id, journal_number AS journalNumber, DATE_FORMAT(entry_date, '%Y-%m-%d') AS date,
                reference_number AS ref, title, explanation
         FROM journal_entries WHERE status = 'POSTED' ORDER BY entry_date, id"
    )->fetchAll();
    $entryIndex = [];
    foreach ($entries as &$entry) {
        $entry['id'] = (int) $entry['id'];
        $entry['journalNumber'] = max(1, (int) substr($entry['date'], 0, 4) - 2025);
        $entry['lines'] = [];
        $entry['debitAmount'] = 0.0;
        $entry['creditAmount'] = 0.0;
        $entryIndex[$entry['id']] = &$entry;
    }
    unset($entry);
    $lines = $pdo->query(
        "SELECT jl.journal_entry_id, jl.line_type AS type, a.code AS accountCode,
                a.title AS accountTitle, jl.amount
         FROM journal_lines jl
         JOIN journal_entries je ON je.id = jl.journal_entry_id
         JOIN accounts a ON a.id = jl.account_id
         WHERE je.status = 'POSTED'
         ORDER BY jl.journal_entry_id, FIELD(jl.line_type, 'Debit', 'Credit'), jl.id"
    )->fetchAll();
    foreach ($lines as $line) {
        $entry = &$entryIndex[(int) $line['journal_entry_id']];
        $line['amount'] = (float) $line['amount'];
        unset($line['journal_entry_id']);
        $entry['lines'][] = $line;
        if ($line['type'] === 'Debit') {
            $entry['debitAcc'] ??= $line['accountTitle'];
            $entry['debitCode'] ??= $line['accountCode'];
            $entry['debitAmount'] += $line['amount'];
        } else {
            $entry['creditAcc'] ??= $line['accountTitle'];
            $entry['creditCode'] ??= $line['accountCode'];
            $entry['creditAmount'] += $line['amount'];
        }
        unset($entry);
    }
    unset($entryIndex);

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

    $data = validatedTransaction($payload, $pdo, $method === 'PUT' ? $id : null);
    if (count($data['lines']) > 2) {
        $detail = 'Compound entry: ' . $data['explanation'];
    } else {
        $debitLine = $data['lines'][0]['type'] === 'Debit' ? $data['lines'][0] : $data['lines'][1];
        $creditLine = $data['lines'][0]['type'] === 'Credit' ? $data['lines'][0] : $data['lines'][1];
        $detail = $data['accounts'][$debitLine['accountCode']]['title'] . ' / ' . $data['accounts'][$creditLine['accountCode']]['title'];
    }

    $pdo->beginTransaction();
    if ($method === 'POST') {
        $counter = $pdo->query('SELECT next_number FROM journal_number_counter WHERE id = 1 FOR UPDATE');
        $journalNumber = (int) $counter->fetchColumn();
        if ($journalNumber <= 0) throw new RuntimeException('Journal numbering is not initialized.');
        $pdo->prepare('UPDATE journal_number_counter SET next_number = next_number + 1 WHERE id = 1')->execute();
        $statement = $pdo->prepare(
            'INSERT INTO journal_entries (journal_number, entry_date, reference_number, title, explanation, created_by) VALUES (?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([$journalNumber, $data['date'], $data['reference'], $data['title'], $data['explanation'], currentUser()['fullName'] ?? 'System User']);
        $id = (int) $pdo->lastInsertId();
    } else {
        $statement = $pdo->prepare('SELECT status, journal_number FROM journal_entries WHERE id = ? FOR UPDATE');
        $statement->execute([$id]);
        $existing = $statement->fetch();
        if (!$existing || $existing['status'] !== 'POSTED') {
            $pdo->rollBack();
            respond(['error' => 'This journal entry is no longer available.'], 404);
        }
        $journalNumber = (int) $existing['journal_number'];
        $pdo->prepare('UPDATE journal_entries SET entry_date = ?, reference_number = ?, title = ?, explanation = ? WHERE id = ?')
            ->execute([$data['date'], $data['reference'], $data['title'], $data['explanation'], $id]);
    }

    $lineStatement = $pdo->prepare(
        'INSERT INTO journal_lines (journal_entry_id, account_id, line_type, amount) VALUES (?, ?, ?, ?)'
    );
    if ($method === 'PUT') $pdo->prepare('DELETE FROM journal_lines WHERE journal_entry_id = ?')->execute([$id]);
    foreach ($data['lines'] as $line) {
        $lineStatement->execute([$id, $data['accounts'][$line['accountCode']]['id'], $line['type'], $line['amount']]);
    }

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

