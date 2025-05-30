import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Container from "@/components/Container";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/app/providers";
import { Bounce, ToastContainer } from "react-toastify";
import { Suspense } from "react";
import { Spinner } from "@/components/Spinner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Disclaimer } from "@/components/Disclaimer";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { cookies } from "next/headers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naddify",
  description: "A Platform for community-led project discovery on Monad",
  keywords: [
    "Naddify",
    "Monad projects",
    "project curation",
    "blockchain discovery",
    "crypto reputation",
    "verify Web3 projects",
    "Monad ecosystem",
    "Naddify platform",
    "decentralized project ranking",
    "community votes blockchain",
    "NFT projects Monad",
    "Monad Web3 apps",
    "trustworthy crypto projects",
    "scam detection Web3",
  ],
  authors: [
    { name: "Tonashiro" },
    { name: "1stBenjaNAD" },
    { name: "Toadster69" },
    { name: "andalfthegreat" },
  ],
  creator: "Tonashiro",
  publisher: "Tonashiro",
  metadataBase: new URL("https://www.naddify.xyz"),
  alternates: {
    canonical: "https://www.naddify.xyz",
  },
  openGraph: {
    title: "Naddify",
    description: "A Platform for community-led project discovery on Monad",
    url: "https://www.naddify.xyz",
    siteName: "Naddify",
    images: [
      {
        url: "https://www.naddify.xyz/open_graph.png",
        width: 1200,
        height: 630,
        alt: "Naddify- A Platform for community-led project discovery on Monad",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@naddify_xyz",
    creator: "@naddify_xyz",
    title: "Naddify",
    description: "A Platform for community-led project discovery on Monad",
    images: [
      {
        url: "https://www.naddify.xyz/open_graph.png",
        width: 1200,
        height: 630,
        alt: "Naddify - A Platform for community-led project discovery on Monad",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user data on the server side
  const cookieStorage = await cookies();
  const token = cookieStorage.get("token")?.value;

  let user = null;

  if (token) {
    const userResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (userResponse.ok) {
      user = await userResponse.json();
    }
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <SpeedInsights />
      <Analytics />
      <Suspense
        fallback={
          <body className="flex justify-center items-center h-screen w-screen">
            <Spinner />
          </body>
        }
      >
        <Providers initialUser={user}>
          <body
            className={`relative
          ${dmSans.variable} antialiased
        `}
          >
            <Disclaimer />
            <div className="fixed z-[-1] inset-0 min-h-screen w-screen bg-gradient pointer-events-none" />
            <ParticlesBackground />
            <Navbar />
            <Container>{children}</Container>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              transition={Bounce}
            />
          </body>
        </Providers>
      </Suspense>
    </html>
  );
}
