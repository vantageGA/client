import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import './Header.scss';

import logo from '../../assets/logo/logo.svg';

import LoginOut from '../login-out/LoginOut';

import { logoutAction } from '../../store/actions/userActions';
import { reviewLogoutAction } from '../../store/actions/userReviewActions';
import { USER_REVIEW_CREATE_COMMENT_RESET } from '../../store/constants/userReviewConstants';
import BetaReleaseComponent from '../betaRelease/BetaReleaseComponent';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const userReviewLogin = useSelector((state) => state.userReviewLogin);
  const { userReviewInfo } = userReviewLogin;

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/');
  };
  const handleReviewerLogout = () => {
    dispatch({ type: USER_REVIEW_CREATE_COMMENT_RESET });
    dispatch(reviewLogoutAction());
  };

  return (
    <>
      <BetaReleaseComponent />

      <header className="header-container">
          <nav className="nav-wrapper">
            <NavLink
              to="/"
              className={(nav) =>
                `large-tabs ${nav.isActive ? 'is-active' : ''}`
              }
            >
              <img className="image-wrapper" src={logo} alt="Body Vantage Logo - Home" />
            </NavLink>

            <NavLink
              to="/about"
              className={(nav) =>
                `large-tabs ${nav.isActive ? 'is-active' : ''}`
              }
            >
              <span className="tab-label">Info</span>
            </NavLink>

            <NavLink
              to="/contact"
              className={(nav) =>
                `large-tabs ${nav.isActive ? 'is-active' : ''}`
              }
            >
              <span className="tab-label">Contact</span>
            </NavLink>

            {userInfo ? (
              <NavLink
                to="/user-profile-edit"
                className={(nav) =>
                  `large-tabs ${nav.isActive ? 'is-active' : ''}`
                }
              >
                <i className="fa-solid fa-screwdriver-wrench fa-xl"></i>
              </NavLink>
            ) : null}

            {userReviewInfo ? (
              <div className="large-tabs">
                <LoginOut
                  description={userReviewInfo.name}
                  definition="Logout"
                  onClick={handleReviewerLogout}
                />
              </div>
            ) : null}

            {userInfo ? (
              <div className="large-tabs">
                <div className="user-info-wrapper">
                  <div className="members-login--wrapper">
                    {/* Use attribute = definition if its not a link */}

                    <LoginOut
                      description="LOGOUT"
                      definition={
                        <span className="members-login-text">
                          {userInfo.name}
                        </span>
                      }
                      onClick={handleLogout}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {!userInfo && !userReviewInfo ? (
              <NavLink
                to="/login"
              className={(nav) =>
                `large-tabs ${nav.isActive ? 'is-active' : ''}`
              }
            >
              <span className="tab-label">Login</span>
            </NavLink>
          ) : null}
          </nav>
      </header>
    </>
  );
};

export default Header;
