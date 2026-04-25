import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomeView from './views/HomeView/HomeView';
import ContactFormView from './views/contactFormView/ContactFormView';
import LoginFormView from './views/loginFormView/LoginFormView';
import ForgotPassword from './views/forgotPassword/ForgotPassword';
import ResetPassword from './views/resetPassword/ResetPassword';
import VerifyEmail from './views/verifyEmail/VerifyEmail';
import VerifyEmailChange from './views/verifyEmailChange/VerifyEmailChange';
import ErrorView from './views/errorView/ErrorView';
import RegistrationView from './views/registrationView/RegistrationView';
import FullProfileView from './views/fullProfile/FullProfileView';
import UserProfileEditView from './views/userProfileEditView/UserProfileEditView';
import ProfileEditView from './views/profileEditView/ProfileEditView';
import AdminUserView from './views/adminUserView/AdminUserView';
import AdminProfileView from './views/adminProfileView/AdminProfileView';
import AdminReviewersView from './views/adminReviewersView/AdminReviewersView';
import ReviewerLoginView from './views/reviewerLoginView/ReviewerLoginView';
import ReviewerRegisterView from './views/reviewerRegisterView/ReviewerRegisterView';
import ReviewerForgotPassword from './views/reviewerForgotPassword/ReviewerForgotPassword';
import ReviewerResetPassword from './views/reviewerResetPassword/ReviewerResetPassword';
import CookiesView from './views/cookiesView/CookiesView';
import PrivacyView from './views/privacyView/PrivacyView';
import Cookies from './components/cookies/Cookies';
import RouteMeta from './components/seo/RouteMeta';
import AboutView from './views/aboutView/AboutView';
import FaqsView from './views/faqsView/FaqsView';
import PreRegistrationView from './views/preRegistrationView/PreRegistrationView';
import SectorLandingView from './views/sectorLandingView/SectorLandingView';
import SubscriptionOptions from './views/subscriptionView/SubscriptionOptions';
import SubscriptionSuccess from './views/subscriptionView/SubscriptionSuccess';
import SubscriptionCancel from './views/subscriptionView/SubscriptionCancel';

// Change the display width by removing the --fluid after the container class
const App = () => {
  const privateElement = (element) => <RouteMeta>{element}</RouteMeta>;

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="container--fluid">
        <Header />
        <div className="content-wrapper">
          {/* <Cookies /> */}
          <Routes>
            <Route path="/" element={<HomeView />} exact />

            <Route
              path="/user-profile-edit"
              element={privateElement(<UserProfileEditView />)}
              exact
            />
            <Route
              path="/profile-edit"
              element={privateElement(<ProfileEditView />)}
              exact
            />
            <Route
              path="/fullProfile/:id"
              element={<FullProfileView />}
              exact
            />
            <Route path="/contact" element={<ContactFormView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/pre-registration" element={<PreRegistrationView />} />
            <Route path="/faq" element={<FaqsView />} />
            <Route
              path="/personal-trainers"
              element={<SectorLandingView sectorSlug="personal-trainers" />}
            />
            <Route path="/barbers" element={<SectorLandingView sectorSlug="barbers" />} />
            <Route
              path="/hairdressers"
              element={<SectorLandingView sectorSlug="hairdressers" />}
            />
            <Route
              path="/beauty-professionals"
              element={<SectorLandingView sectorSlug="beauty-professionals" />}
            />
            <Route
              path="/wellbeing-practitioners"
              element={<SectorLandingView sectorSlug="wellbeing-practitioners" />}
            />
            <Route path="/cookies" element={<CookiesView />} />
            <Route path="/privacy" element={<PrivacyView />} />
            <Route path="/login" element={privateElement(<LoginFormView />)} />
            <Route
              path="/forgot-password"
              element={privateElement(<ForgotPassword />)}
            />
            <Route
              path="/registration"
              element={privateElement(<RegistrationView />)}
            />
            <Route
              path="/reset-password/:token"
              element={privateElement(<ResetPassword />)}
            />
            <Route
              path="/verify-email"
              element={privateElement(<VerifyEmail />)}
            />
            <Route
              path="/verify-email-change"
              element={privateElement(<VerifyEmailChange />)}
            />
            <Route
              path="/admin-users"
              element={privateElement(<AdminUserView />)}
            />
            <Route
              path="/admin-profiles"
              element={privateElement(<AdminProfileView />)}
            />
            <Route
              path="/admin-reviewers"
              element={privateElement(<AdminReviewersView />)}
            />
            <Route
              path="/reviewer-login"
              element={privateElement(<ReviewerLoginView />)}
            />
            <Route
              path="/reviewer-register"
              element={privateElement(<ReviewerRegisterView />)}
            />
            <Route
              path="/reviewer-forgot-password"
              element={privateElement(<ReviewerForgotPassword />)}
            />
            <Route
              path="/reviewer-reset-password/:token"
              element={privateElement(<ReviewerResetPassword />)}
            />
            <Route
              path="/subscribe"
              element={privateElement(<SubscriptionOptions />)}
              exact
            />
            <Route
              path="/subscribe/success"
              element={privateElement(<SubscriptionSuccess />)}
              exact
            />
            <Route
              path="/subscribe/cancel"
              element={privateElement(<SubscriptionCancel />)}
              exact
            />
            <Route path="*" element={<ErrorView />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
