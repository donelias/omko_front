import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" web-version={process.env.NEXT_PUBLIC_WEB_VERSION} seo={process.env.NEXT_PUBLIC_SEO}>
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxxx"
          crossOrigin="anonymous"
        />
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&libraries=places&loading=async`}
          defer
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>
      <body className="!pointer-events-auto antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
