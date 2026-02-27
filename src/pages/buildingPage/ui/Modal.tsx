export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="p-6 border-t flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
};
