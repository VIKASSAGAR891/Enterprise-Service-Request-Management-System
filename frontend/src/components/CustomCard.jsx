import React from 'react';

const CustomCard = ({ title, value, trend, icon, onClick }) => {
  // Determine trend color dynamically based on text content
  const getTrendColor = () => {
    if (!trend) return 'inherit';
    const t = trend.toLowerCase();
    if (t.startsWith('+') || t.startsWith('↑') || t.includes('satisfied') || t.includes('solved') || t.includes('success')) {
      return '#16A34A'; // Success green
    }
    if (t.includes('violation') || t.includes('pending') || t.includes('critical') || t.includes('escalation') || t.includes('error')) {
      return '#DC2626'; // Error red
    }
    return 'inherit';
  };

  return (
    <div className="uiverse-card" onClick={onClick}>
      {/* Front Face: Clean centered icon, title, and value */}
      <div className="card__front">
        <div className="card__front-icon">{icon}</div>
        <span className="card__front-title">{title}</span>
        <span className="card__front-value">{value}</span>
      </div>

      {/* Back Face (rotated in on hover): detailed info */}
      <div className="card__content">
        <p className="card__title">{title}</p>
        <p className="card__value">{value}</p>
        {trend && (
          <p className="card__description" style={{ color: getTrendColor() }}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomCard;
