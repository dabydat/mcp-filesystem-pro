export const PROJECT_TOOL_NAMES = {
  DETECT_STACK: 'detect_stack',
  FIND_CONFIG_FILES: 'find_config_files',
  PROJECT_SUMMARY: 'project_summary',
  READ_AGENTS_MD: 'read_agents_md',
} as const;

export type ProjectToolName = typeof PROJECT_TOOL_NAMES[keyof typeof PROJECT_TOOL_NAMES];

export const PROJECT_MESSAGES = {
  NO_AGENTS_MD: 'No AGENTS.md found in project root',
  AGENTS_MD_EXISTS: 'AGENTS.md found',
} as const;

export type ProjectMessage = typeof PROJECT_MESSAGES[keyof typeof PROJECT_MESSAGES];

export const CONFIG_FILE_TYPES = {
  ALL: 'all',
  ESLINT: 'eslint',
  PRETTIER: 'prettier',
  TSCONFIG: 'tsconfig',
  DOCKER: 'docker',
  GIT: 'git',
} as const;

export type ConfigFileType = typeof CONFIG_FILE_TYPES[keyof typeof CONFIG_FILE_TYPES];
