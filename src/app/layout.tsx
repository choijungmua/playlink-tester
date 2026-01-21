import "./globals.css";
import localFont from "next/font/local";

const pretendard = localFont({
  src: [
    {
      path: "./fonts/Pretendard-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Pretendard-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${pretendard.className} antialiased min-h-screen w-full`}>
        <div className="w-full max-w-full px-4 md:px-6 lg:px-8 mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
