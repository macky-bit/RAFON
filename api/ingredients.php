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

function cleanText(array $payload, string $key, string $label, int $maxLength): string
{
    $value = trim((string) ($payload[$key] ?? ''));
    if ($value === '') {
        respond(['error' => "{$label} is required."], 422);
    }
    if (mb_strlen($value) > $maxLength) {
        respond(['error' => "{$label} must not exceed {$maxLength} characters."], 422);
    }
    return $value;
}

function nonnegativeNumber(array $payload, string $key, string $label, int $scale): float
{
    if (!isset($payload[$key]) || !is_numeric($payload[$key])) {
        respond(['error' => "{$label} must be a number."], 422);
    }
    $value = round((float) $payload[$key], $scale);
    if ($value < 0) {
        respond(['error' => "{$label} cannot be negative."], 422);
    }
    return $value;
}

function ingredientRecord(array $row): array
{
    return [
        'id' => (int) $row['ingredient_id'],
        'name' => $row['ingredient_name'],
        'category' => $row['category'],
        'supplierId' => $row['supplier_id'] === null ? null : (int) $row['supplier_id'],
        'supplierName' => $row['supplier_name'] ?? '',
        'stock' => (float) $row['stock_quantity'],
        'unit' => $row['unit'],
        'cost' => (float) $row['unit_cost'],
        'reorderLevel' => (float) $row['reorder_level'],
        'imagePath' => $row['image_path'] ?? '',
        'updatedAt' => $row['updated_at'],
    ];
}

function findIngredient(PDO $pdo, int $id): array
{
    $statement = $pdo->prepare(
        'SELECT i.*, s.business_name AS supplier_name
         FROM ingredients i LEFT JOIN suppliers s ON s.id = i.supplier_id
         WHERE i.ingredient_id = ? AND i.deleted_at IS NULL'
    );
    $statement->execute([$id]);
    $ingredient = $statement->fetch();
    if (!$ingredient) {
        respond(['error' => 'Ingredient not found.'], 404);
    }
    return ingredientRecord($ingredient);
}

function validatedIngredient(array $payload): array
{
    $supplierId = (int) ($payload['supplierId'] ?? 0);
    return [
        cleanText($payload, 'name', 'Ingredient name', 100),
        cleanText($payload, 'category', 'Category', 50),
        $supplierId > 0 ? $supplierId : null,
        nonnegativeNumber($payload, 'stock', 'Stock quantity', 3),
        cleanText($payload, 'unit', 'Unit', 20),
        nonnegativeNumber($payload, 'cost', 'Unit cost', 2),
        nonnegativeNumber($payload, 'reorderLevel', 'Reorder level', 3),
    ];
}

function writeIngredientAudit(PDO $pdo, string $action, int $id, string $name): void
{
    $statement = $pdo->prepare(
        'INSERT INTO audit_logs (user_name, action, reference_number, details, status) VALUES (?, ?, ?, ?, ?)'
    );
    $statement->execute(['System User', $action, 'INGREDIENT-' . $id, $name, 'VERIFIED']);
}

try {
    $pdo = Database::connection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'POST' && ($_GET['action'] ?? '') === 'image') {
        $id = (int) ($_POST['id'] ?? 0);
        if ($id <= 0 || !isset($_FILES['image'])) {
            respond(['error' => 'Choose an ingredient and image to upload.'], 422);
        }
        $existing = findIngredient($pdo, $id);
        $image = $_FILES['image'];
        if (($image['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            respond(['error' => 'The image upload did not complete.'], 422);
        }
        if (($image['size'] ?? 0) > 5 * 1024 * 1024) {
            respond(['error' => 'The image must be 5 MB or smaller.'], 422);
        }
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($image['tmp_name']);
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!isset($extensions[$mime])) {
            respond(['error' => 'Upload a JPG, PNG, or WebP image.'], 422);
        }

        $uploadDirectory = __DIR__ . '/../uploads/ingredients';
        if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0755, true)) {
            throw new RuntimeException('The ingredient upload directory could not be created.');
        }
        $filename = $id . '-' . bin2hex(random_bytes(8)) . '.' . $extensions[$mime];
        $destination = $uploadDirectory . '/' . $filename;
        if (!move_uploaded_file($image['tmp_name'], $destination)) {
            throw new RuntimeException('The uploaded image could not be stored.');
        }

        $path = 'uploads/ingredients/' . $filename;
        try {
            $pdo->beginTransaction();
            $statement = $pdo->prepare('UPDATE ingredients SET image_path = ? WHERE ingredient_id = ?');
            $statement->execute([$path, $id]);
            writeIngredientAudit($pdo, 'Updated Ingredient Image', $id, $existing['name']);
            $pdo->commit();
        } catch (Throwable $exception) {
            @unlink($destination);
            throw $exception;
        }

        $oldPath = $existing['imagePath'] ?? '';
        if (str_starts_with($oldPath, 'uploads/ingredients/')) {
            $oldFile = __DIR__ . '/../' . $oldPath;
            if (is_file($oldFile)) @unlink($oldFile);
        }
        respond(['ingredient' => findIngredient($pdo, $id)]);
    }

    if ($method === 'GET') {
        $rows = $pdo->query(
            'SELECT i.*, s.business_name AS supplier_name
             FROM ingredients i LEFT JOIN suppliers s ON s.id = i.supplier_id
             WHERE i.deleted_at IS NULL
             ORDER BY i.ingredient_name ASC, i.ingredient_id DESC'
        )->fetchAll();
        respond(['ingredients' => array_map('ingredientRecord', $rows)]);
    }

    $payload = requestPayload();
    if ($method === 'POST') {
        $values = validatedIngredient($payload);
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'INSERT INTO ingredients
                (ingredient_name, category, supplier_id, stock_quantity, unit, unit_cost, reorder_level)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute($values);
        $id = (int) $pdo->lastInsertId();
        writeIngredientAudit($pdo, 'Created Ingredient', $id, $values[0]);
        $pdo->commit();
        respond(['ingredient' => findIngredient($pdo, $id)], 201);
    }

    $id = (int) ($payload['id'] ?? 0);
    if ($id <= 0) {
        respond(['error' => 'A valid ingredient ID is required.'], 422);
    }
    $existing = findIngredient($pdo, $id);

    if ($method === 'PUT') {
        $values = validatedIngredient($payload);
        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'UPDATE ingredients
             SET ingredient_name = ?, category = ?, supplier_id = ?, stock_quantity = ?, unit = ?, unit_cost = ?, reorder_level = ?
             WHERE ingredient_id = ?'
        );
        $statement->execute([...$values, $id]);
        writeIngredientAudit($pdo, 'Updated Ingredient', $id, $values[0]);
        $pdo->commit();
        respond(['ingredient' => findIngredient($pdo, $id)]);
    }

    if ($method === 'DELETE') {
        $pdo->beginTransaction();
        $statement = $pdo->prepare('UPDATE ingredients SET deleted_at = CURRENT_TIMESTAMP WHERE ingredient_id = ? AND deleted_at IS NULL');
        $statement->execute([$id]);
        writeIngredientAudit($pdo, 'Deleted Ingredient', $id, $existing['name']);
        $pdo->commit();

        respond(['deletedId' => $id]);
    }

    header('Allow: GET, POST, PUT, DELETE');
    respond(['error' => 'Method not allowed.'], 405);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    respond(['error' => 'The ingredient request could not be completed. Run migration 005 first.'], 500);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log($exception->getMessage());
    respond(['error' => 'An unexpected server error occurred.'], 500);
}
