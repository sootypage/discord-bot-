import "./globals.css";
import Navbar from "../components/navbar";

export const metadata = {
  title: "Bot Dashboard",
  description: "Discord bot dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="dot-bg min-h-screen text-zinc-100">
        <Navbar />
        {children}
      </body>
    </html>
  );
}