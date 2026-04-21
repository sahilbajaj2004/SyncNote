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
      <div className="min-h-[calc(100vh-73px)] relative flex items-center justify-center">
        <div className="mesh-bg opacity-30"></div>
        <div className="grain-overlay"></div>
        <div className="flex flex-col items-center gap-5 anim-fade z-10">
          <div className="branded-loader"></div>
          <p className="text-gray-500 font-medium">Loading your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] relative px-6 py-12">
      <div className="mesh-bg opacity-40"></div>
      <div className="grain-overlay"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 anim-in anim-in-1">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white tracking-tight">
              Workspace
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex h-2 w-2 rounded-full bg-gold-400"></span>
              <p className="text-gray-400 text-sm font-medium">
                {notes.length} {notes.length === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>
          <button
            onClick={createNote}
            disabled={creating}
            className="btn-gold px-6 py-2.5 flex items-center gap-2"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-void/20 border-t-void rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Note
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="error-banner px-4 py-3 mb-8 anim-in anim-in-2">
            {error}
          </div>
        )}

        {notes.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 px-4 text-center anim-in anim-in-2 mt-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/20 flex items-center justify-center mb-6">
              <svg className="text-gold-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">No notes yet</h3>
            <p className="text-gray-400 max-w-sm mb-8">
              Create your first note to start collaborating and capturing ideas.
            </p>
            <button onClick={createNote} className="btn-glass px-5 py-2.5 flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
               Create your first note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note, idx) => (
              <div
                key={note._id}
                onClick={() => navigate(`/notes/${note._id}`)}
                className={`glass-card-interactive p-6 group anim-in`}
                style={{ animationDelay: `${(idx + 2) * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="font-heading font-bold text-white text-lg leading-tight truncate">
                    {note.title || "Untitled Note"}
                  </h3>
                  <button
                    onClick={(e) => deleteNote(e, note._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1.5 -mr-1.5 rounded-md hover:bg-red-500/10 focus:opacity-100"
                    title="Delete Note"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>

                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-6">
                  {note.content?.replace(/<[^>]*>?/gm, '') || "No content yet. Click to start writing..."}
                </p>

                <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between">
                  <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">
                    {formatDate(note.updatedAt)}
                  </span>
                  
                  {note.collaborators?.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-gold-400/10 text-gold-400 border border-gold-400/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      {note.collaborators.length}
                    </div>
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