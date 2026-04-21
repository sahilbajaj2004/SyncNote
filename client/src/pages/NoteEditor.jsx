import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";
import { ySyncPlugin, yUndoPlugin, undo, redo } from "y-prosemirror";
import { io } from "socket.io-client";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const USER_COLORS = [
  "#f59e0b", "#fbbf24", "#d97706", "#fde68a",
  "#b45309", "#fcd34d", "#fffbeb", "#fef3c7",
];

const getRandomColor = () =>
  USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

const ydoc = new Y.Doc();
const ytext = ydoc.getXmlFragment("prosemirror");
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
  const userColor = useRef(getRandomColor());
  const initialized = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[500px] focus:outline-none text-gray-300 leading-relaxed px-2",
      },
    },
    onUpdate: () => {
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
        if (editor && res.data.content && !initialized.current) {
          editor.commands.setContent(res.data.content);
          initialized.current = true;
        }
      } catch (err) {
        setError("Failed to load note or access denied");
      } finally {
        setLoading(false);
      }
    };
    if (editor) fetchNote();
  }, [id, editor]);

  // Socket.io
  useEffect(() => {
    if (!user || !id) return;

    socket.emit("join-note", {
      noteId: id,
      userId: user.id,
      userName: user.name,
      userColor: userColor.current,
    });

    socket.on("room-users", (roomUsers) => {
      setUsers(roomUsers);
    });

    socket.on("yjs-update", ({ update }) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    return () => {
      socket.off("room-users");
      socket.off("yjs-update");
    };
  }, [user, id]);

  // Broadcast Yjs updates
  useEffect(() => {
    const handler = (update, origin) => {
      if (origin === "remote") return;
      socket.emit("yjs-update", {
        noteId: id,
        update: Array.from(update),
      });
    };
    ydoc.on("update", handler);
    return () => ydoc.off("update", handler);
  }, [id]);

  // Auto-save
  useEffect(() => {
    if (!note || !saving) return;
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
      <div className="min-h-[calc(100vh-73px)] relative flex items-center justify-center">
        <div className="mesh-bg opacity-30"></div>
        <div className="flex flex-col items-center gap-5 anim-fade z-10">
          <div className="branded-loader"></div>
          <p className="text-gray-500 font-medium">Opening document</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] relative flex items-center justify-center">
        <div className="mesh-bg opacity-30"></div>
        <div className="glass-card p-10 text-center max-w-md z-10 anim-in">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-white font-medium mb-2">Access Denied</p>
          <p className="text-gray-400 text-sm mb-8">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-glass px-6 py-2.5 w-full"
          >
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] relative px-6 py-8">
      <div className="mesh-bg opacity-20"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8 anim-in anim-in-1">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Workspace
          </button>
          
          <div className="flex items-center gap-4">
            {users.length > 0 && (
              <div className="flex items-center -space-x-2">
                {users.map((u, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-void flex items-center justify-center shadow-lg transform transition hover:-translate-y-1 hover:z-10 relative cursor-pointer group"
                    style={{ backgroundColor: u.userColor || "#fbbf24" }}
                  >
                    <span className="text-void text-xs font-bold">
                      {u.userName?.charAt(0).toUpperCase()}
                    </span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white text-void text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                      {u.userName}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium w-24 justify-end">
              {saving ? (
                <>
                  <span className="save-dot save-dot-saving"></span> Saving 
                </>
              ) : (
                <>
                  <span className="save-dot save-dot-saved"></span> Saved
                </>
              )}
            </div>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="glass-card shadow-2xl overflow-hidden anim-in anim-in-2">
          
          {/* Toolbar */}
          {editor && (
            <div className="bg-white/5 border-b border-white/5 p-4 flex flex-wrap gap-2 items-center sticky top-0 z-20 backdrop-blur-md">
              {[
                { icon: <b className="font-serif">B</b>, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
                { icon: <i className="font-serif">I</i>, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
                { separator: true },
                { icon: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), title: "Heading 1" },
                { icon: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "Heading 2" },
                { separator: true },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet List" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Numbered List" },
                { separator: true },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), title: "Code Block" },
              ].map((btn, idx) => (
                btn.separator ? (
                  <div key={`sep-${idx}`} className="h-5 w-px bg-white/10 mx-1"></div>
                ) : (
                  <button
                    key={btn.title}
                    onClick={btn.action}
                    title={btn.title}
                    className={`h-8 min-w-[32px] px-2 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                      btn.active
                        ? "bg-gold-500/20 text-gold-400 border border-gold-500/30 shadow-glow-gold"
                        : "text-gray-400 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {btn.icon}
                  </button>
                )
              ))}
            </div>
          )}

          {/* Editor Area */}
          <div className="p-8 sm:p-12 pl-10 sm:pl-14 relative">
            {/* Visual Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-500/40 via-gold-600/10 to-transparent"></div>
            
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaving(true);
              }}
              placeholder="Document Title"
              className="w-full bg-transparent text-white font-heading text-4xl sm:text-5xl font-bold tracking-tight placeholder-gray-700 outline-none border-none mb-8 focus:ring-0"
            />

            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Collaborators Section */}
        <div className="mt-12 anim-in anim-in-3">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-white font-heading font-bold text-lg">Collaborators</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Current Collaborators */}
            <div className="md:col-span-3">
              {note?.collaborators?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {note.collaborators.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-xl"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10 shadow-inner">
                         <span className="text-gray-300 font-bold">{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{c.name}</p>
                        <p className="text-gray-500 text-xs">{c.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <p className="text-gray-400 text-sm">No collaborators yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Invite your team to edit together in real-time.</p>
                </div>
              )}
            </div>

            {/* Invite Form */}
            <div className="md:col-span-2">
              <div className="glass-card p-5">
                <p className="text-white font-medium text-sm mb-4">Invite someone</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="email"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    placeholder="Email address"
                    className="input-gold w-full px-4 py-2.5 text-sm"
                  />
                  <button
                    onClick={addCollaborator}
                    disabled={addingCollab || !collaboratorEmail}
                    className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2"
                  >
                    {addingCollab ? (
                      <div className="w-4 h-4 border-2 border-void/20 border-t-void rounded-full animate-spin"></div>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    )}
                    Send Invite
                  </button>
                </div>

                {collabMessage && (
                  <div className={`mt-4 px-3 py-2 rounded-lg text-xs font-medium border ${collabMessage.includes("success") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                    {collabMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NoteEditor;