import './globals.css';

export const metadata = {
  title: 'מסלול טיולים אפקה 2026',
  description: 'Afeka Trail Planner - Plan your perfect trip'
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="min-h-screen bg-gray-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
