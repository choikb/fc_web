import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link,
  Button,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const SystemInfo = () => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCasePhotos, setShowCasePhotos] = useState(false);

  // 사건 선택 시 호출
  const handleCaseSelect = (caseName) => {
    setSelectedCase(caseName);
    setShowCasePhotos(true); // 사건별 사진 영역 표시
  };

  // 사건별 사진 접기/펼치기
  const handleToggleCasePhotos = () => {
    setShowCasePhotos((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", flex: 1, height: "100%" }}>
      {/* 사건목록 트리뷰 */}
      <Box sx={{ width: "250px", height: "100%", padding: 1 }}>
        <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
          <CardContent>
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
            SystemInfo
            </Typography>
            <ul style={{ paddingLeft: "20px" }}>
              {["사건 #1", "사건 #2", "사건 #3", "사건 #4"].map((item) => (
                <li key={item} style={{ marginBottom: "10px" }}>
                  <Link
                    href="#"
                    underline="hover"
                    onClick={() => handleCaseSelect(item)}
                    sx={{ color: "#1976d2", cursor: "pointer" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Box>

      {/* 사건별 사진 (사건 선택 시만 표시) */}
      {showCasePhotos && (
        <Box sx={{ width: "250px", height: "100%", padding: 1 }}>
          <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {selectedCase} 사진
                </Typography>
                <IconButton onClick={handleToggleCasePhotos} sx={{ color: "#1976d2" }}>
  {showCasePhotos ? <ChevronLeftIcon /> : <ChevronRightIcon />}
</IconButton>
              </Box>
              <ul style={{ paddingLeft: "20px" }}>
                {[...Array(8)].map((_, idx) => (
                  <li key={idx} style={{ marginBottom: "10px" }}>
                    <Link href={`#photo${idx + 1}`} underline="hover" sx={{ color: "#1976d2" }}>
                      NO.{idx + 1} (시간:분)
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 사진 미리보기 */}
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
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
              사진 미리보기
            </Typography>
          </CardContent>
          <Box sx={{ padding: 1 }}>
            <Button variant="contained" sx={{ marginRight: 2 }}>
              목록보기
            </Button>
            <Button variant="contained" color="secondary">
              사진 미리보기
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default SystemInfo;
