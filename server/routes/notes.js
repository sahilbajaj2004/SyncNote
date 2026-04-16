const express = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All note routes require authentication
router.use(authMiddleware);

// CREATE a new note
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    const note = new Note({
      title: title || "Untitled Note",
      owner: req.userId, // The logged-in user
    });

    await note.save();

    res.status(201).json({
      message: "Note created",
      note,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ all notes for the logged-in user
router.get("/", async (req, res) => {
  try {
    // Get notes where user is the owner OR a collaborator
    const notes = await Note.find({
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    })
      .populate("owner", "name email") // Include owner's name and email
      .populate("collaborators", "name email");

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ a single note by ID
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("owner", "name email")
      .populate("collaborators", "name email");

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if user has access (owner or collaborator)
    const hasAccess =
      note.owner._id.toString() === req.userId ||
      note.collaborators.some((col) => col._id.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: "You don't have access to this note" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE note content
router.put("/:id", async (req, res) => {
  try {
    const { content, title } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Only owner or collaborators can edit
    const hasAccess =
      note.owner.toString() === req.userId ||
      note.collaborators.some((col) => col.toString() === req.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: "You don't have permission to edit" });
    }

    if (content !== undefined) note.content = content;
    if (title !== undefined) note.title = title;

    await note.save();

    res.json({
      message: "Note updated",
      note,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Only owner can delete
    if (note.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "Only owner can delete this note" });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD a collaborator to a note
router.post("/:id/collaborators", async (req, res) => {
  try {
    const { collaboratorEmail } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Only owner can add collaborators
    if (note.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "Only owner can add collaborators" });
    }

    const collaborator = await User.findOne({ email: collaboratorEmail });
    if (!collaborator) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already a collaborator
    if (note.collaborators.includes(collaborator._id)) {
      return res.status(400).json({ error: "Already a collaborator" });
    }

    note.collaborators.push(collaborator._id);
    await note.save();

    res.json({
      message: "Collaborator added",
      note: await note.populate("collaborators", "name email"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;