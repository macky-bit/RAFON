/* Fetches a PHP-rendered view partial from components/<name>.php.
   The path is relative to index.php, not to this file. */
const cache = {};

export async function loadTemplate(name) {
    if (cache[name]) return cache[name];
    const res = await fetch(`components/${name}.php`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load template "${name}" (${res.status})`);
    cache[name] = await res.text();
    return cache[name];
}
