'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, deleteImage } from '@/utils/imageUpload';
import Image from 'next/image';

interface MmsImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  isUploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
}

export default function MmsImageUpload({
  imageUrl,
  onImageChange,
  isUploading,
  onUploadingChange
}: MmsImageUploadProps) {
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    try {
      onUploadingChange(true);
      
      // 기존 이미지가 있으면 삭제
      if (imageUrl) {
        await deleteImage(imageUrl, 'mms-images');
      }
      
      // 새 이미지 업로드
      const { url, error } = await uploadImage(file, 'mms-images');
      
      if (error) {
        console.error('이미지 업로드 실패:', error);
        alert('이미지 업로드에 실패했습니다.');
        return;
      }
      
      if (url) {
        onImageChange(url);
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      onUploadingChange(false);
    }
  }, [imageUrl, onImageChange, onUploadingChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const removeImage = async () => {
    if (!imageUrl) return;
    
    try {
      onUploadingChange(true);
      await deleteImage(imageUrl, 'mms-images');
      onImageChange('');
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      alert('이미지 삭제에 실패했습니다.');
    } finally {
      onUploadingChange(false);
    }
  };

  return (
    <div className="w-full">
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">이미지 업로드 중...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm text-blue-600">이미지를 여기에 놓으세요</p>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">
                    이미지를 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, WEBP, GIF (최대 5MB)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="MMS 첨부 이미지"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            disabled={isUploading}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            MMS 이미지
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        * MMS 발송 시 이미지와 함께 전송됩니다
      </p>
    </div>
  );
}