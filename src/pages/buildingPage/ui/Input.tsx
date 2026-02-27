export const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium mb-1">{label}</label>}
    <input
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      {...props}
    />
  </div>
);
