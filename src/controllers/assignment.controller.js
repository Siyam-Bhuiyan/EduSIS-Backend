// src/controllers/assignment.controller.js
import {
  createAssignment, updateAssignment, deleteAssignment, getAssignmentById, listAssignments,
  submitAssignment, listSubmissions, getMySubmission,
  gradeSubmission, getGrade, listMyGrades
} from "../models/assignment.model.js";
import {
  createAssignmentSchema, updateAssignmentSchema, submitSchema, gradeSchema
} from "../validators/assignment.validators.js";

export async function create(req, res) {
  const { value, error } = createAssignmentSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const assignment = await createAssignment({ ...value, created_by: req.user.id });
  res.status(201).json(assignment);
}

export async function update(req, res) {
  const { value, error } = updateAssignmentSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const a = await updateAssignment(req.params.id, value);
  if (!a) return res.status(404).json({ message: "Assignment not found" });
  res.json(a);
}

export async function remove(req, res) {
  await deleteAssignment(req.params.id);
  res.status(204).send();
}

export async function getOne(req, res) {
  const a = await getAssignmentById(req.params.id);
  if (!a) return res.status(404).json({ message: "Assignment not found" });

  // include my submission & grade if student calls
  let my_submission = null, my_grade = null;
  if (req.user.role === "student") {
    my_submission = await getMySubmission(a.id, req.user.id);
    my_grade = await getGrade(a.id, req.user.id);
  }
  res.json({ ...a, my_submission, my_grade });
}

export async function list(req, res) {
  const { course_id, page = 1, limit = 20 } = req.query;
  const data = await listAssignments({
    course_id: course_id ? Number(course_id) : undefined,
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 20, 100)
  });
  res.json(data);
}

export async function submit(req, res) {
  const { value, error } = submitSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const assignment_id = Number(req.params.id);
  await submitAssignment({ assignment_id, student_id: req.user.id, ...value });
  const sub = await getMySubmission(assignment_id, req.user.id);
  res.status(201).json(sub);
}

export async function submissions(req, res) {
  const rows = await listSubmissions(req.params.id);
  res.json(rows);
}

export async function grade(req, res) {
  const { value, error } = gradeSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ message: "Validation failed", details: error.details });
  const assignment_id = Number(req.params.id);
  const student_id = Number(req.params.student_id);
  await gradeSubmission({ assignment_id, student_id, ...value, graded_by: req.user.id });
  const g = await getGrade(assignment_id, student_id);
  res.status(201).json(g);
}

export async function myGrades(req, res) {
  const rows = await listMyGrades(req.user.id);
  res.json(rows);
}
