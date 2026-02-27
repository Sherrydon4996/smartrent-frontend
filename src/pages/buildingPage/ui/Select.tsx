export const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <select
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      {...props}
    >
      {children}
    </select>
  </div>
);
