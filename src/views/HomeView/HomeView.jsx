import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { profilesAction } from '../../store/actions/profileActions';
import './HomeView.scss';

import SearchInput from '../../components/searchInput/SearchInput';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import Message from '../../components/message/Message';
import Card from '../../components/card/Card';
import BodyVantage from '../../components/bodyVantage/BodyVantage';

const HomeView = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 20;

  useEffect(() => {
    dispatch(profilesAction(currentPage, profilesPerPage));
  }, [dispatch, currentPage]);

  const profilesState = useSelector((state) => state.profiles);
  const { loading, error, profiles, page, pages, total } = profilesState;

  const [keyword, setKeyword] = useState('');
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

  const searchedProfiles = (profiles || []).filter((profile) => {
    const searchTerms = keyword.trim().toLowerCase();

    if (!searchTerms) return false;

    // Get keywords array from profile
    const keywords = Array.isArray(profile?.keywords)
      ? profile.keywords.map(k => k.toLowerCase())
      : [];

    if (keywords.length === 0) return false;

    // Split search into individual words for multi-keyword matching
    const searchWords = searchTerms.split(/\s+/).filter(word => word.length > 0);

    // ALL search words must match at least one keyword (exact match or contains)
    // This ensures "fitness guildford gym" finds profiles with all 3 keywords
    return searchWords.every(searchWord =>
      keywords.some(keyword => keyword.includes(searchWord))
    );
  });

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
    return text.length > 180 ? `${text.slice(0, 180)}...` : text;
  };

  return (
    <>
      <section className="home-hero-section" aria-label="Trainer Search">
        <h1 className="sr-only">Find a trainer near you</h1>
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
              <div className="main-heading">
                <BodyVantage />
              </div>
            </>
          )}

          <div className="search-input-position">
            <SearchInput
              id="trainer-search"
              type="search"
              value={keyword}
              handleSearch={handleSearch}
              placeholder="Search 'fat loss Guildford' for example"
              ariaLabel="Search for trainers by specialty or location"
              ariaDescribedBy="search-hint"
            />
            <div id="search-hint" className="sr-only">
              Enter keywords like 'fat loss', 'strength training' or location names
            </div>
            {keyword.length > 0 ? (
              <div
                className="keyword-length"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <span className="keyword-length-highlight">
                  {searchedProfiles.length}
                </span>{' '}
                {searchedProfiles.length === 1 ? 'profile' : 'profiles'} found that match your search criteria.
              </div>
            ) : null}
          </div>

          <div className="home-view">
            {keyword.length > 0 && (
              <div className="card-wrapper">
                {loading ? (
                  <div className="loading-container">
                    <LoadingSpinner />
                    <p>Loading trainers...</p>
                  </div>
                ) : searchedProfiles.length > 0 ? (
                  searchedProfiles.map((profile) => (
                    <div key={profile?._id}>
                      <Card
                        specialisationOne={
                          profile?.specialisationOne?.length
                            ? profile?.specialisationOne
                            : 'Personal Trainer'
                        }
                        specialisationTwo={
                          profile?.specialisationTwo?.length
                            ? profile?.specialisationTwo
                            : 'Personal Trainer'
                        }
                        specialisationThree={
                          profile?.specialisationThree?.length
                            ? profile?.specialisationThree
                            : 'Personal Trainer'
                        }
                        specialisationFour={
                          profile?.specialisationFour?.length
                            ? profile?.specialisationFour
                            : 'Personal Trainer'
                        }
                        id={profile?._id}
                        name={
                          <>{highlightKeywordMatch(profile?.name || '')}</>
                        }
                        src={profile?.profileImage}
                        alt={profile?.name}
                        description={
                          <p>{truncateDescription(profile?.description || '')}</p>
                        }
                        rating={profile?.rating}
                        number
                        of
                        reviews={profile?.numReviews}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <p>No trainers found matching "{keyword}"</p>
                    <p>Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls - only show when not searching */}
            {!keyword && pages > 1 && (
              <div className="pagination-wrapper" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                padding: '20px',
                marginTop: '20px'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                  aria-label="Previous page"
                >
                  Previous
                </button>

                <span style={{ padding: '0 15px' }}>
                  Page {page} of {pages} ({total} total profiles)
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pages}
                  style={{
                    padding: '8px 16px',
                    cursor: currentPage === pages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === pages ? 0.5 : 1
                  }}
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
