import './globals.css';
import { Providers } from './components/Providers';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="p-8">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
