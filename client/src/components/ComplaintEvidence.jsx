import { useEffect, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { apiRequestBlob } from '../lib/api.js';

export default function ComplaintEvidence({ complaintId, images = [] }) {
  const [loadedImages, setLoadedImages] = useState([]);
  const [loading, setLoading] = useState(images.length > 0);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const objectUrls = [];

    if (!images.length) {
      setLoadedImages([]);
      setLoading(false);
      setError('');
      return () => { active = false; };
    }

    setLoading(true);
    setError('');
    Promise.all(images.map(async (image) => {
      const blob = await apiRequestBlob(`/complaints/${encodeURIComponent(complaintId)}/images/${encodeURIComponent(image.id)}`);
      const url = URL.createObjectURL(blob);
      objectUrls.push(url);
      return { ...image, url };
    })).then((result) => {
      if (active) setLoadedImages(result);
      else objectUrls.forEach((url) => URL.revokeObjectURL(url));
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [complaintId, images]);

  return (
    <section className="citizen-form-card complaint-evidence">
      <div className="citizen-form-card__heading"><h2>Evidence images</h2><p>Photographs attached to this report.</p></div>
      {loading && <p className="complaint-evidence__empty">Loading evidence…</p>}
      {!loading && error && <p className="complaint-evidence__empty" role="alert">{error}</p>}
      {!loading && !error && loadedImages.length === 0 && <div className="complaint-evidence__empty"><ImageIcon size={18} /><span>No evidence images were attached.</span></div>}
      {!loading && !error && loadedImages.length > 0 && <div className="complaint-evidence__grid">{loadedImages.map((image) => (
        <a className="complaint-evidence__item" href={image.url} target="_blank" rel="noreferrer" key={image.id}>
          <img src={image.url} alt={image.displayName || 'Complaint evidence'} />
          <div><strong>{image.displayName}</strong><span>{(image.size / 1024).toFixed(0)} KB</span></div>
        </a>
      ))}</div>}
    </section>
  );
}
