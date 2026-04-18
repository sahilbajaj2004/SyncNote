import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:5000");

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [collabMessage, setCollabMessage] = useState("");

  // Create Yjs document
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText("content");

  const editor = useEditor({
    extensions: [StarterKit.configure({ history: false })],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[400px] focus:outline-none text-gray-300 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save content to DB every 2 seconds after typing stops
      setSaving(true);
    },
  });

  // Fetch note
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`/notes/${id}`);
        setNote(res.data);
        setTitle(res.data.title);
        if (editor && res.data.content) {
          editor.commands.setContent(res.data.content);
        }
      } catch (err) {
        setError("Failed to load note or access denied");
      } finally {
        setLoading(false);
      }
    };
    if (editor) fetchNote();
  }, [id, editor]);

  // Join Socket.io room
  useEffect(() => {
    if (!user || !id) return;

    socket.emit("join-note", {
      noteId: id,
      userId: user.id,
      userName: user.name,
    });

    socket.on("room-users", (roomUsers) => {
      setUsers(roomUsers);
    });

    socket.on("yjs-update", ({ update }) => {
      const uint8Update = new Uint8Array(update);
      Y.applyUpdate(ydoc, uint8Update);
      if (editor) {
        editor.commands.setContent(ytext.toString());
      }
    });

    return () => {
      socket.off("room-users");
      socket.off("yjs-update");
    };
  }, [user, id, editor]);

  // Broadcast Yjs updates
  useEffect(() => {
    const handler = (update) => {
      socket.emit("yjs-update", {
        noteId: id,
        update: Array.from(update),
      });
    };
    ydoc.on("update", handler);
    return () => ydoc.off("update", handler);
  }, [id]);

  // Auto-save title and content
  useEffect(() => {
    if (!note) return;
    const timeout = setTimeout(async () => {
      try {
        await axios.put(`/notes/${id}`, {
          title,
          content: editor ? editor.getHTML() : "",
        });
      } catch (err) {
        console.error("Save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, [title, saving]);

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
      setCollabMessage(
        err.response?.data?.error || "Failed to add collaborator"
      );
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
          <div className="flex items-center gap-3">
            {/* Active users */}
            {users.length > 0 && (
              <div className="flex items-center gap-1">
                {users.map((u, i) => (
                  <span
                    key={i}
                    className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full"
                  >
                    {u.userName?.split(" ")[0]}
                  </span>
                ))}
              </div>
            )}
            <span className="text-gray-600 text-xs">
              {saving ? "Saving..." : "Saved"}
            </span>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaving(true);
          }}
          placeholder="Note title"
          className="w-full bg-transparent text-white text-3xl font-bold placeholder-gray-700 outline-none border-none mb-4"
        />

        {/* Divider */}
        <div className="border-t border-gray-800 mb-6" />

        {/* Toolbar */}
        {editor && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "B", action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
              { label: "I", action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
              { label: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
              { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
              { label: "• List", action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
              { label: "1. List", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
              { label: "< >", action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock") },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-mono ${
                  btn.active
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* TipTap Editor */}
        <EditorContent editor={editor} />

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