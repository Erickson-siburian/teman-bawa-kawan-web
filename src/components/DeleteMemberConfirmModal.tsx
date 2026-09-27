import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { TeamMember } from '../types';

interface DeleteMemberConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onConfirmDelete: (memberId: string) => Promise<void> | void;
  isDeleting?: boolean;
}

export const DeleteMemberConfirmModal: React.FC<DeleteMemberConfirmModalProps> = ({
  isOpen,
  onClose,
  member,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!isOpen || !member) return null;

  const isAdminOrSelf = member.userType === 'admin' || member.id === 'user-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
        {/* Top Accent */}
        <div className="h-2 bg-red-600 w-full" />

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Hapus Member Aktif?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus akun dan data keanggotaan member dari database sistem TBK.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Member Card Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img
              src={member.avatar}
              alt={member.name}
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-300"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-slate-900 truncate">{member.name}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate">{member.email}</p>
              <span className="text-[10px] text-slate-400">
                {member.occupation || member.role || 'Member Aktif'}
              </span>
            </div>
            {isAdminOrSelf && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                ADMIN
              </span>
            )}
          </div>

          {isAdminOrSelf ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
              <p className="font-bold">⚠️ Akun Administrator Utama Dilindungi</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Akun administrator utama tidak dapat dihapus untuk mencegah hilangnya akses sistem.
              </p>
            </div>
          ) : (
            <p className="text-xs text-red-600 font-medium">
              ⚠️ Perhatian: Tugas yang ditugaskan kepada member ini akan otomatis dibersihkan dari server.
            </p>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            {!isAdminOrSelf && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  await onConfirmDelete(member.id);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Member'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
