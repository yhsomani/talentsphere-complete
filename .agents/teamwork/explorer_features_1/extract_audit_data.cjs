const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../../..');

// 1. Read FEATURE_REGISTRY.md to extract all features F-01 through F-173
const featureRegistryPath = path.join(repoRoot, 'docs/registries/FEATURE_REGISTRY.md');
const registryContent = fs.readFileSync(featureRegistryPath, 'utf8');

const featureRegex = /\|\s*(F-\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
let match;
const features = [];
while ((match = featureRegex.exec(registryContent)) !== null) {
  features.push({
    id: match[1].trim(),
    name: match[2].trim(),
    category: match[3].trim(),
    priority: parseInt(match[4].trim(), 10),
    phase: match[5].trim(),
    dependencies: match[6].trim()
  });
}

console.log(`Extracted ${features.length} features from FEATURE_REGISTRY.md`);

// 2. Extract routes from server.ts
const serverTsPath = path.join(repoRoot, 'apps/api/src/server.ts');
const serverContent = fs.readFileSync(serverTsPath, 'utf8');

const routeRegex = /app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g;
const routes = [];
while ((match = routeRegex.exec(serverContent)) !== null) {
  routes.push({
    method: match[1].toUpperCase(),
    path: match[2],
    full: `${match[1].toUpperCase()} ${match[2]}`
  });
}

console.log(`Extracted ${routes.length} routes from server.ts`);

// 3. Extract DURABLE_ROUTES from durability.ts
const durabilityTsPath = path.join(repoRoot, 'apps/api/src/durability.ts');
const durabilityContent = fs.readFileSync(durabilityTsPath, 'utf8');
const durableRouteRegex = /'([A-Z]+\s+[^']+)'/g;
const durableRoutes = new Set();
while ((match = durableRouteRegex.exec(durabilityContent)) !== null) {
  durableRoutes.add(match[1]);
}
console.log(`Extracted ${durableRoutes.size} routes from durability.ts`);

// 4. List migrations
const migrationsDir = path.join(repoRoot, 'supabase/migrations');
const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
console.log(`Found ${migrations.length} migrations`);

// 5. List domain files
const domainDir = path.join(repoRoot, 'packages/domain/src');
const domainFiles = fs.readdirSync(domainDir).filter(f => f.endsWith('.ts'));
console.log(`Found ${domainFiles.length} domain source files`);

// 6. List web pages and components
const webPagesDir = path.join(repoRoot, 'apps/web/src/pages');
const webPages = fs.existsSync(webPagesDir) ? fs.readdirSync(webPagesDir) : [];
const webComponentsDir = path.join(repoRoot, 'apps/web/src/components');
const webComponents = fs.existsSync(webComponentsDir) ? fs.readdirSync(webComponentsDir) : [];

// Save intermediate dump
fs.writeFileSync(
  path.join(__dirname, 'features_raw.json'),
  JSON.stringify({ features, routes, durableRoutes: Array.from(durableRoutes), migrations, domainFiles, webPages, webComponents }, null, 2)
);

console.log('Saved features_raw.json successfully');
