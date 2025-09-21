module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'feat',     // Nouvelle fonctionnalité
          'fix',      // Correction de bug
          'docs',     // Documentation
          'style',    // Formatage, point-virgule manquant, etc
          'refactor', // Refactorisation du code
          'perf',     // Amélioration des performances
          'test',     // Ajout de tests
          'build',    // Changements système de build
          'ci',       // Changements CI/CD
          'chore',    // Autres changements
          'revert',   // Revert d'un commit
        ],
      ],
      'scope-enum': [
        2,
        'always',
        [
          'web',
          'admin',
          'mobile',
          'ui',
          'auth',
          'fmpa',
          'messages',
          'api',
          'db',
          'infra',
          'deps',
          'config',
          'docs',
        ],
      ],
    },
  }