import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';

/**
 * Custom Toast Configuration for VisionAid
 * Provides consistent styling for success, error, and info toasts
 */
export const toastConfig = {
  /*
    Success Toast - Green theme
  */
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
  
  /*
    Error Toast - Red theme
  */
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
  
  /*
    Info Toast - Blue theme
  */
  info: (props: any) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
  
  /*
    Warning Toast - Orange theme (custom)
  */
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={styles.warningToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#10B981',
    borderLeftWidth: 6,
    backgroundColor: '#ECFDF5',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 12,
  },
  errorToast: {
    borderLeftColor: '#EF4444',
    borderLeftWidth: 6,
    backgroundColor: '#FEF2F2',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 12,
  },
  infoToast: {
    borderLeftColor: '#3B82F6',
    borderLeftWidth: 6,
    backgroundColor: '#EFF6FF',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 12,
  },
  warningToast: {
    borderLeftColor: '#F59E0B',
    borderLeftWidth: 6,
    backgroundColor: '#FFFBEB',
    height: 'auto',
    minHeight: 60,
    paddingVertical: 12,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
  },
});

/**
 * Helper functions for common toast messages
 */
export const showToast = {
  success: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  
  error: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  
  info: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  
  warning: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3500,
    });
  },
};
