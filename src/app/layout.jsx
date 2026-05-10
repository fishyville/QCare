import "./globals.css";

export const metadata = {
  title: "QCare - Sistem Antrian Digital",
  description: "Sistem antrian digital untuk layanan kesehatan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}