require('dotenv').config();
const { Client } = require('pg');

const c = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

(async () => {
  try {
    await c.connect();
    
    // Verificar estructura de la tabla
    console.log('\n=== ESTRUCTURA DE LA TABLA schedules ===');
    const structure = await c.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'schedules' 
      ORDER BY ordinal_position
    `);
    console.log(JSON.stringify(structure.rows, null, 2));
    
    // Verificar si existen datos
    console.log('\n=== DATOS EN LA TABLA schedules ===');
    const data = await c.query(`
      SELECT id, course_id, teacher_id, day_of_week, start_time, end_time 
      FROM schedules 
      LIMIT 10
    `);
    console.log('Total de horarios:', data.rows.length);
    console.log(JSON.stringify(data.rows, null, 2));
    
    // Verificar si hay cursos
    console.log('\n=== CURSOS EN LA BD ===');
    const courses = await c.query(`
      SELECT id, name, credits FROM courses LIMIT 5
    `);
    console.log('Total de cursos:', courses.rows.length);
    console.log(JSON.stringify(courses.rows, null, 2));
    
    await c.end();
  } catch (e) {
    console.log('❌ Error:', e.message);
    process.exit(1);
  }
})();
