// src/models/message.model.js
import { getPool } from "../config/db.js";

export async function listMessages(course_id, { page=1, limit=30, before_id, after_id }) {
  const offset = (page - 1) * limit;
  const params = [course_id];
  let where = "WHERE m.course_id = ?";

  if (before_id) { where += " AND m.id < ?"; params.push(Number(before_id)); }
  if (after_id)  { where += " AND m.id > ?"; params.push(Number(after_id)); }

  const [rows] = await getPool().query(
    `SELECT m.id, m.course_id, m.sender_id, u.full_name AS sender_name, u.role AS sender_role,
            m.body, m.attachment_url, m.reply_to, m.created_at, m.updated_at
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     ${where}
     ORDER BY m.id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  // total not needed for chat; return next cursors instead
  return rows;
}

export async function createMessage(course_id, sender_id, { body, attachment_url, reply_to }) {
  const [r] = await getPool().query(
    `INSERT INTO messages (course_id, sender_id, body, attachment_url, reply_to)
     VALUES (?,?,?,?,?)`,
    [course_id, sender_id, body || null, attachment_url || null, reply_to || null]
  );
  return getMessageById(r.insertId);
}

export async function getMessageById(id) {
  const [rows] = await getPool().query(
    `SELECT m.id, m.course_id, m.sender_id, u.full_name AS sender_name, u.role AS sender_role,
            m.body, m.attachment_url, m.reply_to, m.created_at, m.updated_at
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function updateMessage(id, sender_id, fields, privileged=false) {
  // owner can edit; teachers/admin can edit anyone if privileged=true
  const params = [], sets = [];
  if (fields.body !== undefined) { sets.push("body=?"); params.push(fields.body || null); }
  if (fields.attachment_url !== undefined) { sets.push("attachment_url=?"); params.push(fields.attachment_url || null); }
  if (!sets.length) return getMessageById(id);

  if (privileged) {
    params.push(id);
    await getPool().query(`UPDATE messages SET ${sets.join(",")} WHERE id = ?`, params);
  } else {
    params.push(id, sender_id);
    await getPool().query(`UPDATE messages SET ${sets.join(",")} WHERE id = ? AND sender_id = ?`, params);
  }
  return getMessageById(id);
}

export async function deleteMessage(id, sender_id, privileged=false) {
  if (privileged) {
    await getPool().query(`DELETE FROM messages WHERE id = ?`, [id]);
  } else {
    await getPool().query(`DELETE FROM messages WHERE id = ? AND sender_id = ?`, [id, sender_id]);
  }
}

export async function markRead(message_id, user_id) {
  await getPool().query(
    `INSERT INTO message_reads (message_id, user_id) VALUES (?,?)
     ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
    [message_id, user_id]
  );
}

export async function readers(message_id) {
  const [rows] = await getPool().query(
    `SELECT mr.user_id, u.full_name, u.role, mr.read_at
     FROM message_reads mr
     JOIN users u ON u.id = mr.user_id
     WHERE mr.message_id = ?
     ORDER BY mr.read_at DESC`,
    [message_id]
  );
  return rows;
}
