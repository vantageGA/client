import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { profilesAction } from '../../store/actions/profileActions';
import './HomeView.scss';

import SearchInput from '../../components/searchInput/SearchInput';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import Card from '../../components/card/Card';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import PageMeta from '../../components/seo/PageMeta';
import {
  buildBreadcrumbJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from '../../config/seo';

const HomeView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const initialSearchTerm = searchParams.get('search') || '';
  const [keyword, setKeyword] = useState(initialSearchTerm);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialSearchTerm);
  const lastSearchParamString = useRef(searchParams.toString());
  const skipNextUrlWrite = useRef(false);
  const profilesPerPage = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextKeyword = keyword.trim();
      setDebouncedKeyword(nextKeyword);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    dispatch(
      profilesAction(
        currentPage,
        profilesPerPage,
        debouncedKeyword ? { search: debouncedKeyword } : {},
      ),
    );
  }, [dispatch, currentPage, debouncedKeyword]);

  useEffect(() => {
    const currentSearchParamString = searchParams.toString();
    const urlSearchTerm = searchParams.get('search') || '';

    if (currentSearchParamString === lastSearchParamString.current) {
      return;
    }

    lastSearchParamString.current = currentSearchParamString;

    if (urlSearchTerm !== keyword) {
      skipNextUrlWrite.current = true;
      setKeyword(urlSearchTerm);
    }
  }, [keyword, searchParams]);

  useEffect(() => {
    if (skipNextUrlWrite.current) {
      skipNextUrlWrite.current = false;
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    if (debouncedKeyword) {
      nextSearchParams.set('search', debouncedKeyword);
    } else {
      nextSearchParams.delete('search');
    }

    const nextSearchParamString = nextSearchParams.toString();

    if (nextSearchParamString !== searchParams.toString()) {
      lastSearchParamString.current = nextSearchParamString;
      setSearchParams(nextSearchParams, { replace: true });
    }
  }, [debouncedKeyword, searchParams, setSearchParams]);

  const profilesState = useSelector((state) => state.profiles);
  const { loading, error, profiles, page, pages, total } = profilesState;

  const defaultHero =
    'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(40,40,40,0.6))';
  // Store only an image URL; default gradient is applied separately so we always have a backdrop.
  const [heroImage, setHeroImage] = useState(null);
  const lastImagePoolKey = useRef('');
  const brokenImages = useRef(new Set());

  // Function to validate if an image URL is loadable
  const validateImage = (url) => {
    return new Promise((resolve) => {
      // Skip if we already know it's broken
      if (brokenImages.current.has(url)) {
        resolve(false);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS properly
      img.onload = () => resolve(true);
      img.onerror = () => {
        // Catches 404s, CORS errors, and OpaqueResponseBlocking
        brokenImages.current.add(url);
        resolve(false);
      };
      img.src = url;
    });
  };

  useEffect(() => {
    // Don't clear the image while still loading - wait for data
    if (loading) {
      return;
    }

    // Only clear if we know for certain there are no profiles
    if (!profiles || profiles.length === 0) {
      setHeroImage(null);
      return;
    }

    const availableImages = profiles
      .map((p) => p?.profileImage)
      .filter(Boolean);

    // Only clear if we know for certain there are no images
    if (availableImages.length === 0) {
      setHeroImage(null);
      return;
    }

    const poolKey = availableImages.join('|');

    // If the pool hasn't changed, keep the current image.
    if (poolKey === lastImagePoolKey.current) {
      return;
    }

    // Validate images and pick a random valid one
    const selectValidImage = async () => {
      // Filter out known broken images first
      const candidateImages = availableImages.filter(
        (img) => !brokenImages.current.has(img)
      );

      if (candidateImages.length === 0) {
        // All images are broken, clear hero image
        setHeroImage(null);
        lastImagePoolKey.current = poolKey;
        return;
      }

      // Validate images in parallel
      const validationResults = await Promise.all(
        candidateImages.map(async (url) => ({
          url,
          valid: await validateImage(url),
        }))
      );

      const validImages = validationResults
        .filter((result) => result.valid)
        .map((result) => result.url);

      if (validImages.length === 0) {
        // No valid images found
        setHeroImage(null);
      } else {
        // Pick a random valid image, avoiding the previous one if possible
        setHeroImage((prevImage) => {
          const pool =
            validImages.length > 1
              ? validImages.filter((img) => img !== prevImage)
              : validImages;
          const randomIdx = Math.floor(Math.random() * pool.length);
          return pool[randomIdx] ?? null;
        });
      }

      lastImagePoolKey.current = poolKey;
    };

    selectValidImage();
  }, [profiles, loading]);

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const visibleProfiles = profiles || [];
  const isSearching = keyword.trim().length > 0;
  const isSearchPending = keyword.trim() !== debouncedKeyword;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };

  const highlightKeywordMatch = (current) => {
    const safeCurrent = current || '';
    const trimmed = keyword.trim();
    if (!trimmed) return safeCurrent;

    const escaped = escapeRegex(trimmed);
    const reggie = new RegExp(`(${escaped})`, 'ig');
    const parts = safeCurrent.split(reggie);

    return parts.map((part, idx) =>
      part.toLowerCase() === trimmed.toLowerCase() ? (
        <span key={`hl-${idx}`} className="search-highlight">
          {part}
        </span>
      ) : (
        <span key={`txt-${idx}`}>{part}</span>
      ),
    );
  };

  const truncateDescription = (text) => {
    if (!text) return '';
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    return plainText.length > 180 ? `${plainText.slice(0, 180)}...` : plainText;
  };

  return (
    <>
      <PageMeta
        title="Verified Fitness, Beauty & Wellbeing Professionals UK | Body Vantage"
        description="Join or find verified fitness, hair, barber, and wellbeing professionals in the UK. Body Vantage helps qualified experts get recognised and trusted."
        canonicalPath="/"
        jsonLd={[
          organizationJsonLd,
          websiteJsonLd,
          buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }]),
        ]}
      />
      <section className="home-hero-section" aria-label="Professional Search">
        {error && (
          <div role="alert" aria-live="assertive">
            <Message message={error} />
          </div>
        )}

        <div
          style={{
            // Always apply the gradient, and layer the hero image when present.
            backgroundImage: heroImage
              ? `${defaultHero}, url(${heroImage})`
              : defaultHero,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            paddingBottom: '1rem',
          }}
          className="input-wrapper"
        >
          {keyword.length > 0 ? null : (
            <>
              <div className="home-hero-copy">
                <h1>Verified Professionals. Trusted by Clients.</h1>
              </div>
            </>
          )}

          <div
            className="search-input-position"
            id="verified-professional-directory"
          >
            <SearchInput
              id="professional-search"
              type="search"
              value={keyword}
              handleSearch={handleSearch}
              placeholder="Search 'barber', 'hairdresser', 'personal trainer' or a location"
              ariaLabel="Search for verified professionals by specialty or location"
              ariaDescribedBy="search-hint"
            />
            <div id="search-hint" className="sr-only">
              Enter keywords like barber, hairdresser, personal trainer, beauty professional or location names
            </div>
            {keyword.length > 0 ? (
              <div
                className="keyword-length"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {isSearchPending ? (
                  'Searching...'
                ) : (
                  <>
                    <span className="keyword-length-highlight">
                      {total || 0}
                    </span>{' '}
                    {total === 1 ? 'profile' : 'profiles'} found that match your search criteria.
                  </>
                )}
              </div>
            ) : null}
          </div>

          {keyword.length > 0 ? null : (
            <>
              <div className="home-hero-copy">
                <p>
                  <BodyVantage /> is the UK's professional registration and
                  verification platform for fitness, beauty, and wellbeing
                  professionals.
                </p>
                <p>
                  From personal trainers to barbers and hairdressers, we help
                  qualified professionals stand out and build trust instantly.
                </p>
                <nav
                  className="home-sector-links"
                  aria-label="Browse professional sectors"
                >
                  <Link to="/personal-trainers">Personal trainers</Link>
                  <Link to="/barbers">Barbers</Link>
                  <Link to="/hairdressers">Hairdressers</Link>
                  <Link to="/beauty-professionals">Beauty professionals</Link>
                  <Link to="/wellbeing-practitioners">Wellbeing practitioners</Link>
                </nav>
                <div className="home-hero-actions">
                  <Button
                    type="button"
                    text="Get Registered"
                    disabled={false}
                    onClick={() => navigate('/pre-registration')}
                    title="Get registered with Body Vantage"
                  />
                  <Button
                    type="button"
                    text="Verify My Qualifications"
                    disabled={false}
                    onClick={() => navigate('/login')}
                    title="Log in to verify your qualifications"
                  />
                </div>
              </div>
            </>
          )}

          <div className="home-view">
            {keyword.length > 0 && (
              <div className="card-wrapper">
                {loading || isSearchPending ? (
                  <div className="loading-container">
                    <LoadingSpinner />
                    <p>Loading professionals...</p>
                  </div>
                ) : visibleProfiles.length > 0 ? (
                  visibleProfiles.map((profile) => (
                    <div key={profile?._id}>
                      <Card
                        specialisationOne={profile?.specialisationOne || null}
                        specialisationTwo={profile?.specialisationTwo || null}
                        specialisationThree={profile?.specialisationThree || null}
                        specialisationFour={profile?.specialisationFour || null}
                        id={profile?._id}
                        name={
                          <>{highlightKeywordMatch(profile?.name || '')}</>
                        }
                        src={profile?.profileImage}
                        alt={profile?.name}
                        description={
                          <p>{truncateDescription(profile?.description || '')}</p>
                        }
                        qualificationVerificationStatus={
                          profile?.qualificationVerificationStatus
                        }
                        isQualificationsVerified={profile?.isQualificationsVerified}
                        rating={profile?.rating}
                        reviews={profile?.numReviews}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No professionals found matching "{keyword}"</p>
                    <p>Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            )}

            {pages > 1 && (
              <div className="pagination-wrapper">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  Previous
                </button>

                <span>
                  Page {page} of {pages} ({total} total{' '}
                  {isSearching ? 'matching profiles' : 'profiles'})
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeView;
