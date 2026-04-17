import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL)
const hash = await bcrypt.hash('admin123', 12)

await sql`
  INSERT INTO users (id, username, password_hash, role)
  VALUES (gen_random_uuid(), 'huuvy', ${hash}, 'owner')
  ON CONFLICT (username) DO UPDATE SET password_hash = ${hash}
`
console.log('✓ User created: huuvy / admin123')
