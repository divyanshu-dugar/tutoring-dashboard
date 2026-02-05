import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Tutor Dashboard",
  description: "Parent & Teacher Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
