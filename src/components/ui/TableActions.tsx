import React from 'react';
import { Eye, Edit3, Trash2 } from 'lucide-react';

interface TableActionsProps {
  item: any;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  customActions?: React.ReactNode;
  className?: string;
}

export default function TableActions({
  item,
  onView,
  onEdit,
  onDelete,
  customActions,
  className = ''
}: TableActionsProps) {
  return (
    <div className={`flex gap-2 justify-end ${className}`}>
      {onView && (
        <button
          onClick={() => onView(item)}
          className='btn btn-ghost btn-sm text-primary hover:text-primary-focus'
          title='Lihat'
        >
          <Eye size={16} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(item)}
          className='btn btn-ghost btn-sm text-primary hover:text-primary-focus'
          title='Edit'
        >
          <Edit3 size={16} />
        </button>
      )}
      {customActions}
    </div>
  );
}
