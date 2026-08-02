import { Platform, Alert } from 'react-native';

export const downloadAndOpenFile = (
  data: any,
  filename: string,
  mimeType: string
) => {
  try {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Alert.alert('Download Complete', `${filename} saved successfully.`);
    } else {
      // Mobile handling (Expo / React Native)
      Alert.alert(
        'Statement Generated',
        `${filename} generated successfully! Check your downloads or statement folder.`
      );
    }
  } catch (err: any) {
    console.error('File download error:', err);
    Alert.alert('Download Error', err?.message || 'Failed to download file.');
  }
};
