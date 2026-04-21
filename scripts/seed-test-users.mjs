import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Add it to GitHub Secrets: Settings → Secrets → Actions → New repository secret.')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

const ownerHash = await bcrypt.hash('admin123', 12)
await sql`
  INSERT INTO users (id, username, password_hash, role)
  VALUES (gen_random_uuid(), 'huuvy', ${ownerHash}, 'owner')
  ON CONFLICT (username) DO UPDATE SET password_hash = ${ownerHash}, role = 'owner'
`
console.log('✓ Owner seeded: huuvy')

const memberHash = await bcrypt.hash('member123', 12)
await sql`
  INSERT INTO users (id, username, password_hash, role)
  VALUES (gen_random_uuid(), 'testmember', ${memberHash}, 'member')
  ON CONFLICT (username) DO UPDATE SET password_hash = ${memberHash}, role = 'member'
`
console.log('✓ Member seeded: testmember')
