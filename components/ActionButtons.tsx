'use client';

import { useAuth } from '@/lib/auth-context';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  onReduce?: () => void;
  readonly?: boolean;
}

export function ActionButtons({ onEdit, onDelete, onAdd, onReduce, readonly = false }: ActionButtonsProps) {
  const { canEdit, canDelete, canAdd } = useAuth();

  if (readonly) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Viewer Mode
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {onEdit && canEdit && (
        <button onClick={onEdit} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          ✏️ Edit
        </button>
      )}
      {onDelete && canDelete && (
        <button onClick={onDelete} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600">
          🗑️ Hapus
        </button>
      )}
      {onAdd && canAdd && (
        <button onClick={onAdd} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
          ➕ Tambah
        </button>
      )}
      {onReduce && canEdit && (
        <button onClick={onReduce} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600">
          ➖ Kurangi
        </button>
      )}
    </div>
  );
}
