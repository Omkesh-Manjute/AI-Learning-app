import { useState, useEffect } from 'react';
import { useData } from './DataContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { BookOpen, Download, ChevronLeft, CheckCircle, Image, FileText, Filter } from 'lucide-react';
import { EmptyState } from './Loading.jsx';

const SUBJECTS = ['All', 'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science'];

export default function ChapterViewer() {
  const { user } = useAuth();
  const { getChapters } = useData();
  const [chapters, setChapters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState('All');
  const [read, setRead] = useState(() => JSON.parse(localStorage.getItem('sl_read_' + user?.id) || '[]'));

  useEffect(() => {
    const all = getChapters();
    setChapters(all.filter(c => c.class === user.class));
  }, []);

  const markRead = (id) => {
    const newRead = read.includes(id) ? read.filter(r => r !== id) : [...read, id];
    setRead(newRead);
    localStorage.setItem('sl_read_' + user.id, JSON.stringify(newRead));
  };

  const filtered = subject === 'All' ? chapters : chapters.filter(c => c.subject === subject);

  const availSubjects = ['All', ...new Set(chapters.map(c => c.subject))];

  if (selected) {
    return (
      <div className="animate-fadeIn space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelected(null)}
            className="flex items-center gap-1 text-blue-600 font-bold hover:text-blue-800 transition-colors">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex-1" />
          <button onClick={() => markRead(selected.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              read.includes(selected.id) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-50'
            }`}>
            <CheckCircle size={16} />
            {read.includes(selected.id) ? 'Marked Read' : 'Mark as Read'}
          </button>
        </div>

        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>{selected.title}</h2>
              <div className="flex gap-2 mt-1">
                <span className="badge bg-blue-100 text-blue-700">Class {selected.class}</span>
                <span className="badge bg-purple-100 text-purple-700">{selected.subject}</span>
              </div>
            </div>
          </div>

          {selected.description && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-blue-700 mb-1">About this Chapter</p>
              <p className="text-sm text-gray-600">{selected.description}</p>
            </div>
          )}

          {selected.content && (
            <div>
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={16} /> Chapter Content
              </h3>
              <div className="prose prose-sm max-w-none">
                <div className="bg-white border border-blue-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selected.content}
                </div>
              </div>
            </div>
          )}

          {selected.images?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Image size={16} /> Illustrations
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selected.images.map((img, i) => (
                  <img key={i} src={img} alt={`illustration-${i+1}`}
                    className="w-full rounded-xl border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(img, '_blank')} />
                ))}
              </div>
            </div>
          )}

          {selected.pdfUrl && (
            <div className="mt-4">
              <a href={selected.pdfUrl} download={`${selected.title}.pdf`}
                className="btn-primary flex items-center gap-2 w-fit">
                <Download size={16} /> Download PDF
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
          Class {user.class} Chapters 📚
        </h2>
        <p className="text-sm text-gray-500">{chapters.length} chapters available • {read.length} completed</p>
      </div>

      {/* Progress bar */}
      {chapters.length > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-gray-600">Reading Progress</span>
            <span className="text-blue-600">{read.filter(r => chapters.find(c => c.id === r)).length}/{chapters.length}</span>
          </div>
          <div className="bg-blue-50 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${chapters.length > 0 ? (read.filter(r => chapters.find(c => c.id === r)).length / chapters.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Subject filter */}
      <div className="flex gap-2 flex-wrap">
        {availSubjects.map(s => (
          <button key={s} onClick={() => setSubject(s)}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${subject === s ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No chapters available" desc="Your teacher hasn't added chapters yet. Check back later!" />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(chapter => (
            <button key={chapter.id} onClick={() => setSelected(chapter)}
              className="card hover:shadow-md transition-all text-left group hover:border-blue-200 border-2 border-transparent">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${read.includes(chapter.id) ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {read.includes(chapter.id)
                    ? <CheckCircle size={20} className="text-green-600" />
                    : <BookOpen size={20} className="text-blue-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{chapter.title}</h4>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="badge bg-purple-100 text-purple-700">{chapter.subject}</span>
                    {chapter.pdfUrl && <span className="badge bg-green-100 text-green-700">PDF</span>}
                    {read.includes(chapter.id) && <span className="badge bg-green-100 text-green-700">✓ Read</span>}
                  </div>
                  {chapter.description && (
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{chapter.description}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

