# Coding Conventions

Bu doküman projede tek bir isimlendirme ve kodlama standardı oluşturur.

## 1) Genel Prensipler

- Kod dili: **İngilizce** (değişken, fonksiyon, class, interface, tablo/kolon isimleri).
- UI metni: Türkçe olabilir.
- Yeni eklenen tüm kod bu standarda uyar.
- Legacy alanlar (örn. eski route/table adları) sadece güvenli migration planı ile taşınır.

## 2) İsimlendirme Standardı

- Variables / functions / params: `camelCase`
- React component / class / type / interface / enum type: `PascalCase`
- Constants (module-level immutable): `UPPER_CASE`
- Boolean isimleri: `is*`, `has*`, `can*`, `should*`
- Event handler isimleri: `handleSubmit`, `handleToggleMenu`
- Async fonksiyon isimleri: `fetchTrainings`, `loadInstructorProfile`

## 3) Dosya ve Klasör Standardı

- React component dosyaları: `PascalCase.tsx`
- Utility/helper dosyaları: `kebab-case.ts` veya mevcut pattern ile tutarlı
- Route segmentleri: URL için `kebab-case`
- Aynı kavram için tek isim kullan: örn. `training` ile gidiliyorsa yeni kodda `event` türetme

## 4) API ve Veri Sözleşmesi

- API response: `{ data, error? }` şekli korunur.
- Query değişkenleri açık isimli olmalı (`trainingId`, `instructorSlug`), `id1`, `tmp`, `obj` yok.
- DB isimleri İngilizce tutulur; yeni kolonlarda dil karışımı yapılmaz.

## 5) TypeScript Kuralları

- `any` yasak değil ama son çare; mümkünse özel type/interface tanımla.
- Public fonksiyonlarda dönüş tipi mümkün olduğunca açık yazılır.
- `unknown` + type guard, `any` yerine tercih edilir.

## 6) React Kuralları

- UI state isimleri anlamlı olmalı (`isMobileMenuOpen`, `selectedTrainingId`).
- Derived state mümkünse compute edilir, gereksiz state tutulmaz.
- Props interface isimleri: `XxxProps`.

## 7) SQL / Schema Kuralları

- Table: `snake_case` çoğul (`training_instructors`).
- Column: `snake_case` tek anlamlı (`display_order`, `created_at`).
- Timestamp kolonları: `created_at`, `updated_at` standardı.

## 8) Lint/Format Policy

- Zorunlu komutlar:
  - `npm run lint`
  - `npm run lint:strict`
  - `npm run format:check`
- Merge öncesi en az `lint` ve `tsc --noEmit` temiz olmalı.

## 9) Refactor Policy

- Toplu rename işlemleri küçük parçalarda yapılır.
- Önce davranış değişmeyen rename + test/lint doğrulaması.
- Route/table rename işlemleri için backward-compatible geçiş katmanı bırakılır.