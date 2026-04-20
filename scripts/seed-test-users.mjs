import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL)

const ownerHash = await bcrypt.hash('admin123', 12)
await sql`
  INSERT INTO users (id, username, password_hash, role)
  VALUES (gen_random_uuid(), 'huuvy', ${ownerHash}, 'owner')
  ON CONFLICT (username) DO UPDATE SET password_hash = ${ownerHash}, role = 'owner'
`
console.log('✓ Owner: huuvy / admin123')

const memberHash = await bcrypt.hash('member123', 12)
await sql`
  INSERT INTO users (id, username, password_hash, role)
  VALUES (gen_random_uuid(), 'testmember', ${memberHash}, 'member')
  ON CONFLICT (username) DO UPDATE SET password_hash = ${memberHash}, role = 'member'
`
console.log('✓ Member: testmember / member123')
