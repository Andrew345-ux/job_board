import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobBoard – Find Your Next Opportunity",
  description:
    "A modern job board platform connecting recruiters and job seekers. Post jobs, browse listings, and apply instantly.",
  keywords: ["jobs", "job board", "hiring", "careers", "recruitment"],
  openGraph: {
    title: "JobBoard – Find Your Next Opportunity",
    description: "Connect with top opportunities and build your career.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
