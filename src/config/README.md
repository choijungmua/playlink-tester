# Config 폴더

사이트 설정 및 메타데이터 관리를 위한 폴더입니다.

## 파일 설명

### `site.ts`
웹사이트의 메타데이터, SEO 설정, Open Graph 태그 등을 중앙에서 관리합니다.

**설정 내용:**
- 사이트 이름 및 설명
- URL 및 OG 이미지
- 키워드 및 저자 정보
- 테마 색상 및 아이콘

**사용 예시:**
```typescript
import { siteConfig } from "@/config/site";

// layout.tsx에서 메타데이터로 사용
export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  // ...
};
```

## OG 이미지 추가하기 (선택사항)

현재는 텍스트 기반 메타데이터만 사용합니다. 필요시 나중에 추가할 수 있습니다:

1. 1200x630 크기의 이미지를 준비합니다
2. `/public/og-image.png`에 저장합니다
3. `site.ts`에 `ogImage` 필드를 추가합니다
4. `layout.tsx`의 openGraph와 twitter 설정에 images 추가합니다

## 메타데이터 수정하기

`site.ts` 파일을 수정하여 사이트 정보를 업데이트할 수 있습니다:

```typescript
export const siteConfig = {
  name: "플레이링크 테스터",
  title: "플레이링크 테스터 | Playlink Tester",
  description: "여기에 원하는 설명을 입력하세요",
  // ...
};
```
