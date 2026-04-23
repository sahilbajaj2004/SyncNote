import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import * as Y from "yjs";
import { io } from "socket.io-client";
import axios from "axios";

const GUEST_COLORS = [
  "#60a5fa", "#34d399", "#a78bfa", "#f472b6",
  "#fb923c", "#38bdf8", "#4ade80", "#e879f9",
];

const getRandomGuestColor = () =>
  GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)];

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const ydoc = new Y.Doc();
const ytext = ydoc.getXmlFragment("prosemirror");
const socket = io(SOCKET_URL);

const SharedNote = () => {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState([]);
  const initialized = useRef(false);
  const guestColor = useRef(getRandomGuestColor());
  const guestId = useRef(`guest-${Math.random().toString(36).slice(2, 9)}`);

  const [docSettings] = useState(() => {
    const saved = localStorage.getItem("syncnote_doc_settings");
    return saved
      ? JSON.parse(saved)
      : { fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: "1.75" };
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[500px] focus:outline-none text-gray-300 leading-relaxed px-2",
      },
    },
    onUpdate: () => setSaving(true),
  });

  // Fetch shared note (no auth needed)
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`${API_BASE}/notes/shared/${token}`);
        setNote(res.data);
        setTitle(res.data.title);
        if (editor && res.data.content && !initialized.current) {
          editor.commands.setContent(res.data.content);
          initialized.current = true;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError("This shared link is invalid or has been revoked.");
        } else {
          setError("Failed to load the shared note.");
        }
      } finally {
        setLoading(false);
      }
    };
    if (editor) fetchNote();
  }, [token, editor]);

  // Socket.io — join as Guest
  useEffect(() => {
    if (!note || !note._id) return;

    socket.emit("join-note", {
      noteId: note._id,
      userId: guestId.current,
      userName: "Guest",
      userColor: guestColor.current,
      userProfilePic: null,
    });

    socket.on("room-users", (roomUsers) => setUsers(roomUsers));
    socket.on("yjs-update", ({ update }) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    return () => {
      socket.off("room-users");
      socket.off("yjs-update");
    };
  }, [note]);

  // Broadcast Yjs updates
  useEffect(() => {
    if (!note) return;
    const handler = (update, origin) => {
      if (origin === "remote") return;
      socket.emit("yjs-update", {
        noteId: note._id,
        update: Array.from(update),
      });
    };
    ydoc.on("update", handler);
    return () => ydoc.off("update", handler);
  }, [note]);

  // Auto-save (no auth header needed)
  useEffect(() => {
    if (!note || !saving) return;
    const timeout = setTimeout(async () => {
      try {
        await axios.put(`${API_BASE}/notes/shared/${token}`, {
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="mesh-bg opacity-30"></div>
        <div className="flex flex-col items-center gap-5 anim-fade z-10">
          <div className="branded-loader"></div>
          <p className="text-gray-500 font-medium">Loading shared note…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="mesh-bg opacity-30"></div>
        <div className="glass-card p-10 text-center max-w-md z-10 anim-in">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <p className="text-white font-medium mb-2">Link Unavailable</p>
          <p className="text-gray-400 text-sm mb-8">{error}</p>
          <a
            href="/"
            className="btn-glass px-6 py-2.5 w-full inline-block text-center"
          >
            Go to SyncNote
          </a>
        </div>
      </div>
    );
  }

  // ── Editor ──
  return (
    <div className="min-h-screen relative px-6 py-8">
      <div className="mesh-bg opacity-20"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-8 anim-in anim-in-1">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-gold-gradient font-heading font-black text-lg tracking-tight">SyncNote</span>
            <span className="text-gray-600 text-xs font-medium bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
              Shared
            </span>
          </a>

          <div className="flex items-center gap-4">
            {users.length > 0 && (
              <div className="flex items-center -space-x-2">
                {users.map((u, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-void flex items-center justify-center shadow-lg transform transition hover:-translate-y-1 hover:z-10 relative cursor-pointer group overflow-hidden"
                    style={{ backgroundColor: u.userColor || "#60a5fa" }}
                  >
                    {u.userProfilePic ? (
                      <img src={u.userProfilePic} alt={u.userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-void text-xs font-bold">
                        {u.userName?.charAt(0).toUpperCase()}
                      </span>
                    )}
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

        {/* Editor Card */}
        <div className="glass-card shadow-2xl overflow-hidden anim-in anim-in-2">
          {/* Toolbar */}
          {editor && (
            <div className="bg-white/5 border-b border-white/5 p-4 flex flex-wrap gap-2 items-center sticky top-0 z-20 backdrop-blur-md">
              {[
                { icon: <b className="font-serif">B</b>, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
                { icon: <i className="font-serif">I</i>, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
                { icon: <u className="font-serif">U</u>, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), title: "Underline" },
                { icon: <s className="font-serif">S</s>, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), title: "Strikethrough" },
                { separator: true },
                { icon: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), title: "Heading 1" },
                { icon: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "Heading 2" },
                { separator: true },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet List" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Numbered List" },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote"), title: "Blockquote" },
                { separator: true },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive("codeBlock"), title: "Code Block" },
              ].map((btn, idx) =>
                btn.separator ? (
                  <div key={`sep-${idx}`} className="h-5 w-px bg-white/10 mx-1"></div>
                ) : (
                  <button
                    key={btn.title}
                    onClick={btn.action}
                    title={btn.title}
                    className={`h-8 min-w-[32px] px-2 rounded-md flex items-center justify-center text-xs font-bold transition-all border ${
                      btn.active
                        ? "bg-gold-500/20 text-gold-400 border-gold-500/30 shadow-glow-gold"
                        : "text-gray-400 hover:bg-white/10 hover:text-white border-transparent"
                    }`}
                  >
                    {btn.icon}
                  </button>
                )
              )}
            </div>
          )}

          {/* Editor Area */}
          <div className="p-8 sm:p-12 pl-10 sm:pl-14 relative editor-custom-typography">
            <style>{`
              .editor-custom-typography .ProseMirror, .editor-custom-typography input {
                font-family: ${docSettings.fontFamily} !important;
                font-size: ${docSettings.fontSize} !important;
                line-height: ${docSettings.lineHeight} !important;
                transition: font-size 0.2s ease, line-height 0.2s ease;
              }
              .editor-custom-typography .ProseMirror h1 { 
                font-size: calc(${docSettings.fontSize} * 2) !important; 
                line-height: calc(${docSettings.lineHeight} * 0.8) !important;
                margin-bottom: 1em !important;
              }
              .editor-custom-typography .ProseMirror h2 { 
                font-size: calc(${docSettings.fontSize} * 1.5) !important; 
                margin-top: 1.5em !important;
              }
              .editor-custom-typography .ProseMirror p { 
                margin-bottom: 1em !important;
              }
            `}</style>

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
              className="w-full bg-transparent text-white font-black tracking-tighter placeholder-gray-700 outline-none border-none mb-6 focus:ring-0 text-6xl sm:text-7xl md:text-[80px] lg:text-[120px] transition-all"
            />

            <div className="h-px w-full bg-gradient-to-r from-gold-500/30 via-white/5 to-transparent mb-8"></div>

            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Footer — Shared badge */}
        <div className="mt-8 flex items-center justify-center gap-2 anim-in anim-in-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span>Shared via <span className="text-gold-gradient font-semibold">SyncNote</span></span>
            {note?.owner?.name && (
              <span>· by {note.owner.name}</span>
            )}
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default SharedNote;
