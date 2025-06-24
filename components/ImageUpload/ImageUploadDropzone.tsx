import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadImage, deleteImage, validateImageFile } from '@/utils/imageUpload';

interface ImageUploadProps {
  images: string[];
  mainImageIndex: number;
  onImagesChange: (images: string[]) => void;
  onMainImageChange: (index: number) => void;
  maxImages?: number;
}

export default function ImageUploadDropzone({
  images,
  mainImageIndex,
  onImagesChange,
  onMainImageChange,
  maxImages = 10
}: ImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // 에러 초기화
    setErrors([]);
    
    // 거부된 파일 처리
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorMsg = errors.map((e: any) => {
          if (e.code === 'file-too-large') return `${file.name}: 파일 크기가 5MB를 초과합니다.`;
          if (e.code === 'file-invalid-type') return `${file.name}: 지원하지 않는 파일 형식입니다.`;
          return `${file.name}: ${e.message}`;
        }).join(', ');
        return errorMsg;
      });
      setErrors(errorMessages);
    }

    // 최대 이미지 개수 체크
    const remainingSlots = maxImages - images.length;
    if (acceptedFiles.length > remainingSlots) {
      setErrors(prev => [...prev, `최대 ${maxImages}장까지만 업로드 가능합니다. (남은 슬롯: ${remainingSlots}장)`]);
      acceptedFiles = acceptedFiles.slice(0, remainingSlots);
    }

    // 업로드 진행
    const uploadPromises = acceptedFiles.map(async (file) => {
      // 임시 미리보기 URL 생성
      const tempUrl = URL.createObjectURL(file);
      setUploadingImages(prev => [...prev, tempUrl]);

      try {
        const { url, error } = await uploadImage(file, 'tourist-attractions');
        
        // 임시 URL 정리
        URL.revokeObjectURL(tempUrl);
        setUploadingImages(prev => prev.filter(u => u !== tempUrl));

        if (error) {
          setErrors(prev => [...prev, `${file.name} 업로드 실패: ${error.message}`]);
          return null;
        }
        
        return url;
      } catch (error) {
        URL.revokeObjectURL(tempUrl);
        setUploadingImages(prev => prev.filter(u => u !== tempUrl));
        setErrors(prev => [...prev, `${file.name} 업로드 중 오류 발생`]);
        return null;
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const successfulUploads = uploadedUrls.filter(url => url !== null) as string[];
    
    if (successfulUploads.length > 0) {
      const newImages = [...images, ...successfulUploads];
      onImagesChange(newImages);
      
      // 첫 이미지인 경우 자동으로 대표 이미지로 설정
      if (images.length === 0 && successfulUploads.length > 0) {
        onMainImageChange(0);
      }
    }
  }, [images, maxImages, onImagesChange, onMainImageChange]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: images.length >= maxImages
  });

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    if (imageUrl && imageUrl.includes('supabase')) {
      await deleteImage(imageUrl);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // 대표 이미지 인덱스 조정
    if (index === mainImageIndex) {
      onMainImageChange(0);
    } else if (index < mainImageIndex) {
      onMainImageChange(mainImageIndex - 1);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // 대표 이미지 인덱스 조정
    let newMainIndex = mainImageIndex;
    if (fromIndex === mainImageIndex) {
      newMainIndex = toIndex;
    } else if (fromIndex < mainImageIndex && toIndex >= mainImageIndex) {
      newMainIndex = mainImageIndex - 1;
    } else if (fromIndex > mainImageIndex && toIndex <= mainImageIndex) {
      newMainIndex = mainImageIndex + 1;
    }
    
    onImagesChange(newImages);
    onMainImageChange(newMainIndex);
  };

  const isDisabled = images.length >= maxImages;

  return (
    <div>
      <label className="block text-sm font-medium mb-2">이미지 관리</label>
      
      {/* 드래그 앤 드롭 영역 */}
      {!isDisabled && (
        <div
          {...getRootProps()}
          className={`
            mb-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-all duration-200
            ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
            ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400 bg-gray-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            이미지를 드래그하여 놓거나 클릭하여 선택하세요
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, WEBP (최대 5MB) • {maxImages - images.length}장 더 추가 가능
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* 업로드된 이미지 그리드 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 실제 이미지들 */}
        {images.map((imageUrl, index) => (
          <div key={`image-${index}`} className="relative group">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={`이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* 호버 시 나타나는 오버레이 */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200" />
              
              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* 순서 표시 */}
              <div className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>
              
              {/* 이동 버튼 */}
              <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-1 bg-black/60 text-white rounded hover:bg-black/80 transition-colors"
                    title="왼쪽으로 이동"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-1 bg-black/60 text-white rounded hover:bg-black/80 transition-colors"
                    title="오른쪽으로 이동"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            {/* 대표 이미지 선택 */}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="radio"
                name="mainImage"
                checked={mainImageIndex === index}
                onChange={() => onMainImageChange(index)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${mainImageIndex === index ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
                대표 이미지
              </span>
            </label>
          </div>
        ))}
        
        {/* 업로드 중인 이미지들 (로딩 상태) */}
        {uploadingImages.map((tempUrl, index) => (
          <div key={`uploading-${index}`} className="relative">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={tempUrl} 
                alt="업로드 중..."
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 안내 메시지 */}
      <div className="mt-4 space-y-1">
        <p className="text-sm text-gray-600">
          최대 {maxImages}장까지 업로드 가능합니다. 
          현재 {images.length}장의 이미지가 등록되어 있습니다.
        </p>
        {images.length > 0 && !images[mainImageIndex] && (
          <p className="text-sm text-red-500 font-medium">
            대표 이미지를 선택해주세요.
          </p>
        )}
      </div>
    </div>
  );
}