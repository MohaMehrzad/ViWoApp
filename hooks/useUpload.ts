import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '@/services/api/upload';
import * as ImagePicker from 'expo-image-picker';

export function useImagePicker() {
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required!');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }

    return null;
  };

  return { pickImage };
}

export function useVideoPicker() {
  const pickVideo = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library is required!');
    }

    // Pick video
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0];
    }

    return null;
  };

  return { pickVideo };
}

export function useImageUpload() {
  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      uploadApi.uploadImage(file),
  });
}

export function useVideoUpload() {
  return useMutation({
    mutationFn: (file: { uri: string; name: string; type: string }) =>
      uploadApi.uploadVideo(file),
  });
}

