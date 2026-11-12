import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import PageHeader, { Empty, Spinner } from '../components/PageHeader';
import ItemCard from '../components/ItemCard';

const initial = { q: '', type: '', category: '', color: '', location: '', status: '' };

export default function Browse() {
  const [filters, setFilters] = useState(initial);
  const [near, setNear] = useState(null);
  const [radius, setRadius] = useState(10);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  // Update filters
  const set = (k) => (e) => {
    setFilters((prev) => ({ ...prev, [k]: e.target.value }));
    setPage(1);
  };

  // Fetch categories from MongoDB
  useEffect(() => {
    let active = true;

    const getCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (active) setCategories(data);
      } catch (err) {
        console.log('Category Error:', errMsg(err));
      }
    };

    getCategories();

    return () => {
      active = false;
    };
  }, []);

  // Fetch real items from MongoDB
  useEffect(() => {
    let active = true;

    const getItems = async () => {
      try {
        setLoading(true);
        setError('');

        const params = { ...filters, page, limit: 12 };

        Object.keys(params).forEach((k) => {
          if (params[k] === '') delete params[k];
        });

        if (near) {
          params.lat = near.lat;
          params.lng = near.lng;
          params.radius = radius;
        }

        const { data } = await api.get('/items', { params });

        if (active) {
          setResult(data);
        }

      } catch (err) {
        console.log('Browse Items Error:', err.response?.data || err.message);

        if (active) {
          setError(errMsg(err));
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const t = setTimeout(() => {
      getItems();
    }, 300);

    return () => {
      active = false;
      clearTimeout(t);
    };

  }, [filters, page, near, radius, retry]);

  // Nearby items
  const toggleNear = () => {
    if (near) {
      setNear(null);
      setPage(1);
      return;
    }

    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Your browser does not support location access.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setNear({ lat: p.coords.latitude, lng: p.coords.longitude });
        setPage(1);
      },
      () => setGeoError('Allow location access to search nearby items.')
    );
  };

  return (
    <>
      <PageHeader title="Browse items" subtitle="Search every open lost and found report." />

      <div className="card mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <input className="input sm:col-span-2" placeholder="Search by name, brand or description" aria-label="Search" value={filters.q} onChange={set('q')} />

        <select className="input" aria-label="Type" value={filters.type} onChange={set('type')}>
          <option value="">Lost and found</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <select className="input" aria-label="Category" value={filters.category} onChange={set('category')}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>

        <input className="input" placeholder="Color" aria-label="Color" value={filters.color} onChange={set('color')} />

        <input className="input" placeholder="Location" aria-label="Location" value={filters.location} onChange={set('location')} />

        <select className="input" aria-label="Status" value={filters.status} onChange={set('status')}>
          <option value="">Open items</option>
          <option value="REPORTED">Reported</option>
          <option value="POTENTIAL_MATCH">Potential match</option>
          <option value="UNDER_CLAIM">Under claim</option>
          <option value="RECOVERED">Recovered</option>
        </select>

        <div className="flex gap-2">
          <button type="button" onClick={toggleNear} className={`btn flex-1 ${near ? 'btn-primary' : 'btn-outline'}`} aria-pressed={!!near}>
            {near ? 'Near me: on' : 'Near me'}
          </button>

          {near && (
            <select className="input w-24" aria-label="Radius" value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
              {[2, 5, 10, 25, 50].map((r) => <option key={r} value={r}>{r} km</option>)}
            </select>
          )}
        </div>

        {geoError && <p className="text-sm text-rust sm:col-span-2 lg:col-span-4">{geoError}</p>}

      </div>

      {/* Loading */}
      {loading && <Spinner />}

      {/* Error */}
      {!loading && error && (
        <Empty>
          <p className="text-rust">{error}</p>
          <button className="btn btn-outline mt-4" onClick={() => setRetry((prev) => prev + 1)}>Try Again</button>
        </Empty>
      )}

      {/* Items */}
      {!loading && !error && result && (
        result.items.length === 0 ? (
          <Empty>No items match these filters.</Empty>
        ) : (
          <>
            <p className="mb-3 text-sm text-forest/70">{result.total} item{result.total !== 1 && 's'}</p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.items.map((i) => <ItemCard key={i._id} item={i} />)}
            </div>

            {result.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                <span className="text-sm">Page {result.page} of {result.pages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= result.pages} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            )}
          </>
        )
      )}

    </>
  );
}