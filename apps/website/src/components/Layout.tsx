import React from "react";
import { PT_Sans, PT_Serif } from "@next/font/google";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import Head from "next/head";

type LayoutProps = {
  children?: React.ReactNode;
};

const assetVersion = "2022-12-19";

const ptSans = PT_Sans({
  subsets: ["latin"],
  variable: "--font-ptsans",
  weight: ["400", "700"],
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  variable: "--font-ptserif",
  weight: ["400", "700"],
});

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/apple-touch-icon.png?v=${assetVersion}`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`/favicon-32x32.png?v=${assetVersion}`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`/favicon-16x16.png?v=${assetVersion}`}
        />
        <link rel="manifest" href={`/site.webmanifest?v=${assetVersion}`} />
        <link
          rel="mask-icon"
          href={`/safari-pinned-tab.svg?v=${assetVersion}`}
          color="#636a60"
        />
        <link rel="shortcut icon" href={`/favicon.ico?v=${assetVersion}`} />
        <meta name="apple-mobile-web-app-title" content="Alveus.gg" />
        <meta name="application-name" content="Alveus.gg" />
        <meta name="msapplication-TileColor" content="#636a60" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <div
        className={`flex h-full min-h-[100vh] flex-col bg-alveus-tan ${ptSans.variable} ${ptSerif.variable} font-sans`}
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;