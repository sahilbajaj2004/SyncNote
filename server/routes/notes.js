const express = require("express");
const Note = require("../models/Note");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// GET /api/notes - gets all notes for user
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ owner: req.userId }, { collaborators: req.userId }]
    })
    .populate("collaborators", "name email")
    .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// POST /api/notes - create new note
router.post("/", async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title || "Untitled Note",
      owner: req.userId,
    });
    await note.save();
    res.status(201).json({ note });
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

// GET /api/notes/:id - get specific note
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate("collaborators", "name email")
      .populate("owner", "name email");
      
    if (!note) return res.status(404).json({ error: "Note not found" });
    
    // allow access if owner or collaborator
    if (note.owner._id.toString() !== req.userId && !note.collaborators.some(c => c._id.toString() === req.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// PUT /api/notes/:id - update note
router.put("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    
    // allow access if owner or collaborator
    if (note.owner.toString() !== req.userId && !note.collaborators.some(c => c.toString() === req.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    if (req.body.title !== undefined) note.title = req.body.title;
    if (req.body.content !== undefined) note.content = req.body.content;
    
    await note.save();
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// DELETE /api/notes/:id - delete note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    
    if (note.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "Only the owner can delete this note." });
    }
    
    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// POST /api/notes/:id/collaborators - add collaborator
router.post("/:id/collaborators", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    
    if (note.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "Only the owner can add collaborators." });
    }
    
    const collabUser = await User.findOne({ email: req.body.collaboratorEmail.toLowerCase() });
    if (!collabUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (collabUser._id.toString() === req.userId) {
      return res.status(400).json({ error: "You cannot add yourself as a collaborator" });
    }
    
    if (note.collaborators.includes(collabUser._id)) {
      return res.status(400).json({ error: "User is already a collaborator" });
    }
    
    note.collaborators.push(collabUser._id);
    await note.save();
    
    await note.populate("collaborators", "name email");
    res.json({ message: "Collaborator added successfully", note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add collaborator" });
  }
});

module.exports = router;