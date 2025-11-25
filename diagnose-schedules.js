#!/usr/bin/env node

/**
 * Script de diagnóstico y limpieza de BD
 * Revisa integridad de student_schedules
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
    console.log('\n🔍 Diagnóstico de Horarios de Estudiantes\n');

    await client.connect();

    // 1. Verificar inscripciones
    console.log('1️⃣  Total de inscripciones:');
    const enrollments = await client.query(`
      SELECT COUNT(*) as total FROM enrollments
    `);
    console.log(`   ${enrollments.rows[0].total} inscripciones\n`);

    // 2. Verificar horarios
    console.log('2️⃣  Total de horarios:');
    const schedules = await client.query(`
      SELECT COUNT(*) as total FROM schedules
    `);
    console.log(`   ${schedules.rows[0].total} horarios\n`);

    // 3. Verificar student_schedules
    console.log('3️⃣  Total de student_schedules:');
    const studentSchedules = await client.query(`
      SELECT COUNT(*) as total FROM student_schedules
    `);
    console.log(`   ${studentSchedules.rows[0].total} registros\n`);

    // 4. Verificar estudiantes sin horarios pero inscritos
    console.log('4️⃣  Estudiantes inscritos pero sin horarios asignados:');
    const studentsWithoutSchedules = await client.query(`
      SELECT DISTINCT e.student_id, e.course_id
      FROM enrollments e
      LEFT JOIN student_schedules ss ON e.student_id = ss.student_id AND e.course_id = ss.course_id
      WHERE ss.id IS NULL
      LIMIT 5
    `);
    console.log(`   ${studentsWithoutSchedules.rows.length} casos encontrados`);
    
    if (studentsWithoutSchedules.rows.length > 0) {
      console.log('\n   ⚠️  Primer caso:');
      const example = studentsWithoutSchedules.rows[0];
      console.log(`   Student ID: ${example.student_id}`);
      console.log(`   Course ID: ${example.course_id}`);

      // Verificar si hay horarios para ese curso
      const courseSchedules = await client.query(`
        SELECT COUNT(*) as total FROM schedules WHERE course_id = $1
      `, [example.course_id]);
      console.log(`   Horarios para el curso: ${courseSchedules.rows[0].total}`);
    }

    // 5. Integridad referencial
    console.log('\n5️⃣  Verificando integridad referencial:');
    
    // schedules sin course
    const orphanedSchedules = await client.query(`
      SELECT COUNT(*) as total FROM schedules WHERE course_id NOT IN (SELECT id FROM courses)
    `);
    console.log(`   Horarios huérfanos: ${orphanedSchedules.rows[0].total}`);

    // enrollments sin course
    const orphanedEnrollments = await client.query(`
      SELECT COUNT(*) as total FROM enrollments WHERE course_id NOT IN (SELECT id FROM courses)
    `);
    console.log(`   Inscripciones huérfanas: ${orphanedEnrollments.rows[0].total}`);

    // student_schedules sin schedule
    const orphanedStudentSchedules = await client.query(`
      SELECT COUNT(*) as total FROM student_schedules WHERE schedule_id NOT IN (SELECT id FROM schedules)
    `);
    console.log(`   Student schedules huérfanos: ${orphanedStudentSchedules.rows[0].total}\n`);

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
