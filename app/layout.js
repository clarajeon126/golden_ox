// /app/layout.js
import './globals.css';
import { SimulationProvider } from "./simulation/context/SimulationContext";
import localFont from 'next/font/local';

const futuraHandwritten = localFont({
  src: '../public/fonts/FuturaHandwritten.ttf',
  weight: '400',
  style: 'normal',
  display: 'swap',
});

export const metadata = {
  title: 'Golden Ox EMT Simulator',
  description: 'Step through emergency calls!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={futuraHandwritten.className}>
        <SimulationProvider> {/* ✅ Move here */}
          {children}
        </SimulationProvider>
      </body>
    </html>
  );
}
