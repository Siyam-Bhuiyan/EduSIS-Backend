// src/controllers/calendar.controller.js
import { getPool } from "../config/db.js";

// Utility: parse date range; default next 30 days
function rangeFromQuery(q) {
  const from = q.from ? new Date(q.from) : new Date();
  const to   = q.to   ? new Date(q.to)   : new Date(Date.now() + 30*24*60*60*1000);
  return { from, to };
}

// Event shape:
// { type: 'class'|'assignment_due', id, course_id, course_title, course_code, title, start_at, end_at?, meta }
export async function myEvents(req, res) {
  const { from, to } = rangeFromQuery(req.query);
  const pool = getPool();
  const user = req.user;

  // classes depending on role
  let classRows = [];
  if (user.role === "student") {
    [classRows] = await pool.query(
      `SELECT oc.id, oc.course_id, oc.title, oc.start_at, oc.end_at, c.title AS course_title, c.code AS course_code
       FROM enrollments e
       JOIN online_classes oc ON oc.course_id = e.course_id
       JOIN courses c ON c.id = oc.course_id
       WHERE e.student_id = ? AND e.status='enrolled' AND oc.start_at BETWEEN ? AND ?
       ORDER BY oc.start_at ASC`,
      [user.id, from, to]
    );
  } else if (user.role === "teacher") {
    [classRows] = await pool.query(
      `SELECT oc.id, oc.course_id, oc.title, oc.start_at, oc.end_at, c.title AS course_title, c.code AS course_code
       FROM course_teachers ct
       JOIN online_classes oc ON oc.course_id = ct.course_id
       JOIN courses c ON c.id = oc.course_id
       WHERE ct.teacher_id = ? AND oc.start_at BETWEEN ? AND ?
       ORDER BY oc.start_at ASC`,
      [user.id, from, to]
    );
  } else {
    [classRows] = await pool.query(
      `SELECT oc.id, oc.course_id, oc.title, oc.start_at, oc.end_at, c.title AS course_title, c.code AS course_code
       FROM online_classes oc
       JOIN courses c ON c.id = oc.course_id
       WHERE oc.start_at BETWEEN ? AND ?
       ORDER BY oc.start_at ASC`,
      [from, to]
    );
  }

  // assignment due dates
  let asgRows = [];
  if (user.role === "student") {
    [asgRows] = await pool.query(
      `SELECT a.id, a.course_id, a.title, a.due_at, c.title AS course_title, c.code AS course_code
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = ? AND e.status='enrolled'
       WHERE a.due_at IS NOT NULL AND a.due_at BETWEEN ? AND ?
       ORDER BY a.due_at ASC`,
      [user.id, from, to]
    );
  } else if (user.role === "teacher") {
    [asgRows] = await pool.query(
      `SELECT a.id, a.course_id, a.title, a.due_at, c.title AS course_title, c.code AS course_code
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       JOIN course_teachers ct ON ct.course_id = a.course_id AND ct.teacher_id = ?
       WHERE a.due_at IS NOT NULL AND a.due_at BETWEEN ? AND ?
       ORDER BY a.due_at ASC`,
      [user.id, from, to]
    );
  } else {
    [asgRows] = await pool.query(
      `SELECT a.id, a.course_id, a.title, a.due_at, c.title AS course_title, c.code AS course_code
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.due_at IS NOT NULL AND a.due_at BETWEEN ? AND ?
       ORDER BY a.due_at ASC`,
      [from, to]
    );
  }

  const events = [
    ...classRows.map(r => ({
      type: "class",
      id: r.id,
      course_id: r.course_id,
      course_title: r.course_title,
      course_code: r.course_code,
      title: r.title,
      start_at: r.start_at,
      end_at: r.end_at ?? null
    })),
    ...asgRows.map(r => ({
      type: "assignment_due",
      id: r.id,
      course_id: r.course_id,
      course_title: r.course_title,
      course_code: r.course_code,
      title: `Due: ${r.title}`,
      start_at: r.due_at,   // the due date/time
      end_at: null
    }))
  ].sort((a,b) => new Date(a.start_at) - new Date(b.start_at));

  res.json({ from, to, events });
}
