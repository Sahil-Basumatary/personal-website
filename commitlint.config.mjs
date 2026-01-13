export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'wip',
        'chore',
        'docs',
        'test',
        'perf',
        'security',
        'ci',
        'revert',
      ],
    ],
  },
};
