import "./globals.css";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import Shell from "./components/Shell";

const fh = Bricolage_Grotesque({ subsets: ["latin"], variable: "--fh", weight: ["500", "700"] });
const fb = Instrument_Sans({ subsets: ["latin"], variable: "--fb" });
export const metadata = { title: "Celengan" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fh.variable} ${fb.variable}`}>
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
        
      </body>
    </html>
  );
}
