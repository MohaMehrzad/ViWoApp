import apiClient from './client';

export interface UploadResponse {
  url: string;
  type: 'image' | 'video';
}

export const uploadApi = {
  /**
   * Upload an image file
   */
  uploadImage: async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await apiClient.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Upload a video file
   */
  uploadVideo: async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await apiClient.post<UploadResponse>('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

