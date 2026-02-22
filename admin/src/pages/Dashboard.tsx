import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="card-bankco mb-6">
      <p className="m-0 text-bgray-600 dark:text-bgray-50">İçerikleri yönetmek için soldaki menüden bir bölüm seçin.</p>
      <ul className="mt-5 list-inside list-disc space-y-2 pl-2 text-bgray-700 dark:text-bgray-50">
        <li>
          <Link to="/subjects" className="font-medium text-success-400 hover:text-success-300 hover:underline">Dersler & Konular</Link>
          {' '}– Ders ve konu ekleyin; derse tıklayıp konuları aynı ekranda yönetin.
        </li>
        <li>
          <Link to="/cards" className="font-medium text-success-400 hover:text-success-300 hover:underline">Kartlar</Link>
          {' '}– Önce ders ve konu seçin, sonra kart ekleyin veya düzenleyin (zengin metin editörü).
        </li>
        <li>
          <Link to="/motivation" className="font-medium text-success-400 hover:text-success-300 hover:underline">Motivasyon</Link>
          {' '}– Anasayfa motivasyon sözleri.
        </li>
        <li>
          <Link to="/announcements" className="font-medium text-success-400 hover:text-success-300 hover:underline">Duyurular</Link>
          {' '}– Anasayfa duyuruları.
        </li>
      </ul>
    </div>
  );
}
