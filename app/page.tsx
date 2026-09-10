{/* TAB 4: BLOG & JOURNAL */}
        {activeTab === "blog" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-zinc-200">✍️ Personal Reflections & Blog</h2>
              <p className="text-xs text-zinc-400">
                Draft your thoughts, wellness notes, or articles for Substack and Medium right here.
              </p>

              <form onSubmit={saveJournal} className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="Article or journal title..."
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Content</label>
                  <textarea
                    rows={5}
                    placeholder="Write your reflection here..."
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition cursor-pointer">
                  Save Entry
                </button>
              </form>
            </section>

            <section className="bg-zinc-800/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-zinc-200">Saved Entries</h2>
                {journalEntries.length > 0 && (
                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journalEntries, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `journal_entries_${new Date().toISOString().slice(0, 10)}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="text-[11px] bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-3 py-1 rounded-lg transition cursor-pointer"
                  >
                    Export JSON
                  </button>
                )}
              </div>

              {journalEntries.length === 0 ? (
                <div className="bg-zinc-800/20 border border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 text-sm">
                  No journal entries or blog drafts saved yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {journalEntries.map((entry) => (
                    <div key={entry.id} className="bg-zinc-800/80 border border-zinc-700/50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-zinc-100 text-sm">{entry.title}</h3>
                          <span className="text-[10px] text-zinc-400">{entry.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${entry.title}\n\n${entry.content}`);
                              alert("Copied to clipboard!");
                            }}
                            className="text-xs text-zinc-400 hover:text-emerald-400 transition cursor-pointer"
                            title="Copy entry"
                          >
                            📋
                          </button>
                          <button 
                            onClick={() => deleteJournal(entry.id)} 
                            className="text-zinc-500 hover:text-rose-400 transition cursor-pointer text-xs"
                            title="Delete entry"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

      </div>
    </main>
  );
}