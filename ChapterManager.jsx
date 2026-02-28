import { useState, useEffect } from 'react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { Plus, Edit2, Trash2, BookOpen, ChevronDown, ChevronUp, X, Save } from 'lucide-react';
import { EmptyState } from './Loading.jsx';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science', 'Sanskrit', 'Physical Education'];
const CLASSES = Array.from({ length: 10 }, (_, i) => String(i + 1));

function ChapterForm({ initial, onSave, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState(initial || {
    title: '', description: '', class: '1', subject: 'Mathematics', content: '', pdfUrl: null, images: []
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => set('images', [...form.images, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('pdfUrl', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.class || !form.subject) return;
    onSave({ ...form, createdBy: user.id });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
            {initial ? 'Edit Chapter' : 'Add New Chapter'}
          </h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Class *</label>
              <select value={form.class} onChange={e => set('class', e.target.value)} className="input-field">
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Subject *</label>
              <select value={form.subject} onChange={e => set('subject', e.target.value)} className="input-field">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">Chapter Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              className="input-field" placeholder="e.g. Introduction to Algebra" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="input-field h-20 resize-none" placeholder="Brief description of the chapter..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">
              Chapter Content <span className="text-xs text-blue-500">(used for AI test generation)</span>
            </label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)}
              className="input-field h-32 resize-none" placeholder="Paste or type chapter content here. The AI will use this to generate test questions." />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Upload PDF (optional)</label>
              <input type="file" accept=".pdf" onChange={handlePdfUpload}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold hover:file:bg-blue-100 cursor-pointer" />
              {form.pdfUrl && <p className="text-xs text-green-600 font-semibold mt-1">✓ PDF uploaded</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">Upload Images (optional)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-bold hover:file:bg-blue-100 cursor-pointer" />
              {form.images.length > 0 && <p className="text-xs text-green-600 font-semibold mt-1">✓ {form.images.length} image(s) uploaded</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2 flex-1 justify-center">
              <Save size={16} /> {initial ? 'Update Chapter' : 'Create Chapter'}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChapterManager() {
  const { getChapters, createChapter, updateChapter, deleteChapter } = useData();
  const [chapters, setChapters] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editChapter, setEditChapter] = useState(null);
  const [filterClass, setFilterClass] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const reload = () => setChapters(getChapters());
  useEffect(() => { reload(); }, []);

  const handleSave = (data) => {
    if (editChapter) {
      updateChapter(editChapter.id, data);
    } else {
      createChapter(data);
    }
    setShowForm(false);
    setEditChapter(null);
    reload();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this chapter?')) {
      deleteChapter(id);
      reload();
    }
  };

  const filtered = filterClass === 'all' ? chapters : chapters.filter(c => c.class === filterClass);

  return (
    <div className="animate-fadeIn space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>Chapter Management</h2>
          <p className="text-sm text-gray-500">{chapters.length} chapters total</p>
        </div>
        <button onClick={() => { setEditChapter(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Chapter
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterClass('all')}
          className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${filterClass === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
          All Classes
        </button>
        {Array.from(new Set(chapters.map(c => c.class))).sort((a,b) => Number(a)-Number(b)).map(cls => (
          <button key={cls} onClick={() => setFilterClass(cls)}
            className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${filterClass === cls ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
            Class {cls}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No chapters yet" desc="Start by adding your first chapter!" 
          action={<button onClick={() => setShowForm(true)} className="btn-primary">Add Chapter</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(chapter => (
            <div key={chapter.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-800">{chapter.title}</h4>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="badge bg-blue-100 text-blue-700">Class {chapter.class}</span>
                        <span className="badge bg-purple-100 text-purple-700">{chapter.subject}</span>
                        {chapter.pdfUrl && <span className="badge bg-green-100 text-green-700">PDF</span>}
                        {chapter.images?.length > 0 && <span className="badge bg-yellow-100 text-yellow-700">{chapter.images.length} img</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
                        className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-gray-400">
                        {expandedId === chapter.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button onClick={() => { setEditChapter(chapter); setShowForm(true); }}
                        className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-blue-500">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(chapter.id)}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expandedId === chapter.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      {chapter.description && <p className="text-sm text-gray-600">{chapter.description}</p>}
                      {chapter.content && (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs font-bold text-blue-600 mb-1">Chapter Content (for AI)</p>
                          <p className="text-sm text-gray-600 line-clamp-3">{chapter.content}</p>
                        </div>
                      )}
                      {chapter.images?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {chapter.images.map((img, i) => (
                            <img key={i} src={img} alt={`img-${i}`} className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editChapter) && (
        <ChapterForm
          initial={editChapter}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditChapter(null); }}
        />
      )}
    </div>
  );
}

