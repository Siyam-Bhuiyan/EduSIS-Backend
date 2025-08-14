// src/controllers/announcement.controller.js
import {
  createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getAnnouncementById, listAnnouncements
} from "../models/announcement.model.js";
import {
  createAnnouncementSchema, updateAnnouncementSchema, listAnnouncementsSchema
} from "../validators/announcement.validators.js";

function audienceForRole(role) {
  // what the caller is allowed to see by "visible_to"
  if (role === "student") return ["all","students"];
  if (role === "teacher") return ["all","teachers"];
  return ["all","students","teachers"]; // admin
}

export async function create(req, res) {
  const { value, error } = createAnnouncementSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const row = await createAnnouncement({ ...value, created_by: req.user.id });
  res.status(201).json(row);
}

export async function update(req, res) {
  const a = await getAnnouncementById(req.params.id);
  if (!a) return res.status(404).json({ message: "Announcement not found" });
  if (req.user.role !== "admin" && a.created_by !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { value, error } = updateAnnouncementSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const upd = await updateAnnouncement(req.params.id, value);
  res.json(upd);
}

export async function remove(req, res) {
  const a = await getAnnouncementById(req.params.id);
  if (!a) return res.status(404).json({ message: "Announcement not found" });
  if (req.user.role !== "admin" && a.created_by !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await deleteAnnouncement(req.params.id);
  res.status(204).send();
}

export async function getOne(req, res) {
  const a = await getAnnouncementById(req.params.id);
  if (!a) return res.status(404).json({ message: "Announcement not found" });
  // basic audience filter on read as well
  const allowed = audienceForRole(req.user.role);
  if (!allowed.includes(a.visible_to)) return res.status(403).json({ message: "Forbidden" });
  res.json(a);
}

export async function list(req, res) {
  const { value, error } = listAnnouncementsSchema.validate(req.query, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const data = await listAnnouncements({
    course_id: value.course_id,
    page: value.page,
    limit: value.limit,
    audienceFilter: audienceForRole(req.user.role)
  });
  res.json(data);
}
