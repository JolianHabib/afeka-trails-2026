export default function WeatherWidget({ weather }) {
  if (!weather || weather.length === 0) return null;

  const iconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        🌤️ תחזית מזג אויר — {weather.length} ימים קרובים
      {weather.length > 1 && (
        <span className="text-xs text-gray-500 font-normal">(מחר והלאה)</span>
      )}
       {weather.length === 1 && (
        <span className="text-xs text-gray-500 font-normal">(מחר)</span>
      )}
      
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {weather.map((day, i) => (
          <div key={i} className="text-center bg-gray-900/60 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">{day.date}</p>
            <img
              src={iconUrl(day.icon)}
              alt={day.description}
              className="w-12 h-12 mx-auto"
            />
            <p className="text-2xl font-bold text-white">{day.temp}°</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{day.description}</p>
            <div className="flex justify-center gap-3 mt-2 text-xs text-gray-500">
              <span>💧 {day.humidity}%</span>
              <span>💨 {day.wind_speed} כמ"ש</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
