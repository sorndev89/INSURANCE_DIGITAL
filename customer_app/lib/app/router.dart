import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/agent/agent_form_screen.dart';
import '../features/agent/agent_terms_screen.dart';
import '../features/auth/forgot_password_screen.dart';
import '../features/auth/kyc_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/otp_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/register_success_screen.dart';
import '../features/home/home_screen.dart';
import '../features/home/main_shell.dart';
import '../features/home/services_screen.dart';
import '../features/news/news_detail_screen.dart';
import '../features/news/news_screen.dart';
import '../features/onboarding/landing_screen.dart';
import '../features/onboarding/splash_screen.dart';
import '../features/onboarding/welcome_screen.dart';
import '../features/policies/policies_screen.dart';
import '../features/policies/policy_detail_screen.dart';
import '../features/profile/about_screen.dart';
import '../features/profile/change_password_screen.dart';
import '../features/profile/edit_profile_screen.dart';
import '../features/profile/language_screen.dart';
import '../features/profile/points_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/profile/terms_screen.dart';
import '../features/purchase/category_screen.dart';
import '../features/purchase/plan_screen.dart';
import '../features/purchase/purchase_wizard_screen.dart';
import '../features/purchase/vehicle_type_screen.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();
final shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/welcome', builder: (context, state) => const WelcomeScreen()),
    GoRoute(path: '/onboarding', builder: (context, state) => const LandingScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(path: '/otp', builder: (context, state) => const OtpScreen()),
    GoRoute(
      path: '/register-success',
      builder: (context, state) => const RegisterSuccessScreen(),
    ),
    GoRoute(path: '/kyc', builder: (context, state) => const KycScreen()),
    ShellRoute(
      navigatorKey: shellNavigatorKey,
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
        GoRoute(path: '/services', builder: (context, state) => const ServicesScreen()),
        GoRoute(path: '/news', builder: (context, state) => const NewsScreen()),
        GoRoute(path: '/policies', builder: (context, state) => const PoliciesScreen()),
        GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
      ],
    ),
    GoRoute(
      path: '/news/:id',
      builder: (context, state) => NewsDetailScreen(id: state.pathParameters['id'] ?? ''),
    ),
    GoRoute(
      path: '/policies/:id',
      builder: (context, state) => PolicyDetailScreen(id: state.pathParameters['id'] ?? ''),
    ),
    GoRoute(
      path: '/purchase/category',
      builder: (context, state) => const CategoryScreen(),
    ),
    GoRoute(path: '/purchase/plan', builder: (context, state) => const PlanScreen()),
    GoRoute(
      path: '/purchase/vehicle-type',
      builder: (context, state) => const VehicleTypeScreen(),
    ),
    GoRoute(
      path: '/purchase/wizard',
      builder: (context, state) => const PurchaseWizardScreen(),
    ),
    GoRoute(path: '/profile/edit', builder: (context, state) => const EditProfileScreen()),
    GoRoute(
      path: '/profile/password',
      builder: (context, state) => const ChangePasswordScreen(),
    ),
    GoRoute(
      path: '/profile/language',
      builder: (context, state) => const LanguageScreen(),
    ),
    GoRoute(path: '/profile/points', builder: (context, state) => const PointsScreen()),
    GoRoute(path: '/profile/terms', builder: (context, state) => const TermsScreen()),
    GoRoute(path: '/profile/about', builder: (context, state) => const AboutScreen()),
    GoRoute(path: '/agent/terms', builder: (context, state) => const AgentTermsScreen()),
    GoRoute(path: '/agent/form', builder: (context, state) => const AgentFormScreen()),
  ],
);
