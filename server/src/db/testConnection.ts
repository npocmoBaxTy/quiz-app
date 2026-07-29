import { pool } from "./db.js"

export async function testDB() {
  const res = await pool.query("SELECT * from users")
  console.log("DB connected:", res.rows[0])
}