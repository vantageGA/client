import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    dispatch(profilesAction());
  }, [dispatch]);

  const profilesState = useSelector((state) => state.profiles);
  const { loading, error, profiles } = profilesState;

  const [keyword, setKeyword] = useState('');
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setHeroImage((current) => {
        if (current) return current;
        const randomIdx = Math.floor(Math.random() * profiles.length);
        return profiles[randomIdx]?.profileImage || null;
      });
    }
  }, [profiles]);

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const searchedProfiles = profiles.filter((profile) => {
    const description = profile?.description || '';
    const name = profile?.name || '';
    const location = Array.isArray(profile?.location)
      ? profile.location.join(' ')
      : profile?.location || '';
    const specialisation = profile?.specialisation || '';
    const keyWordSearch = profile?.keyWordSearch || '';

    const haystack = `${description} ${location} ${name} ${specialisation}`.toLowerCase();
    const needle = keyword.trim().toLowerCase();

    if (!needle) return false;

    return (
      haystack.includes(needle) ||
      keyWordSearch.toLowerCase().includes(needle)
    );
  });

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
        <span
          key={`hl-${idx}`}
          style={{
            color: 'rgba(255, 255, 255, 0.6)',
            textDecoration: 'underline',
          }}
        >
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
      <fieldset className="fieldSet">
        <legend>{keyword.length > 0 ? null : 'Find a trainer near you'}</legend>
        {error ? <Message message={error} /> : null}

        <div
          style={{
            backgroundImage:
              heroImage && profiles.length > 0 ? `url(${heroImage})` : null,
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
              type="search"
              value={keyword}
              handleSearch={handleSearch}
              placeholder="Search 'fat loss Guildford' for example"
            />
            {keyword.length > 0 ? (
              <div className="keyword-length">
                <span className="keyword-length-highlight">
                  {searchedProfiles.length}
                </span>{' '}
                profile[s] found that match your search criteria.
              </div>
            ) : null}
          </div>

          <div className="home-view">
            {keyword.length > 0 ? (
              <div className="card-wrapper">
                {searchedProfiles.map((profile) =>
                  loading ? (
                    <LoadingSpinner />
                  ) : (
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
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>
    </>
  );
};

export default HomeView;
