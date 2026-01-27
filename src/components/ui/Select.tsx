import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  loading?: boolean;
}

const Select: React.FC<SelectProps> = ({ label, options, loading, ...props }) => {
  return (
    <div className="ui-select-wrapper" style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>{label}</label>
      )}
      <select
        {...props}
        className="ui-select"
        style={{
          width: '100%',
          padding: 12,
          borderRadius: 8,
          border: '1px solid #ddd',
          fontSize: 15,
          background: loading ? '#f9fafb' : '#fff',
          color: loading ? '#aaa' : '#222',
          ...props.style,
        }}
        disabled={props.disabled || loading}
      >
        <option value="">Selecione o sabor</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loading && (
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Carregando opções...</div>
      )}
    </div>
  );
};

export default Select;
