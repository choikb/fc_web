import React from "react";
import { Box, Button } from "@mui/material";

const Controls = ({ isAllSelected, selectedImages = [], onSelectAll, onDownload }) => {
  return (
    <Box sx={{ padding: 1, display: "flex", justifyContent: "flex-start", gap: 1 }}>
      <Button variant="contained" size="small" onClick={onSelectAll}>
        {isAllSelected ? "선택해제" : "전체선택"}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        onClick={onDownload}
        disabled={selectedImages.length === 0}  // ✅ selectedImages가 undefined면 오류 발생
      >
        선택 다운로드 ({selectedImages.length})
      </Button>
    </Box>
  );
};

export default Controls;
