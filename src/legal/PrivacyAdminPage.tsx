import { siteConfig } from "../config";

export function PrivacyAdminPage() {
  const email = siteConfig.supportEmail;

  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <div className="wrap legal-topbar-inner">
          <a href="/" className="legal-brand" aria-label="Oyna — ana səhifə">
            <img src="/logo.png" alt="Oyna loqosu" />
            <span className="legal-brand-word">Oyna</span>
          </a>
          <a href="/" className="legal-back">
            ← Ana səhifə
          </a>
        </div>
      </header>

      <main className="wrap legal-wrap">
        <p className="eyebrow">Oyna Admin · Hüquqi</p>
        <h1 className="legal-title">Məxfilik Siyasəti — Oyna Admin</h1>
        <p className="legal-meta">
          Son yenilənmə: 11 oktyabr 2026 · Tətbiq: Oyna Admin mobil tətbiqi
          (Android) — internet klub və məkan sahibləri üçün idarəetmə paneli
        </p>

        <div className="legal-body">
          <p>
            Bu Məxfilik Siyasəti «Oyna» komandasının («biz», «bizim») Oyna
            Admin tətbiqindən — internet klubların və məkanların sahiblərinin
            rezervasiyaları idarə etməsi üçün nəzərdə tutulmuş tətbiqdən
            («Xidmət») istifadə edərkən şəxsi məlumatlarınızı necə topladığını,
            istifadə etdiyini, paylaşdığını və qoruduğunu izah edir. Bu sənəd
            yalnız Oyna Admin tətbiqinə aiddir — istifadəçi (müştəri) tətbiqinin
            siyasəti ayrıca səhifədədir.
          </p>
          <p className="legal-controller">
            <strong>Məsul şəxs (data controller):</strong> «Oyna» komandası
            <br />
            <strong>Əlaqə:</strong>{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>

          <h2>1. Topladığımız məlumatlar</h2>
          <h3>1.1. Sizin təqdim etdiyiniz məlumatlar</h3>
          <ul>
            <li>
              <strong>Telefon nömrəsi:</strong> giriş üçün istifadə etdiyiniz
              nömrə — daxilolma SMS ilə göndərilən birdəfəlik kod (OTP)
              vasitəsilə təsdiqlənir.
            </li>
            <li>
              <strong>Profil məlumatları:</strong> tətbiqdə göstərilən ad
              (display name) və məkan/klub hesabınıza bağlı məlumatlar.
            </li>
            <li>
              <strong>Dəstək yazışmaları:</strong> bizə e-poçt vasitəsilə
              göndərdiyiniz mesajlar.
            </li>
          </ul>

          <h3>1.2. Avtomatik toplanan məlumatlar</h3>
          <ul>
            <li>
              <strong>Cihaz və bildiriş məlumatları:</strong> push bildirişləri
              göndərmək üçün <strong>Firebase Cloud Messaging (FCM)
              tokeni</strong>, əməliyyat sistemi, tətbiq versiyası, cihaz
              identifikatorları.
            </li>
            <li>
              <strong>Tətbiq bütövlüyü yoxlaması:</strong> Firebase App Check /
              Play Integrity vasitəsilə cihazın və tətbiqin etibarlılığını
              təsdiqləyən texniki tokenlər (sui-istifadənin qarşısı üçün).
            </li>
            <li>
              <strong>Səsli zəng məlumatları:</strong> müştərilərlə
              tətbiqdaxili səsli zəng zamanı mikrofonunuzdan gələn{" "}
              <strong>səs real vaxtda qarşı tərəfə ötürülür</strong>. Zənglər
              bizim tərəfimizdən <strong>yazılmır və saxlanmır</strong>. (Zəng
              texniki olaraq WebRTC vasitəsilə qurulur; bəzi şəbəkələrdə
              bağlantı bizim TURN/STUN serverlərimiz üzərindən keçə bilər.)
            </li>
            <li>
              <strong>İstifadə və jurnal məlumatları:</strong> serverlərimizdə
              saxlanan standart texniki jurnallar (IP ünvanı, sorğu vaxtı,
              xəta jurnalları, hərəkət tarixçəsi — audit).
            </li>
          </ul>

          <h3>1.3. Tətbiqdə görünən müştəri məlumatları</h3>
          <p>
            Xidmətin mahiyyəti tələb edir ki, rezervasiyaları idarə etmək üçün
            tətbiqdə sizin məkanınıza rezervasiya etmiş müştərilərin{" "}
            <strong>adı və telefon nömrəsi</strong> göstərilsin. Bu məlumatlara
            görə məkan sahibi olaraq siz öz məxfilik öhdəliklərinizə cavabdeh
            olursunuz: onlardan yalnız rezervasiyanın icrası məqsədilə istifadə
            edin.
          </p>

          <h3>1.4. Toplamadığımız məlumatlar</h3>
          <ul>
            <li>
              Lokasiya, kamera, kontakt və media icazələri tələb olunmur —
              tətbiq bu məlumatları <strong>toplamır</strong>.
            </li>
            <li>
              Reklam məqsədli izləmə (tracking) etmirik; tətbiqdə{" "}
              <strong>reklam şəbəkəsi və üçüncü tərəf analitika SDK-sı
              yoxdur</strong>.
            </li>
          </ul>

          <h2>2. Məlumatlardan necə istifadə edirik</h2>
          <ul>
            <li>
              Hesabınıza girişi təmin etmək (telefon nömrəsi + SMS OTP).
            </li>
            <li>
              Rezervasiyaları idarə etmək: yeni rezervasiyalar, ləğvlər,
              təsdiqlər və check-in məlumatlarını göstərmək.
            </li>
            <li>
              Rezervasiya, zəng və xidmət bildirişləri haqqında{" "}
              <strong>push bildirişlər</strong> göndərmək.
            </li>
            <li>
              Müştərilərlə tətbiqdaxili <strong>səsli zəngləri</strong> qurmaq.
            </li>
            <li>
              Xidmətin təhlükəsizliyini qorumaq, icazəsiz girişin və
              sui-istifadənin qarşısını almaq (App Check, audit jurnalları).
            </li>
            <li>Dəstək sorğularınıza cavab vermək.</li>
          </ul>

          <h2>3. Məlumatların paylaşılması</h2>
          <p>
            Şəxsi məlumatlarınızı <strong>satmırıq</strong> və reklam məqsədi
            ilə üçüncü tərəflərlə <strong>paylaşmırıq</strong>. Məlumatlar
            yalnız aşağıdakı hallarda ötürülür:
          </p>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Kimə</th>
                  <th>Nə</th>
                  <th>Niyə</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Google (Firebase, Play)</td>
                  <td>
                    FCM token, App Check / Play Integrity tokenləri,
                    telefon nömrəsi (OTP təsdiqi üçün)
                  </td>
                  <td>
                    Autentifikasiya, push bildirişlər, tətbiq bütövlüyü
                    yoxlaması
                  </td>
                </tr>
                <tr>
                  <td>SMS provayderi (Infobip)</td>
                  <td>Telefon nömrəniz</td>
                  <td>Daxilolma kodunun (OTP) göndərilməsi</td>
                </tr>
                <tr>
                  <td>Hosting provayderi (netcup)</td>
                  <td>
                    Serverdə saxlanan yuxarıda qeyd olunan məlumatlar
                  </td>
                  <td>Backend və verilənlər bazasının yerləşdirilməsi</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Google-un öz Məxfilik Siyasəti:{" "}
            <a
              href="https://policies.google.com/privacy"
              rel="noopener noreferrer"
            >
              https://policies.google.com/privacy
            </a>
          </p>
          <p>
            Qanun tələb etdikdə (məhkəmə qərarı, dövlət orqanının qanuni
            sorğusu) məlumatlar aidiyyətli qurumlara verilə bilər.
          </p>

          <h2>4. Məlumatların saxlanması və təhlükəsizliyi</h2>
          <ul>
            <li>
              Məlumatlarınız hesabınız aktiv olduğu müddətdə saxlanır.
            </li>
            <li>
              Tokenlər cihazınızda <strong>şifrələnmiş yaddaşda</strong>
              (Android EncryptedSharedPreferences / Keystore) saxlanılır.
            </li>
            <li>
              Serverlə əlaqə <strong>HTTPS/TLS</strong> üzərindən şifrələnmiş
              kanalla aparılır; tətbiqdə sertifikat pinning tətbiq olunur.
            </li>
            <li>
              Serverlər Avropa İttifaqı ərazisində (netcup, Almaniya)
              yerləşir — məlumatların ölkədənkənar ötürülməsi həmin
              provayderlərin təhlükəsizlik standartları ilə qorunur.
            </li>
          </ul>

          <h2>5. Hesabın və məlumatların silinməsi</h2>
          <ul>
            <li>
              Admin hesabları super-admin tərəfindən idarə olunur. Hesabınızın
              silinməsini tələb etmək üçün{" "}
              <a href={`mailto:${email}`}>{email}</a> ünvanına qeydiyyatda
              istifadə etdiyiniz telefon nömrənizi göstərərək «Hesabımı sil»
              mövzusu ilə yazın — sorğunuzu <strong>30 gün</strong> ərzində
              icra edirik.
            </li>
            <li>
              Silinmədən sonra hesab bərpa olunmur. Qanunla tələb olunan
              hallarda (məs., mübahisə, maliyyə uçotu, audit jurnalları) məhdud
              məlumatlar qanuni müddət ərzində saxlanıla bilər.
            </li>
          </ul>

          <h2>6. Hüquqlarınız</h2>
          <p>
            Yaşayış yerinizdən asılı olaraq aşağıdakı hüquqlara malik ola
            bilərsiniz:
          </p>
          <ul>
            <li>
              məlumatlarınıza <strong>giriş</strong> və onların{" "}
              <strong>surətini</strong> almaq;
            </li>
            <li>
              yanlış məlumatların <strong>düzəldilməsini</strong> tələb etmək;
            </li>
            <li>
              məlumatların <strong>silinməsini</strong> («unudulmaq hüququ»)
              tələb etmək;
            </li>
            <li>
              icazəni (məs., mikrofon, bildiriş, Bluetooth) istənilən vaxt
              cihaz parametrlərindən <strong>geri götürmək</strong> — bu,
              əvvəlki emalın qanuniliyinə təsir etmir;
            </li>
            <li>şikayəti aidiyyətli nəzarət orqanına vermək.</li>
          </ul>
          <p>
            Hüquqlarınızı həyata keçirmək üçün:{" "}
            <a href={`mailto:${email}`}>
              <strong>{email}</strong>
            </a>
          </p>

          <h2>7. Uşaqların məxfiliyi</h2>
          <p>
            Oyna Admin biznes istifadəsi üçündür və 18 yaşdan aşağı şəxslərə
            yönəlmir; biz onlardan qəsdən şəxsi məlumat toplamırıq.
          </p>

          <h2>8. Siyasətə dəyişikliklər</h2>
          <p>
            Siyasət yeniləndikdə «Son yenilənmə» tarixi dəyişilir, əhəmiyyətli
            dəyişikliklər barədə tətbiqdə və ya saytda məlumat verilir.
          </p>

          <h2>9. Əlaqə</h2>
          <ul>
            <li>
              E-poçt:{" "}
              <a href={`mailto:${email}`}>
                <strong>{email}</strong>
              </a>
            </li>
            <li>
              Sayt:{" "}
              <a href="https://oyna.site" rel="noopener">
                <strong>oyna.site</strong>
              </a>
            </li>
          </ul>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="wrap legal-footer-inner">
          <small>© 2026 Oyna. Bütün hüquqlar qorunur.</small>
          <a href="/">oyna.site</a>
        </div>
      </footer>
    </div>
  );
}
