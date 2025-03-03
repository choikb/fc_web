import React, { useRef } from "react";
import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const PhotoPreview = ({ photoList, currentIndex, onNext, onPrev, selectedCase, selectedImages, onSelectImage }) => {
  const rulerRef = useRef(null);

  // 🔥 현재 미리보기 이미지 URL 가져오기
  const currentImage =
    photoList.length > 0
      ? `https://your-storage-url.com/uploads/${photoList[currentIndex].file_name}`
      : null;

  return (
    <Box sx={{ flex: 1, height: "100%", padding: 1 }}>
      <Card
        sx={{
          height: "100%",
          backgroundColor: "#fff",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              미리보기 [ {selectedCase} ]
            </Typography>
          </Box>

          {/* 🔥 미리보기 이미지 */}
          <Box
            sx={{
              width: "100%",
              height: "500px",
              border: "3px solid #a1a1a1", // ✅ 색상 조정
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              backgroundColor: "#f2f2f2",
            }}
          >
            {currentImage ? (
              <>
                <IconButton onClick={onPrev} sx={{ position: "absolute", left: 10, top: "50%" }}>
                  <ChevronLeftIcon fontSize="large" />
                </IconButton>

                <img
                  src={currentImage}
                  alt="현재 미리보기"
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />

                <IconButton onClick={onNext} sx={{ position: "absolute", right: 10, top: "50%" }}>
                  <ChevronRightIcon fontSize="large" />
                </IconButton>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: "gray" }}>
                미리보기할 사진이 없습니다.
              </Typography>
            )}
          </Box>

          {/* 🔥 사진 정보 */}
          {currentImage && (
            <Box sx={{ marginTop: "10px", textAlign: "center", fontSize: "14px", color: "#555" }}>
              {photoList[currentIndex].file_name}
            </Box>
          )}
        </CardContent>

        {/* 🔥 썸네일 영역 (하단으로 이동) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            padding: "15px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            borderTop: "2px solid #d1d1d1",
            marginTop: "auto",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
          ref={rulerRef}
        >
          {photoList?.map((media, idx) => {
            if (!media.file_name) return null;
            const baseURL = "https://your-storage-url.com/uploads/";
            const fileURL = `${baseURL}${media.file_name}`;
            const isCurrent = idx === currentIndex;
            const isSelected = selectedImages.includes(fileURL);

            return (
              <Box key={idx} sx={{ position: "relative", cursor: "pointer" }}>
                {/* 🔥 현재 미리보기 중인 사진에 눈금자 적용 */}
                {isCurrent && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -15,
                      left: 0,
                      width: "100%",
                      height: "12px",
                      backgroundColor: "#ff3d00",
                      borderRadius: "3px",
                      transition: "all 0.3s ease-in-out",
                    }}
                  />
                )}

                {/* 🔥 썸네일 (3cm x 3cm 크기로 변경) */}
                <img
                  src={fileURL}
                  alt={`썸네일-${idx}`}
                  style={{
                    width: "90px",
                    height: "90px",
                    objectFit: "cover",
                    cursor: "pointer",
                    border: isSelected ? "3px solid #1976d2" : "1px solid gray",
                    borderRadius: "8px",
                  }}
                  onClick={() => onSelectImage(idx)}
                />
              </Box>
            );
          })}
        </Box>
      </Card>
    </Box>
  );
};

export default PhotoPreview;
