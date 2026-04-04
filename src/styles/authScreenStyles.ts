import { StyleSheet } from 'react-native';
import { fontFamily } from '../lib/fonts';

/** Shared editorial layout for auth flows (Master Design: Intellectual Sanctuary). */
export const authScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 36,
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 34,
    fontFamily: fontFamily.manrope,
    color: '#191c1e',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamily.publicSans,
    color: '#5c6370',
    lineHeight: 24,
  },
  valueTagline: {
    fontSize: 17,
    fontFamily: fontFamily.publicSansSemibold,
    color: '#191c1e',
    marginTop: 20,
    lineHeight: 26,
  },
  valueBullets: {
    marginTop: 14,
  },
  valueBullet: {
    fontSize: 15,
    fontFamily: fontFamily.publicSans,
    color: '#5c6370',
    lineHeight: 24,
    marginBottom: 8,
  },
  form: {
    width: '100%',
  },
  orLabel: {
    textAlign: 'center',
    marginVertical: 22,
    fontSize: 12,
    fontFamily: fontFamily.publicSansMedium,
    color: 'rgba(25, 28, 30, 0.45)',
    letterSpacing: 2,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  linkMuted: {
    fontSize: 14,
    fontFamily: fontFamily.publicSans,
    color: '#5c6370',
  },
  linkAccent: {
    fontSize: 14,
    fontFamily: fontFamily.publicSansSemibold,
    color: '#131b2e',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: fontFamily.publicSansMedium,
    color: '#5c6370',
  },
  termsText: {
    fontSize: 12,
    fontFamily: fontFamily.publicSans,
    color: '#5c6370',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
