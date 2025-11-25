#!/usr/bin/env node

/**
 * Script para inicializar y verificar el módulo de horarios
 * Uso: node verify-schedules.js
 */

require('dotenv').config();
const { Client } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function main() {
  const client = new Client(dbConfig);

  try {
    console.log('\n🔍 Verificando configuración de horarios...\n');

    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // 1. Verificar tabla schedules
    console.log('1️⃣  Verificando tabla schedules...');
    const schedlesExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'schedules'
      );
    `);

    if (schedlesExists.rows[0].exists) {
      console.log('   ✅ Tabla schedules existe\n');

      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'schedules'
        ORDER BY ordinal_position
      `);

      console.log('   Estructura:');
      columns.rows.forEach(col => {
        console.log(`     - ${col.column_name}: ${col.data_type}`);
      });
      console.log('');
    } else {
      console.log('   ❌ Tabla schedules NO existe\n');
    }

    // 2. Verificar tabla student_schedules
    console.log('2️⃣  Verificando tabla student_schedules...');
    const studentSchedulesExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'student_schedules'
      );
    `);

    if (studentSchedulesExists.rows[0].exists) {
      console.log('   ✅ Tabla student_schedules existe\n');
    } else {
      console.log('   ❌ Tabla student_schedules NO existe\n');
    }

    // 3. Verificar datos en schedules
    console.log('3️⃣  Verificando datos en schedules...');
    const schedulesData = await client.query(`
      SELECT COUNT(*) as total FROM schedules
    `);

    const totalSchedules = schedulesData.rows[0].total;
    console.log(`   Total de horarios: ${totalSchedules}\n`);

    if (totalSchedules > 0) {
      console.log('   Primeros 5 horarios:');
      const samples = await client.query(`
        SELECT 
          s.id,
          c.name as course_name,
          s.day_of_week,
          s.start_time,
          s.end_time
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        LIMIT 5
      `);

      samples.rows.forEach((row, idx) => {
        console.log(`     ${idx + 1}. ${row.course_name} - ${row.day_of_week} ${row.start_time}-${row.end_time}`);
      });
      console.log('');
    }

    // 4. Verificar cursos
    console.log('4️⃣  Verificando cursos...');
    const coursesData = await client.query(`
      SELECT COUNT(*) as total FROM courses
    `);

    console.log(`   Total de cursos: ${coursesData.rows[0].total}\n`);

    // 5. Resumen
    console.log('📊 Resumen:');
    console.log(`   - Horarios registrados: ${totalSchedules}`);
    console.log(`   - Cursos registrados: ${coursesData.rows[0].total}`);

    if (totalSchedules === 0 && coursesData.rows[0].total > 0) {
      console.log('\n   ⚠️  Tienes cursos pero SIN horarios.');
      console.log('   Accede a: http://localhost:3000/api/setup/init');
      console.log('   para regenerar los horarios.\n');
    } else if (totalSchedules > 0) {
      console.log('\n   ✅ Todo parece estar correctamente configurado.\n');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
