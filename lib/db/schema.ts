import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['owner', 'member'])
export const projectRoleEnum = pgEnum('project_role', ['admin', 'member', 'viewer'])
export const runStatusEnum = pgEnum('run_status', ['pending', 'running', 'passed', 'failed', 'error'])
export const runEnvEnum = pgEnum('run_env', ['local', 'ci'])
export const testStatusEnum = pgEnum('test_status', ['passed', 'failed', 'skipped', 'flaky'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jiraConfig: text('jira_config'),
  trelloConfig: text('trello_config'),
  ciConfig: text('ci_config'),       // JSON: { provider, owner/host, repo/projectId, workflow, ref, token }
  apiKey: varchar('api_key', { length: 64 }), // dùng cho CI push report (X-Api-Key header)
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const userProjects = pgTable('user_projects', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  role: projectRoleEnum('role').default('member').notNull(),
})

export const testRuns = pgTable('test_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  triggeredBy: uuid('triggered_by').references(() => users.id, { onDelete: 'set null' }),
  env: runEnvEnum('env').default('local').notNull(),
  status: runStatusEnum('status').default('pending').notNull(),
  blobUrl: text('blob_url'),     // Vercel Blob URL cho HTML report
  jsonBlobUrl: text('json_blob_url'), // Vercel Blob URL cho JSON results
  totalTests: varchar('total_tests', { length: 20 }),
  passed: varchar('passed', { length: 20 }),
  failed: varchar('failed', { length: 20 }),
  skipped: varchar('skipped', { length: 20 }),
  durationMs: varchar('duration_ms', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // auto-set to +6 months on insert
})

export const testResults = pgTable('test_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').notNull().references(() => testRuns.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  file: varchar('file', { length: 512 }),
  status: testStatusEnum('status').notNull(),
  durationMs: varchar('duration_ms', { length: 20 }),
  errorMessage: text('error_message'),
  retryCount: varchar('retry_count', { length: 10 }).default('0'),
})
