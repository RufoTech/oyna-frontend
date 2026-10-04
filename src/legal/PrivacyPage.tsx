import { siteConfig } from "../config";

export function PrivacyPage() {
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
        <p className="eyebrow">Oyna · Hüquqi</p>
        <h1 className="legal-title">Məxfilik Siyasəti</h1>
        <p className="legal-meta">
          Son yenilənmə: 4 oktyabr 2026 · Tətbiq: Oyna mobil tətbiqi (Android /
          iOS) və oyna.site
        </p>

        <div className="legal-body">
          <p>
            Bu Məxfilik Siyasəti «Oyna» komandasının («biz», «bizim») Oyna mobil
            tətbiqindən və əlaqəli veb-saytlardan («Xidmət») istifadə edərkən
            şəxsi məlumatlarınızı necə topladığını, istifadə etdiyini,
            paylaşdığını və qoruduğunu izah edir.
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
              <strong>Hesab məlumatları:</strong> Google ilə giriş zamanı Google
              hesabınızdan alınan <strong>ad, e-poçt ünvanı, profil şəkli və
              Google/Firebase istifadəçi ID-niz</strong>.
            </li>
            <li>
              <strong>Profil məlumatları:</strong> tətbiqdə dəyişdiyiniz görünən
              ad (display name).
            </li>
            <li>
              <strong>Telefon nömrəsi:</strong> rezervasiya edərkən məkanın
              sizinlə əlaqə saxlaması üçün daxil etdiyiniz nömrə.
            </li>
            <li>
              <strong>Rezervasiya məlumatları:</strong> seçdiyiniz məkan, tarix,
              saat, nəfər sayı, masa/paket seçimi, əlavə qeydləriniz,
              rezervasiya statusu və check-in məlumatları.
            </li>
            <li>
              <strong>Rəylər (reviews):</strong> məkanlar haqqında yazdığınız{" "}
              <strong>reyting və şərhlər</strong>. Şərhləriniz adınızla birlikdə
              digər istifadəçilərə göstərilir.
            </li>
            <li>
              <strong>Sevimlilər:</strong> saxladığınız məkanların siyahısı.
            </li>
            <li>
              <strong>Dəstək yazışmaları:</strong> bizə e-poçt vasitəsilə
              göndərdiyiniz mesajlar.
            </li>
          </ul>

          <h3>1.2. Avtomatik toplanan məlumatlar</h3>
          <ul>
            <li>
              <strong>Məkan (lokasiya) məlumatı:</strong> icazə verdiyiniz
              təqdirdə, yaxınlığınızdakı məkanları xəritədə göstərmək və məsafəni
              hesablamaq üçün <strong>dəqiq və ya təxmini coğrafi mövqe</strong>.
              Android-də məlumat yalnız tətbiq istifadə olunduqda (foreground)
              toplanır.
            </li>
            <li>
              <strong>Cihaz və bildiriş məlumatları:</strong> push bildirişləri
              göndərmək üçün <strong>Firebase Cloud Messaging (FCM)
              tokeni</strong>, əməliyyat sistemi, tətbiq versiyası.
            </li>
            <li>
              <strong>İstifadə və jurnal məlumatları:</strong> serverlərimizdə
              saxlanan standart texniki jurnallar (IP ünvanı, sorğu vaxtı, xəta
              jurnalları).
            </li>
            <li>
              <strong>Səsli zəng məlumatları:</strong> məkan administrasiyası ilə
              tətbiqdaxili səsli zəng zamanı mikrofonunuzdan gələn{" "}
              <strong>səs real vaxtda qarşı tərəfə ötürülür</strong>. Zənglər
              bizim tərəfimizdən <strong>yazılmır və saxlanmır</strong>. (Zəng
              texniki olaraq WebRTC vasitəsilə qurulur; bəzi şəbəkələrdə
              bağlantı TURN/STUN serverləri üzərindən keçə bilər.)
            </li>
          </ul>

          <h3>1.3. Toplamadığımız məlumatlar</h3>
          <ul>
            <li>
              Kamera icazəsi iOS-da texniki səbəblə elan edilsə də,{" "}
              <strong>kameranız heç vaxt açılmır və görüntü göndərilmir</strong> —
              zənglər yalnız səslidir.
            </li>
            <li>
              Reklam məqsədli izləmə (tracking) etmirik; tətbiqdə{" "}
              <strong>reklam şəbəkəsi və üçüncü tərəf analitika SDK-sı
              yoxdur</strong>.
            </li>
            <li>
              Ödəniş kartı məlumatlarınızı toplamırıq (ödənişlər məkanın öz
              şərtləri ilə, tətbiqdən kənar həyata keçirilir).
            </li>
          </ul>

          <h2>2. Məlumatlardan necə istifadə edirik</h2>
          <ul>
            <li>
              Hesabınızı yaratmaq və girişi təmin etmək (Google Sign-In +
              Firebase Authentication).
            </li>
            <li>
              Rezervasiyaları yaratmaq, idarə etmək və statusu barədə sizə
              bildirmək.
            </li>
            <li>
              Rezervasiya detallarınızı və səsli zəngləri{" "}
              <strong>seçdiyiniz məkanın administrasiyasına çatdırmaq</strong>.
            </li>
            <li>
              Yaxınlığınızdakı məkanları göstərmək və axtarış nəticələrini
              məsafəyə görə sıralamaq.
            </li>
            <li>
              Rezervasiya statusu, təsdiqlər və xidmət bildirişləri haqqında{" "}
              <strong>push bildirişlər</strong> göndərmək.
            </li>
            <li>Dəstək sorğularınıza cavab vermək.</li>
            <li>
              Xidmətin təhlükəsizliyini qorumaq, sui-istifadənin qarşısını
              almaq, texniki problemləri diaqnostika etmək.
            </li>
          </ul>

          <h2>3. Məlumatların paylaşılması</h2>
          <p>
            Şəxsi məlumatlarınızı <strong>satmırıq</strong> və reklam məqsədi ilə
            üçüncü tərəflərlə <strong>paylaşmırıq</strong>. Məlumatlar yalnız
            aşağıdakı hallarda ötürülür:
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
                  <td>Rezervasiya etdiyiniz məkanlar</td>
                  <td>
                    Adınız, telefon nömrəniz, rezervasiya detalları, zəng
                    zamanı səsiniz
                  </td>
                  <td>Rezervasiyanın icrası və əlaqə</td>
                </tr>
                <tr>
                  <td>Google (Firebase, Maps, Sign-In)</td>
                  <td>
                    Hesab məlumatları, FCM token, xəritə sorğuları
                  </td>
                  <td>
                    Autentifikasiya, push bildirişlər, xəritə xidməti
                  </td>
                </tr>
                <tr>
                  <td>Render (hosting provayderi)</td>
                  <td>
                    Serverdə saxlanan bütün yuxarıda qeyd olunan məlumatlar
                  </td>
                  <td>Backend və verilənlər bazasının yerləşdirilməsi</td>
                </tr>
                <tr>
                  <td>MongoDB Atlas</td>
                  <td>Verilənlər bazası məlumatları</td>
                  <td>Məlumatların saxlanması</td>
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
              Məlumatlarınız hesabınız aktiv olduğu müddətdə saxlanır. Hesabı
              sildiyinizdə şəxsi məlumatlarınız silinir (aşağıya baxın).
            </li>
            <li>
              Tokenlər cihazınızda <strong>şifrələnmiş yaddaşda</strong>
              (Android EncryptedSharedPreferences / iOS Keychain) saxlanılır.
            </li>
            <li>
              Serverlə əlaqə <strong>HTTPS/TLS</strong> üzərindən şifrələnmiş
              kanalla aparılır.
            </li>
            <li>
              Ölkələrarası ötürmələr (məs., məlumatların Azərbaycandan
              kənardakı serverlərdə — Render, Google, MongoDB Atlas —
              saxlanması) həmin provayderlərin təhlükəsizlik standartları ilə
              qorunur.
            </li>
          </ul>

          <h2>5. Hesabın və məlumatların silinməsi</h2>
          <ul>
            <li>
              <strong>Tətbiq daxilində:</strong> Profil → «Hesabı sil»
              bölməsindən hesabınızı və əlaqəli şəxsi məlumatlarınızı istənilən
              vaxt silə bilərsiniz.
            </li>
            <li>
              <strong>Tətbiqdən kənar:</strong>{" "}
              <a href={`mailto:${email}`}>{email}</a> ünvanına qeydiyyatda
              istifadə etdiyiniz e-poçtdan «Hesabımı sil» mövzusu ilə yazın —
              sorğunuzu <strong>30 gün</strong> ərzində icra edirik.
            </li>
            <li>
              Silinmədən sonra hesab bərpa olunmur. Qanunla tələb olunan
              hallarda (məs., mübahisə, maliyyə uçotu) məhdud məlumatlar qanuni
              müddət ərzində saxlanıla bilər.
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
              icazəni (məs., lokasiya, mikrofon, bildiriş) istənilən vaxt cihaz
              parametrlərindən <strong>geri götürmək</strong> — bu, əvvəlki
              emalın qanuniliyinə təsir etmir;
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
            Xidmət 13 yaşdan aşağı uşaqlara yönəlmir və biz onlardan qəsdən
            şəxsi məlumat toplamırıq. 13 yaşdan aşağı bir şəxsin bizə məlumat
            verdiyini bildsəniz, <a href={`mailto:${email}`}>{email}</a>{" "}
            ünvanına yazın — məlumatı siləcəyik.
          </p>

          <h2>8. Veb-sayt və kukilər</h2>
          <p>
            Veb-saytlarımızda qeydiyyat sistemi yoxdur. Səhifələr Google Fonts
            kimi üçüncü tərəf CDN-lərdən yüklənən resurslar istifadə edə bilər —
            bu zaman brauzeriniz IP ünvanınızı həmin provayderlərə ötürür.
            Analitika aləti quraşdırılıbsa, bu barədə saytda ayrıca məlumat
            verilir.
          </p>

          <h2>9. Siyasətə dəyişikliklər</h2>
          <p>
            Siyasət yeniləndikdə «Son yenilənmə» tarixi dəyişilir, əhəmiyyətli
            dəyişikliklər barədə tətbiqdə və ya saytda məlumat verilir.
          </p>

          <h2>10. Əlaqə</h2>
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
