import { Loader2 } from 'lucide-react';

export function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center gap-3 text-gray-600">
      <Loader2 size={28} className="animate-spin text-blue-500" />
      <p className="text-sm font-semibold">{text}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center">
      {Icon ? (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <Icon size={22} className="text-blue-600" />
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {desc ? <p className="mt-1 text-sm text-gray-500">{desc}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
