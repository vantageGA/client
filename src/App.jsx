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
import AboutView from './views/aboutView/AboutView';
import FaqsView from './views/faqsView/FaqsView';
import PreRegistrationView from './views/preRegistrationView/PreRegistrationView';
import SubscriptionOptions from './views/subscriptionView/SubscriptionOptions';
import SubscriptionSuccess from './views/subscriptionView/SubscriptionSuccess';
import SubscriptionCancel from './views/subscriptionView/SubscriptionCancel';

// Change the display width by removing the --fluid after the container class
const App = () => {
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
              element={<UserProfileEditView />}
              exact
            />
            <Route path="/profile-edit" element={<ProfileEditView />} exact />
            <Route
              path="/fullProfile/:id"
              element={<FullProfileView />}
              exact
            />
            <Route path="/contact" element={<ContactFormView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/pre-registration" element={<PreRegistrationView />} />
            <Route path="/faq" element={<FaqsView />} />
            <Route path="/cookies" element={<CookiesView />} />
            <Route path="/privacy" element={<PrivacyView />} />
            <Route path="/login" element={<LoginFormView />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/registration" element={<RegistrationView />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email-change" element={<VerifyEmailChange />} />
            <Route path="/admin-users" element={<AdminUserView />} />
            <Route path="/admin-profiles" element={<AdminProfileView />} />
            <Route path="/admin-reviewers" element={<AdminReviewersView />} />
            <Route path="/reviewer-login" element={<ReviewerLoginView />} />
            <Route
              path="/reviewer-register"
              element={<ReviewerRegisterView />}
            />
            <Route
              path="/reviewer-forgot-password"
              element={<ReviewerForgotPassword />}
            />
            <Route
              path="/reviewer-reset-password/:token"
              element={<ReviewerResetPassword />}
            />
            <Route path="/subscribe" element={<SubscriptionOptions />} exact />
            <Route path="/subscribe/success" element={<SubscriptionSuccess />} exact />
            <Route path="/subscribe/cancel" element={<SubscriptionCancel />} exact />
            <Route path="*" element={<ErrorView />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
