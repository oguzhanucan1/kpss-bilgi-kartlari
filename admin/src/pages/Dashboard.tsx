import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Admin paneli</h1>
      <p>İçerikleri yönetmek için menüden bir bölüm seçin.</p>
      <ul style={{ lineHeight: 2 }}>
        <li><Link to="/subjects">Dersler</Link> – Ders ekle/düzenle</li>
        <li><Link to="/topics">Konular</Link> – Konu ekle/düzenle (derse bağlı)</li>
        <li><Link to="/cards">Kartlar</Link> – Bilgi kartı ekle/düzenle (konuya bağlı)</li>
        <li><Link to="/motivation">Motivasyon sözleri</Link> – Anasayfa motivasyon metinleri</li>
        <li><Link to="/announcements">Duyurular</Link> – Anasayfa duyuruları</li>
      </ul>
    </div>
  );
}
