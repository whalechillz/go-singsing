'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Upload, X, Star, MoveLeft, MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadDropzoneProps {
  images: string[];
  mainImageIndex: number;
  onImagesChange: (images: string[]) => void;
  onMainImageChange: (index: number) => void;
  onUpload: (files: File[]) => Promise<void>;
  maxImages?: number;
  isUploading?: boolean;
}

export default function ImageUploadDropzone({
  images,
  mainImageIndex,
  onImagesChange,
  onMainImageChange,
  onUpload,
  maxImages = 10,
  isUploading = false
}: ImageUploadDropzoneProps) {
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`최대 ${maxImages}장까지 업로드 가능합니다.`);
      return;
    }
    
    await onUpload(acceptedFiles);
  }, [images.length, maxImages, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: isUploading || images.length >= maxImages
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // 메인 이미지 인덱스 조정
    if (index === mainImageIndex) {
      onMainImageChange(0);
    } else if (index < mainImageIndex) {
      onMainImageChange(mainImageIndex - 1);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onImagesChange(newImages);
    
    // 메인 이미지 인덱스 조정
    if (index === mainImageIndex) {
      onMainImageChange(newIndex);
    } else if (newIndex === mainImageIndex) {
      onMainImageChange(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* 드롭존 영역 */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">이미지를 여기에 놓으세요...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                이미지를 드래그하여 놓거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG, WEBP (최대 5MB, {maxImages - images.length}장 더 업로드 가능)
              </p>
            </div>
          )}
        </div>
      )}

      {/* 업로드된 이미지 목록 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={image}
                  alt={`이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                />
                
                {/* 대표 이미지 표시 */}
                {index === mainImageIndex && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    대표
                  </div>
                )}
                
                {/* 호버 시 나타나는 컨트롤 */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  {/* 왼쪽 이동 */}
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveImage(index, 'left')}
                      className="h-8 w-8 p-0"
                    >
                      <MoveLeft className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* 대표 이미지 설정 */}
                  {index !== mainImageIndex && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onMainImageChange(index)}
                      className="h-8 px-2"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* 오른쪽 이동 */}
                  {index < images.length - 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveImage(index, 'right')}
                      className="h-8 w-8 p-0"
                    >
                      <MoveRight className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {/* 삭제 버튼 */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}