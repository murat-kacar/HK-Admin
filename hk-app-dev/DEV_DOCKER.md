Geliştirme (Docker-first) akışı

Amaç: Her zaman önce veritabanını Docker içinde ayağa al, sonra uygulamayı Docker-based dev (Next.js) olarak çalıştır. Bu dosya, ekipte standart çalışma talimatı olarak kullanılabilir.

Özet
- Postgres (DB) servisleri: `hk-db-dev/docker-compose.yml`
- Uygulama (Next dev) servisleri: `hk-app-dev/docker-compose.yml`
- DB host'ta `5432` portundan erişilebilir (container 5432 -> host 5432)

Adımlar

1) Veritabanını başlat

```bash
cd hk-db-dev
docker compose up -d --build
```

- Sağlık durumunu kontrol et:

```bash
docker compose ps
# veya
docker ps --filter name=hk-app-db-dev
```

2) Uygulama konteynerini başlat (DB sağlıklanana kadar bekler)

```bash
cd ../hk-app-dev
docker compose up -d --build
```

- Uygulama, `pg_isready` ile DB'nin hazır olmasını bekleyecek. Logları takip etmek için:

```bash
docker compose logs -f
# veya sadece uygulama logları
docker compose logs -f hk-app-dev
```

3) Doğrulama
- Tarayıcıda `http://localhost:3000` adresine gidin (Next dev server).
- DB'yi kontrol etmek için:

```bash
# DB is managed in `hk-db-dev/docker-compose.yml` — connect using your own env vars or the running container:
docker exec -it hk-app-db-dev psql -U $POSTGRES_USER -d $POSTGRES_DB
```

4) Kapatma / Temizleme

```bash
# Uygulamayı kapat
cd hk-app-dev
docker compose down

# Veritabanını kapat (veri silinmesini istemezsen -v kullanma)
cd ../hk-db-dev
docker compose down

# Eğer veriyi sıfırlamak istiyorsan (VERİ KAYBI):
# docker compose down -v
```

Notlar
- `hk-db-dev/docker-compose.yml` dosyasında Postgres `healthcheck` vardır (pg_isready). Uygulama `docker-compose.yml` içinde DB'yi bekleyecek şekilde yapılandırıldı.
- Host'ta DB portu 5432 olarak publish edilmiş: `5432:5432`.
- TypeScript ve lint kontrollerini yerel olarak çalıştırmak isterseniz, geliştirme konteyneri içinde veya hostta `npm run build` / `npx eslint` / `pnpm` gibi komutları çalıştırabilirsiniz.

İsterseniz bu akışı tek bir script'e veya make hedefine çekeyim (örn. `make dev`), isterseniz ben yapılandırayım.

Otomatik başlatma script'i

- Repo kökünde `rundockerdev` adlı bir script oluşturdum. Bu script şu adımları çalıştırır:
	1. `hk-db-dev` içindeki Postgres'i `docker compose up -d --build` ile başlatır
	2. `pg_isready` healthcheck ile Postgres sağlıklı olana kadar bekler
	3. `hk-app-dev` içinde uygulamayı `docker compose up -d --build` ile başlatır

Kullanım (repo kökünden):

```bash
./rundockerdev
```

Script varsayılan bekleme süresi `120` saniyedir. Farklı süre için `RUNDOCKERDEV_TIMEOUT` ortam değişkenini kullanabilirsiniz, örn:

```bash
RUNDOCKERDEV_TIMEOUT=300 ./rundockerdev
```