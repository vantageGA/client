export const SITE_NAME = 'Body Vantage';
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ||
  'https://www.bodyvantage.co.uk';
export const DEFAULT_META_TITLE =
  'Verified Fitness, Beauty & Wellbeing Professionals UK | Body Vantage';
export const DEFAULT_META_DESCRIPTION =
  'Join or find verified fitness, hair, barber, and wellbeing professionals in the UK. Body Vantage helps qualified experts get recognised and trusted.';

export const publicSeoRoutes = [
  {
    path: '/',
    title: DEFAULT_META_TITLE,
    description: DEFAULT_META_DESCRIPTION,
  },
  {
    path: '/about',
    title: 'Professional Verification Platform UK | Body Vantage',
    description:
      'Learn why Body Vantage verifies fitness, beauty, hair, barber, and wellbeing professionals across the UK to support trust and industry standards.',
  },
  {
    path: '/pre-registration',
    title: 'Register as a Professional UK | Body Vantage',
    description:
      'Register as a fitness, barber, hairdresser, beauty, or wellbeing professional in the UK and build trust through Body Vantage verification.',
  },
  {
    path: '/faq',
    title: 'Professional Verification FAQs UK | Body Vantage',
    description:
      'Answers to common questions about Body Vantage professional verification for fitness, barber, hairdresser, beauty, and wellbeing professionals.',
  },
  {
    path: '/contact',
    title: 'Contact Body Vantage | Professional Verification UK',
    description:
      'Contact Body Vantage about UK professional verification, membership, profile support, or general enquiries.',
  },
  {
    path: '/personal-trainers',
    title: 'Verified Personal Trainers UK | Body Vantage',
    description:
      'Find and register verified personal trainers and fitness professionals in the UK through Body Vantage professional verification.',
  },
  {
    path: '/barbers',
    title: 'Verified Barbers UK | Body Vantage',
    description:
      'Body Vantage supports verified barber professionals in the UK with clear qualification, profile, and professional standards information.',
  },
  {
    path: '/hairdressers',
    title: 'Verified Hairdressers UK | Body Vantage',
    description:
      'Find and register verified hairdressers in the UK with Body Vantage professional verification and profile standards.',
  },
  {
    path: '/beauty-professionals',
    title: 'Verified Beauty Professionals UK | Body Vantage',
    description:
      'Body Vantage helps beauty professionals in the UK build trust through verified profiles, qualification information, and professional standards.',
  },
  {
    path: '/wellbeing-practitioners',
    title: 'Verified Wellbeing Practitioners UK | Body Vantage',
    description:
      'Find and register wellbeing practitioners in the UK through Body Vantage professional verification and trusted profile standards.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Body Vantage',
    description:
      'Read the Body Vantage privacy policy for information about how the professional verification platform handles personal data.',
  },
  {
    path: '/cookies',
    title: 'Cookie Policy | Body Vantage',
    description:
      'Read the Body Vantage cookie policy for information about cookies and similar technologies used on the platform.',
  },
];

export const privateSeoRoutes = {
  '/admin-profiles': {
    title: 'Admin Profiles | Body Vantage',
    description: 'Body Vantage profile administration area.',
  },
  '/admin-reviewers': {
    title: 'Admin Reviewers | Body Vantage',
    description: 'Body Vantage reviewer administration area.',
  },
  '/admin-users': {
    title: 'Admin Users | Body Vantage',
    description: 'Body Vantage user administration area.',
  },
  '/forgot-password': {
    title: 'Forgot Password | Body Vantage',
    description: 'Body Vantage password reset request.',
  },
  '/login': {
    title: 'Login | Body Vantage',
    description: 'Log in to Body Vantage.',
  },
  '/profile-edit': {
    title: 'Edit Profile | Body Vantage',
    description: 'Edit your Body Vantage professional profile.',
  },
  '/registration': {
    title: 'Create Account | Body Vantage',
    description: 'Create a Body Vantage account.',
  },
  '/reviewer-forgot-password': {
    title: 'Reviewer Password Reset | Body Vantage',
    description: 'Body Vantage reviewer password reset request.',
  },
  '/reviewer-login': {
    title: 'Reviewer Login | Body Vantage',
    description: 'Log in as a Body Vantage reviewer.',
  },
  '/reviewer-register': {
    title: 'Reviewer Registration | Body Vantage',
    description: 'Create a Body Vantage reviewer account.',
  },
  '/subscribe': {
    title: 'Subscribe | Body Vantage',
    description: 'Body Vantage subscription options.',
  },
  '/subscribe/cancel': {
    title: 'Subscription Cancelled | Body Vantage',
    description: 'Body Vantage subscription cancellation status.',
  },
  '/subscribe/success': {
    title: 'Subscription Successful | Body Vantage',
    description: 'Body Vantage subscription success status.',
  },
  '/user-profile-edit': {
    title: 'Account Settings | Body Vantage',
    description: 'Manage your Body Vantage account settings.',
  },
  '/verify-email': {
    title: 'Verify Email | Body Vantage',
    description: 'Body Vantage email verification.',
  },
  '/verify-email-change': {
    title: 'Verify Email Change | Body Vantage',
    description: 'Body Vantage email change verification.',
  },
};

export const buildAbsoluteUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: buildAbsoluteUrl('/public/logo512.png'),
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const buildBreadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: buildAbsoluteUrl(item.path),
  })),
});
