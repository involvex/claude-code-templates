// Parser del CHANGELOG.md de Claude Code

/**
 * Extrae la sección de una versión específica del changelog
 * @param {string} changelog - Contenido completo del CHANGELOG.md
 * @param {string} version - Versión a extraer (ej: "2.0.31")
 * @returns {object} - Información parseada de la versión
 */
export function parseVersionChangelog(changelog, version) {
  // Normalizar versión (remover 'v' si existe)
  const cleanVersion = version.replace(/^v/, '');

  // Buscar el inicio de esta versión
  const versionRegex = new RegExp(`^##\\s+(?:v)?${cleanVersion.replace(/\./g, '\\.')}`, 'm');
  const match = changelog.match(versionRegex);

  if (!match) {
    return {
      version: cleanVersion,
      content: null,
      changes: [],
      error: 'Version not found in changelog',
    };
  }

  // Encontrar el índice de inicio
  const startIndex = match.index;

  // Encontrar el índice de fin (siguiente versión o fin del documento)
  const nextVersionRegex = /^##\s+(?:v)?\d+\.\d+\.\d+/m;
  const remainingChangelog = changelog.substring(startIndex + match[0].length);
  const nextMatch = remainingChangelog.match(nextVersionRegex);

  const endIndex = nextMatch ? startIndex + match[0].length + nextMatch.index : changelog.length;

  // Extraer contenido de esta versión
  const versionContent = changelog.substring(startIndex, endIndex).trim();

  // Parsear los cambios
  const changes = parseChanges(versionContent);

  return {
    version: cleanVersion,
    content: versionContent,
    changes,
    changeCount: changes.length,
  };
}

/**
 * Parsea los cambios individuales de una sección de versión
 * @param {string} content - Contenido de la sección de versión
 * @returns {Array} - Array de cambios parseados
 */
function parseChanges(content) {
  const changes = [];

  // Dividir por líneas
  const lines = content.split('\n');

  let currentCategory = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Ignorar líneas vacías y headers de versión
    if (!trimmed || trimmed.startsWith('##')) {
      continue;
    }

    // Detectar categorías (opcional, por si usan headers)
    if (trimmed.startsWith('###')) {
      currentCategory = trimmed.replace(/^###\s*/, '').trim();
      continue;
    }

    // Detectar bullets de cambios
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const description = trimmed.replace(/^[-*]\s*/, '').trim();

      if (!description) continue;

      // Intentar clasificar el tipo de cambio
      const changeType = classifyChange(description);

      changes.push({
        type: changeType,
        description,
        category: currentCategory || detectCategory(description),
        raw: line,
      });
    }
  }

  return changes;
}

/**
 * Clasifica un cambio por tipo basándose en keywords
 * @param {string} description - Descripción del cambio
 * @returns {string} - Tipo de cambio
 */
function classifyChange(description) {
  const lower = description.toLowerCase();

  // Breaking changes
  if (lower.includes('breaking') || lower.includes('removed') || lower.includes('deprecated')) {
    return 'breaking';
  }

  // Features
  if (
    lower.includes('add') ||
    lower.includes('new') ||
    lower.includes('introduce') ||
    lower.includes('support for') ||
    lower.startsWith('✨') ||
    lower.startsWith('🎉')
  ) {
    return 'feature';
  }

  // Fixes
  if (
    lower.includes('fix') ||
    lower.includes('resolve') ||
    lower.includes('correct') ||
    lower.includes('patch') ||
    lower.startsWith('🐛')
  ) {
    return 'fix';
  }

  // Improvements
  if (
    lower.includes('improve') ||
    lower.includes('enhance') ||
    lower.includes('optimize') ||
    lower.includes('better') ||
    lower.includes('refactor') ||
    lower.startsWith('⚡') ||
    lower.startsWith('♻️')
  ) {
    return 'improvement';
  }

  // Deprecations
  if (lower.includes('deprecate')) {
    return 'deprecation';
  }

  // Performance
  if (lower.includes('performance') || lower.includes('speed') || lower.includes('faster')) {
    return 'performance';
  }

  // Documentation
  if (lower.includes('docs') || lower.includes('documentation')) {
    return 'documentation';
  }

  // Default: other
  return 'other';
}

/**
 * Detecta la categoría de un cambio basándose en keywords
 * @param {string} description - Descripción del cambio
 * @returns {string|null} - Categoría detectada
 */
function detectCategory(description) {
  const lower = description.toLowerCase();

  const categories = {
    'Plugin System': ['plugin', 'plugins', 'marketplace'],
    CLI: ['cli', 'command', 'terminal', 'bash'],
    Performance: ['performance', 'speed', 'faster', 'optimize', 'cache'],
    'UI/UX': ['ui', 'ux', 'interface', 'display', 'output'],
    API: ['api', 'endpoint', 'rest', 'graphql'],
    Models: ['model', 'sonnet', 'opus', 'haiku', 'claude'],
    MCP: ['mcp', 'model context protocol'],
    Agents: ['agent', 'subagent', 'explore'],
    Settings: ['setting', 'config', 'configuration'],
    Hooks: ['hook', 'trigger', 'event'],
    Security: ['security', 'auth', 'authentication', 'permission'],
    Documentation: ['docs', 'documentation', 'readme'],
    Windows: ['windows', 'win32'],
    macOS: ['macos', 'darwin', 'mac'],
    Linux: ['linux', 'unix'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }

  return null;
}

/**
 * Genera un resumen de los cambios
 * @param {Array} changes - Array de cambios
 * @returns {object} - Resumen estadístico
 */
export function generateSummary(changes) {
  const summary = {
    total: changes.length,
    byType: {},
    byCategory: {},
    highlights: [],
  };

  // Contar por tipo
  changes.forEach((change) => {
    summary.byType[change.type] = (summary.byType[change.type] || 0) + 1;

    if (change.category) {
      summary.byCategory[change.category] = (summary.byCategory[change.category] || 0) + 1;
    }

    // Detectar highlights (breaking changes o features importantes)
    if (change.type === 'breaking' || change.type === 'feature') {
      summary.highlights.push(change);
    }
  });

  return summary;
}

/**
 * Formatea los cambios para Discord
 * @param {Array} changes - Array de cambios
 * @param {number} maxLength - Longitud máxima del texto
 * @returns {object} - Cambios agrupados para Discord
 */
export function formatForDiscord(changes, maxLength = 1024) {
  const grouped = {
    features: [],
    fixes: [],
    improvements: [],
    breaking: [],
    other: [],
  };

  // Agrupar cambios
  changes.forEach((change) => {
    switch (change.type) {
      case 'feature':
        grouped.features.push(change.description);
        break;
      case 'fix':
        grouped.fixes.push(change.description);
        break;
      case 'improvement':
      case 'performance':
        grouped.improvements.push(change.description);
        break;
      case 'breaking':
      case 'deprecation':
        grouped.breaking.push(change.description);
        break;
      default:
        grouped.other.push(change.description);
    }
  });

  // Truncar si es necesario
  const truncate = (items, max) => {
    const text = items.map((item) => `• ${item}`).join('\n');
    if (text.length > max) {
      const truncated = text.substring(0, max - 20);
      const lastNewline = truncated.lastIndexOf('\n');
      return truncated.substring(0, lastNewline) + '\n... [Read more in changelog]';
    }
    return text;
  };

  return {
    features: truncate(grouped.features, maxLength),
    fixes: truncate(grouped.fixes, maxLength),
    improvements: truncate(grouped.improvements, maxLength),
    breaking: truncate(grouped.breaking, maxLength),
    other: truncate(grouped.other, maxLength),
  };
}
