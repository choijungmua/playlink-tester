export const siteConfig = {
  name: "플레이링크 테스터",
  title: "플레이링크 테스터 | Playlink Tester",
  description: "플레이링크 서비스의 베타 테스터 초대 플랫폼입니다. 새로운 기능을 먼저 경험하고 피드백을 공유해주세요.",
  url: "https://playlink-tester.vercel.app",
  keywords: [
    "플레이링크",
    "Playlink",
    "테스터",
    "베타 테스터",
    "초대",
    "피드백",
  ],
  authors: [
    {
      name: "Playlink Team",
      url: "https://playlink-tester.vercel.app",
    },
  ],
  creator: "Playlink Team",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export type SiteConfig = typeof siteConfig;
