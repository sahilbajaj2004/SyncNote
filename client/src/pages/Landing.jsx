import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-[calc(100vh-73px)] relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="mesh-bg opacity-40"></div>
      <div className="grain-overlay"></div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 anim-in anim-in-1">
            <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse"></span>
            <span className="text-gray-300 text-xs font-medium uppercase tracking-wider">SyncNote 1.0 is live</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-heading font-black text-white leading-[1.1] tracking-tight mb-8 anim-in anim-in-2">
            The luxurious way to <br className="hidden sm:block" />
            <span className="text-gold-gradient">think together.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-body anim-in anim-in-3">
            Real-time collaborative notes wrapped in an elegant, distraction-free interface.
            Capture ideas seamlessly, edit with your team, and organize effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 anim-in anim-in-4">
            <Link
              to="/register"
              className="btn-gold w-full sm:w-auto px-8 py-4 text-base shadow-lift flex items-center justify-center gap-3"
            >
              Get Started for Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            
            <a
              href="#features"
              className="btn-glass w-full sm:w-auto px-8 py-4 text-base"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="max-w-6xl mx-auto mt-32 w-full">
          <div className="text-center mb-16 anim-in anim-in-5">
             <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight mb-4">Everything you need. <span className="text-gray-500">Nothing you don't.</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-card p-8 anim-in" style={{ animationDelay: '400ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/20 flex items-center justify-center mb-6">
                 <svg className="text-gold-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-3">Real-time Sync</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Collaborate simultaneously with your team. Watch cursors move and edits happen instantly across devices, powered by Yjs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 anim-in" style={{ animationDelay: '480ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/20 flex items-center justify-center mb-6">
                <svg className="text-gold-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-3">Rich Text Editor</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                A gorgeous editorial writing experience. Format with ease, insert code blocks, and structure documents flawlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 anim-in" style={{ animationDelay: '560ms' }}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/20 flex items-center justify-center mb-6">
                 <svg className="text-gold-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-3">Auto-Saving</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Never lose a keystroke. Every change is instantly persisted to our secure backend, freeing you to focus completely on writing.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20 relative z-10 w-full text-center">
        <p className="text-gray-600 text-sm font-medium">© {new Date().getFullYear()} SyncNote. Built for creators.</p>
      </footer>
    </div>
  );
};

export default Landing;
