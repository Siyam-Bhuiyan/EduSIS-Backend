// src/models/announcement.model.js
import { getPool } from "../config/db.js";

export async function createAnnouncement(data) {
  const [r] = await getPool().query(
    `INSERT INTO announcements (course_id, title, body, visible_to, pinned, created_by)
     VALUES (?,?,?,?,?,?)`,
    [data.course_id ?? null, data.title, data.body ?? null, data.visible_to, data.pinned ? 1 : 0, data.created_by ?? null]
  );
  return getAnnouncementById(r.insertId);
}

export async function updateAnnouncement(id, fields) {
  const sets = [], params = [];
  for (const k of ["course_id","title","body","visible_to","pinned"]) {
    if (fields[k] !== undefined) { sets.push(`${k} = ?`); params.push(k === "pinned" ? (fields[k] ? 1 : 0) : (fields[k] ?? null)); }
  }
  if (!sets.length) return getAnnouncementById(id);
  params.push(id);
  await getPool().query(`UPDATE announcements SET ${sets.join(", ")} WHERE id = ?`, params);
  return getAnnouncementById(id);
}

export async function deleteAnnouncement(id) {
  await getPool().query("DELETE FROM announcements WHERE id = ?", [id]);
}

export async function getAnnouncementById(id) {
  const [rows] = await getPool().query(
    `SELECT a.*, c.title AS course_title, c.code AS course_code
     FROM announcements a
     LEFT JOIN courses c ON c.id = a.course_id
     WHERE a.id = ?`, [id]
  );
  return rows[0] || null;
}

export async function listAnnouncements({ course_id, page=1, limit=20, audienceFilter }) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "WHERE 1=1";
  if (course_id) { where += " AND a.course_id = ?"; params.push(Number(course_id)); }
  if (audienceFilter) { where += " AND a.visible_to IN (?)"; params.push(audienceFilter); }

  const [rows] = await getPool().query(
    `SELECT a.id, a.course_id, a.title, a.visible_to, a.pinned, a.created_at,
            c.title AS course_title, c.code AS course_code
     FROM announcements a
     LEFT JOIN courses c ON c.id = a.course_id
     ${where}
     ORDER BY a.pinned DESC, a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ count }]] = await getPool().query(
    `SELECT COUNT(*) AS count FROM announcements a ${where}`, params
  );
  return { rows, count, page, limit };
}
