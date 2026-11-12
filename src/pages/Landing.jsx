
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api';
import Brand from '../components/Brand';
import heroBg from '../assets/Landing.png';

const sample = [['Category', 30, 30], ['Location', 22, 25], ['Brand', 15, 15], ['Color', 15, 15], ['Date', 10, 10], ['Description', 3, 5]];

const steps = [
  ['Report', 'Add what you lost or found, with photos and the place.'],
  ['Match', 'REFOUND compares category, place, brand, color, date and details.'],
  ['Verify', 'The owner answers questions only they could answer. The finder or an admin reviews.'],
  ['Return', 'Chat, meet, and both confirm the handover.'],
];

export default function Landing() {
  const user = useSelector((s) => s.auth.user);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/public/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  const home = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : null;

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative bg-cover bg-right bg-no-repeat" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/80 to-transparent lg:via-cream/40" />
        <div className="relative mx-auto max-w-6xl px-5">
          <header className="flex items-center justify-between py-5">
            <Brand />
            <Link to="/admin/login" className="text-sm font-bold text-xl text-forest/80 underline-offset-4 hover:underline">Admin sign in</Link>
          </header>

          <div className="max-w-xl pb-24 pt-12 lg:pb-36 lg:pt-16">
            <h1 className="text-6xl font-bold leading-none tracking-tight sm:text-8xl text-forest" style={{ fontFamily: 'Lemonada' }}>ReFound</h1>
            <p className="mt-6 text-xl text-forest/80">Lost something? Found something? We compare every report and help the right item reach the right person.</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {home ? (
                <Link to={home} className="btn btn-primary px-6 py-3">Go to your dashboard</Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary px-6 py-3">Sign up</Link>
                  <Link to="/login" className="btn btn-outline px-6 py-3">Log in</Link>
                </>
              )}
            </div>

            {stats && <p className="mt-8 text-sm text-forest/70"><strong className="text-forest">{stats.recovered}</strong> items returned · <strong className="text-forest">{stats.reported}</strong> reports · <strong className="text-forest">{stats.members}</strong> members</p>}
          </div>
        </div>
      </section>

      <section className="bg-mist/60 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-semibold text-forest">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, text], i) => (
              <li key={title}>
                <span className="font-heading text-4xl font-bold text-moss">{i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-forest">{title}</h3>
                <p className="mt-1 text-sm text-forest/75">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-forest/70">
        <Brand />
        <span>Everything stays private until a claim is approved.</span>
      </footer>
    </div>
  );
}
