import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [collabMessage, setCollabMessage] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`/notes/${id}`);
        setNote(res.data);
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        setError("Failed to load note or access denied");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (!note) return;
    const timeout = setTimeout(async () => {
      setSaving(true);
      try {
        await axios.put(`/notes/${id}`, { title, content });
      } catch (err) {
        setError("Failed to save");
      } finally {
        setSaving(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [title, content]);

  const addCollaborator = async () => {
    if (!collaboratorEmail) return;
    setAddingCollab(true);
    setCollabMessage("");
    try {
      const res = await axios.post(`/notes/${id}/collaborators`, {
        collaboratorEmail,
      });
      setNote(res.data.note);
      setCollaboratorEmail("");
      setCollabMessage("Collaborator added successfully");
    } catch (err) {
      setCollabMessage(err.response?.data?.error || "Failed to add collaborator");
    } finally {
      setAddingCollab(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-indigo-400 hover:underline text-sm"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-white text-sm transition"
          >
            ← Back
          </button>
          <span className="text-gray-600 text-xs">
            {saving ? "Saving..." : "Saved"}
          </span>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full bg-transparent text-white text-3xl font-bold placeholder-gray-700 outline-none border-none mb-4"
        />

        {/* Divider */}
        <div className="border-t border-gray-800 mb-6" />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          rows={20}
          className="w-full bg-transparent text-gray-300 text-base placeholder-gray-700 outline-none border-none resize-none leading-relaxed"
        />

        {/* Collaborators Section */}
        <div className="mt-10 border-t border-gray-800 pt-8">
          <h3 className="text-white font-semibold mb-4">Collaborators</h3>

          {note?.collaborators?.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {note.collaborators.map((c) => (
                <span
                  key={c._id}
                  className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full"
                >
                  {c.name} — {c.email}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm mb-4">No collaborators yet.</p>
          )}

          <div className="flex gap-2">
            <input
              type="email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="Enter email to invite"
              className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-gray-600"
            />
            <button
              onClick={addCollaborator}
              disabled={addingCollab}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {addingCollab ? "Adding..." : "Invite"}
            </button>
          </div>

          {collabMessage && (
            <p className="text-sm mt-2 text-gray-400">{collabMessage}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default NoteEditor;