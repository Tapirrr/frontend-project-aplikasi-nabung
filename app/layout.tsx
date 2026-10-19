import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import Shell from "./components/Shell";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--fb",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Celengan — Tabungan Minimalis",
  description: "Aplikasi pencatatan tabungan modern, bersih, dan minimalis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fontSans.variable} ${fontSans.variable}`}>
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
