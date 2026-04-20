import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.username) {
      navigate("/setup-username");
      return;
    }
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get("/notes");
      setNotes(res.data);
    } catch (err) {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    setCreating(true);
    try {
      const res = await axios.post("/notes", { title: "Untitled Note" });
      navigate(`/notes/${res.data.note._id}`);
    } catch (err) {
      setError("Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (e, noteId) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    try {
      await axios.delete(`/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (err) {
      setError("Failed to delete note");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Notes</h1>
            <p className="text-gray-500 text-sm mt-1">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <button
            onClick={createNote}
            disabled={creating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "+ New Note"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-600 text-lg">No notes yet.</p>
            <p className="text-gray-700 text-sm mt-2">
              Hit "+ New Note" to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                onClick={() => navigate(`/notes/${note._id}`)}
                className="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-semibold text-base truncate">
                    {note.title || "Untitled Note"}
                  </h3>
                  <button
                    onClick={(e) => deleteNote(e, note._id)}
                    className="text-gray-600 hover:text-red-400 text-xs transition shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {note.content || "No content yet..."}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-gray-600 text-xs">
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.collaborators?.length > 0 && (
                    <span className="text-indigo-400 text-xs">
                      {note.collaborators.length} collaborator
                      {note.collaborators.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;