import React, { useState, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
 
import { Document, Packer, Paragraph, TextRun, ImageRun } from "docx";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Link,
    Button,
    Grid,
    Checkbox,
    CircularProgress,
    IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const DataManagement = () => {
    const [incidentList, setIncidentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState(null);
    const [showCasePhotos, setShowCasePhotos] = useState(false);
    const [photoList, setPhotoList] = useState([]); // ✅ 사건별 사진 목록
    const [selectedImages, setSelectedImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [currentIndexForDown, setCurrentIndexForDown] = useState(0);
    const rulerRef = useRef(null);
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const thumbnailsPerPage = 10; // ✅ 최대 10개만 표시

    const handleNextThumbnails = () => {
        if (thumbnailStartIndex + thumbnailsPerPage < photoList.length) {
            setThumbnailStartIndex(thumbnailStartIndex + 1);
        }
    };

    const handlePrevThumbnails = () => {
        if (thumbnailStartIndex > 0) {
            setThumbnailStartIndex(thumbnailStartIndex - 1);
        }
    };

    const handleDownloadReport = async () => {
        if (selectedImages.length === 0) {
            alert("📌 다운로드할 사진을 선택하세요.");
            return;
        }

        try {
            // const doc = new Document({
            //     sections: [
            //         {
            //             properties: {},
            //             children: [
            //                 new Paragraph({
            //                     children: [
            //                         new TextRun({
            //                             text: "📌 화재 사건 보고서",
            //                             bold: true,
            //                             size: 32, // 폰트 크기
            //                         }),
            //                     ],
            //                 }),
            //                 ...selectedImages.map((fileURL, idx) =>
            //                     new Paragraph({
            //                         children: [
            //                             new TextRun({
            //                                 text: `${idx + 1}. ${fileURL.split("/").pop()}`,
            //                                 bold: true,
            //                                 size: 24,
            //                             }),
            //                             new ImageRun({
            //                                 data: fetch(fileURL).then((res) => res.blob()),
            //                                 transformation: { width: 500, height: 300 },
            //                             }),
            //                         ],
            //                     })
            //                 ),
            //             ],
            //         },
            //     ],
            // });

const hwpContent = `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>화재 사건 보고서</title>
                <style>
                    body { font-family: "나눔고딕", sans-serif; line-height: 1.6; }
                    h1 { text-align: center; color: red; }
                    .section { margin-bottom: 20px; }
                    .photo { font-weight: bold; color: blue; }
                </style>
            </head>
            <body>
                <h1>🔥 화재 사건 보고서</h1>
                <p><strong>📁 사건명:</strong> ${selectedCase || "사건명 없음"}</p>

                ${photoList.map((media, index) => `
                    <div class="section">
                        <p class="photo">${index + 1}. 📷 파일명: ${media.file_name || "파일명 없음"}</p>
                        <p>📅 촬영일자: ${media.captured_at || "정보 없음"}</p>
                        <p>📍 위치: ${media.location_address || "미등록"}</p>
                    </div>
                `).join("")}
            </body>
            </html>
        `;

        // 🔥 2️⃣ Blob으로 변환 후 저장
       const blob = new Blob([hwpContent], { type: "text/html;charset=utf-8" });
       saveAs(blob, "화재사건_보고서.html");
 
    
            alert("✅ 보고서 다운로드 완료!");
        } catch (error) {
            console.error("❌ 보고서 생성 오류:", error);
        }
    };


    // 🔥 키보드 이벤트 (좌/우 키)
    const handleKeyDown = (event) => {
        if (event.key === "ArrowRight") {
            handleNext();
        } else if (event.key === "ArrowLeft") {
            handlePrev();
        }
    };

    // 🔥 눈금자 드래그 이동
    const handleRulerDrag = (event) => {
        if (!photoList.length) return;

        const rect = rulerRef.current.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const newIndex = Math.floor((offsetX / rect.width) * photoList.length);

        if (newIndex >= 0 && newIndex < photoList.length) {
            setCurrentIndex(newIndex);
        }
    };

    // 🔥 키보드 이벤트 리스너 등록
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);



    // // 🔥 썸네일 클릭 시 선택 / 해제
    // const handleImageSelect = (fileURL) => {
    //     setSelectedImages([currentImage]);
    //     // setSelectedImages((prevSelected) => {
    //     //     const isSelected = prevSelected.includes(fileURL);
    //     //     const updatedSelection = isSelected
    //     //         ? prevSelected.filter((url) => url !== fileURL) // ✅ 이미 선택된 경우 해제
    //     //         : [...prevSelected, fileURL]; // ✅ 선택되지 않은 경우 추가

    //     //     console.log(`✅ [LOG] ${isSelected ? "해제됨" : "선택됨"}: ${fileURL}`);
    //     //     console.log("✅ [LOG] 현재 선택된 이미지 목록:", updatedSelection);

    //     //     return updatedSelection;
    //     // });
    // };

    // 🔥 썸네일 클릭 시 미리보기 변경 및 선택 적용
    const handleImageSelect = (fileURL, index) => {
        setCurrentIndex(index);
        updateSelectedImage(index); // ✅ 선택된 이미지 업데이트
    };



    // 🔥 전체 선택 / 선택 해제 기능
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedImages([]); // 전체 해제
        } else {
            setSelectedImages(photoList.map((media) => `https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/${media.region}/${media.incident_id}/media/${media.file_name}`));
        }
        setIsAllSelected(!isAllSelected);
    };


    const handleDownloadSelectedImages = async () => {
        console.log("🚀 [LOG] 다운로드 준비:", selectedImages.length);
        if (selectedImages.length === 0) return;

        console.log("🚀 [LOG] 다운로드 시작:", selectedImages);

        for (const fileURL of selectedImages) {
            try {
                const response = await fetch(fileURL);
                const blob = await response.blob();
                const blobURL = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = blobURL;
                link.download = fileURL.split("/").pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(blobURL);
            } catch (error) {
                console.error("❌ 다운로드 오류:", error);
            }
        }
    };



    // const handleDownload = async (fileURL) => {
    //     console.log("🚀 [LOG] 다운로드 시작:", fileURL);
    //     fileURL = "https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/충남/32/media/홍성구룡리_250209082040_ORI.jpg"

    //     try {
    //         const response = await fetch(fileURL, { mode: "no-cors" }); // 🔥 CORS 우회
    //         const blob = await response.blob();
    //         const blobURL = window.URL.createObjectURL(blob);

    //         const link = document.createElement("a");
    //         link.href = blobURL;
    //         link.download = fileURL.split("/").pop();
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);

    //         window.URL.revokeObjectURL(blobURL);
    //     } catch (error) {
    //         console.error("❌ 다운로드 오류:", error);
    //     }
    // };


    // // 🔥 사진 이동 기능 (좌/우 버튼)
    // const handleNext = () => {
    //     if (photoList.length > 0) {
    //         setCurrentIndex((prevIndex) => (prevIndex + 1) % photoList.length);
    //     }
    // };

    // 🔥 사진 이동 기능 (좌/우 버튼)
    const handleNext = () => {
        if (photoList.length > 0) {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % photoList.length;
                updateSelectedImage(nextIndex); // ✅ 선택된 이미지 업데이트
                return nextIndex;
            });
        }
    };

    // ✅ 선택된 이미지 업데이트 (좌/우 이동, 썸네일 클릭, 파일 목록 클릭 시 공통 사용)
    const updateSelectedImage = (index) => {
        const fileURL = `https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/${photoList[index].region}/${photoList[index].incident_id}/media/${photoList[index].file_name}`;

        setSelectedImages([fileURL]); // ✅ 현재 선택된 이미지만 유지
    };

    // const handlePrev = () => {
    //     if (photoList.length > 0) {
    //         setCurrentIndex((prevIndex) => (prevIndex - 1 + photoList.length) % photoList.length);
    //     }
    // };
    const handlePrev = () => {
        if (photoList.length > 0) {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex - 1 + photoList.length) % photoList.length;
                updateSelectedImage(nextIndex); // ✅ 선택된 이미지 업데이트
                return nextIndex;
            });
        }
    };



    // 🔥 현재 미리보기 중인 이미지 URL 가져오기
    const currentImage =
        photoList.length > 0
            ? `https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/${photoList[currentIndex].region}/${photoList[currentIndex].incident_id}/media/${photoList[currentIndex].file_name}`
            : null;
    //https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/충남/32/media/홍성구룡리_250209082040_ORI.jpg


    /* 전체 다운로드 함수 */
    const handleDownloadAll = () => {
        photoList.forEach((media) => {
            const fileURL = `https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/${media.region}/${media.incident_id}/media/${media.file_name}`;
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = media.file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };


    // 사건 목록 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    "https://ev0tafewtt.apigw.ntruss.com/firecapture-api/v0001/incidents?blocking=true&result=true",
                    {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",

                            "Accept": "application/json" // 서버 응답이 JSON이라면 추가
                        },
                        body: JSON.stringify({ action: "getAllIncidents" }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
                }

                const data = await response.json();

                // 🔥 Cloud Function에서 JSON.stringify()로 감싸진 경우 한 번 더 JSON.parse() 실행
                const parsedData = typeof data.body === "string" ? JSON.parse(data.body) : data;
                console.log("✅ [LOG] JSON 파싱 후 데이터:", parsedData);

                if (parsedData.success) {
                    const convertedData = parsedData.data.map((incident) => ({
                        ...incident,
                        incident_name: bufferToString(incident.incident_name, "incident_name", incident),
                        creator_id: bufferToString(incident.creator_id, "creator_id", incident),
                        //editor_id: bufferToString(incident.editor_id, "editor_id", incident),
                        description: bufferToString(incident.description, "description", incident),
                        type: bufferToString(incident.type, "type", incident),
                        status: bufferToString(incident.status, "status", incident),
                    }));

                    console.log("✅ [LOG] 변환 후 데이터:", convertedData);
                    setIncidentList(convertedData);
                }
                else {
                    console.error("데이터 로드 실패:", data);
                }
            } catch (error) {
                console.error("API 요청 오류:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    // 사건 선택 시 호출
    const handleCaseSelect = async (incident_id, caseName) => {
        setSelectedCase(caseName);
        setShowCasePhotos(true); // 사건별 사진 영역 표시

        try {
            const response = await fetch(
                "https://ev0tafewtt.apigw.ntruss.com/firecapture-api/v0001/media/media-r?blocking=true&result=true",
                {
                    method: "POST",
                    mode: "cors",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({ action: "getUploadedMediaNames", incidentId: incident_id }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ [LOG] 사건별 사진 응답 데이터:", data);

            // 🔥 Cloud Function에서 JSON.stringify()로 감싸진 경우 한 번 더 JSON.parse() 실행
            const parsedData = typeof data.body === "string" ? JSON.parse(data.body) : data;
            console.log("✅ [LOG] JSON 파싱 후 데이터:", parsedData);

            if (parsedData.success) {

                console.log("✅ [LOG] `parsedData.data` 구조 확인:", parsedData.data);

                const convertedData = parsedData.data.map((media) => ({
                    // file_name: bufferToString(media.file_name) || "파일명 없음",   // ✅ 파일명이 없으면 기본값 적용
                    // incident_id: media.incident_id || "사건번호 없음", // ✅ 사건번호 기본값
                    // region: bufferToString(media.region) || "지역 없음",         // ✅ 지역 기본값

                    file_name: bufferToString(media.file_name, "file_name") || "파일명 없음",
                    incident_id: media.incident_id || "사건번호 없음",
                    region: bufferToString(media.region, "region") || "지역 없음",
                    captured_at: bufferToString(media.captured_at) || "정보 없음",
                    uploaded_at: bufferToString(media.uploaded_at) || "정보 없음",
                    version: bufferToString(media.version, "version") || "original",
                    resolution: bufferToString(media.resolution, "resolution") || "정보 없음",
                    location_address: bufferToString(media.location_address, "location_address") || "미등록",
                    memo: bufferToString(media.memo, "memo") || "메모 없음",

                }));


                // const convertedData = parsedData.data.map((fileName) => ({
                //     file_name: fileName, // ✅ 파일 이름만 포함한 객체로 변환

                //     incident_id: incidentid,
                //     region: regionName,
                // }));

                console.log("✅ [LOG] 변환된 사건별 미디어 데이터:", convertedData);
                setPhotoList(convertedData); // ✅ 변환된 사건별 미디어 리스트 저장
            } else {
                console.error("❌ [LOG] `success` 값이 없음:", parsedData);
            }
        } catch (error) {
            console.error("❌ [LOG] 사건별 미디어 요청 오류:", error);
        }
    };



    // 사건별 사진 접기/펼치기
    const handleToggleCasePhotos = () => {
        setShowCasePhotos((prev) => !prev);
    };

    const bufferToString = (bufferData, fieldName, incident) => {
        //  const bufferToString = (bufferData, fieldName = "") => {
        try {
            if (!bufferData) {
                console.warn(`⚠️ [LOG] 변환할 데이터가 없음 (null 또는 undefined) - 필드: ${fieldName}, 전체 데이터:`, incident);
                return ""; // 기본적으로 빈 문자열 반환
            }


            if (typeof bufferData === "string") {
                return bufferData; // 이미 문자열이면 그대로 반환
            }

            if (bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
                return new TextDecoder("utf-8").decode(new Uint8Array(bufferData.data));
            }

            console.warn("⚠️ [LOG] 예상치 못한 데이터 형식:", bufferData);
            return JSON.stringify(bufferData); // 예외 데이터는 JSON 문자열화
        } catch (error) {
            console.error("❌ [LOG] Buffer 변환 오류:", error);
            return ""; // 오류 발생 시 기본값 반환
        }
    };

    {/* 🔥 날짜 포맷 변경 함수 추가 */ }
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getFullYear().toString().slice(2)}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
    };

    return (
        //<Box sx={{ display: "flex", flex: 1, height: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "row", height: "100%", padding: 0 }}>

            {/* 사건목록 트리뷰 */}
            <Box sx={{ width: "250px", height: "100%", padding: 0.5 }}>
                <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
                            화재사건목록
                        </Typography>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            <ul style={{ paddingLeft: "15px" }}>
                                {incidentList?.map((incident) => (
                                    <li key={incident.incident_id} style={{ marginBottom: "10px" }}>
                                        <Link
                                            href="#"
                                            underline="hover"
                                            sx={{ color: "#1976d2", cursor: "pointer" }}
                                            onClick={() => handleCaseSelect(incident.incident_id, incident.incident_name)} // ✅ 클릭 이벤트 추가
                                        >
                                            {incident.incident_name}
                                            <br /> {/* ✅ 줄바꿈 추가 */}
                                            <Typography variant="body2" color="gray">
                                                {formatDate(incident.created_at)} {/* ✅ 날짜 변환 함수 적용 */}
                                            </Typography>
                                        </Link>
                                    </li>


                                ))}
                            </ul>
                        )}

                    </CardContent>
                </Card>
            </Box>
            {/*  
            {showCasePhotos && (
                <Box sx={{ width: "250px", height: "100%", padding: 0.5 }}>
                    <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    사건: {selectedCase}
                                </Typography>
                                <IconButton onClick={handleToggleCasePhotos} sx={{ color: "#1976d2" }}>
                                    {showCasePhotos ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                                </IconButton>
                            </Box> 
                            <ul style={{ paddingLeft: "10px", marginTop: "10px" }}>
                                {photoList
                                    ?.filter(Boolean) // 🔥 빈 값(null, undefined, "") 제거
                                    .map((media, idx) => {
                                        if (!media.file_name) return null; // 🔥 file_name이 없는 경우 건너뛰기

                                        const baseURL = "https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/"; // ✅ 스토리지 기본 경로
                                        const fileURL = `${baseURL}${media.region}/${media.incident_id}/media/${media.file_name}`; // ✅ 파일 URL 생성

                                        const trimmedCaseName = selectedCase.replace(/\s/g, ""); // 모든 공백 제거

                                        // 🔥 사건명과 확장자 제거
                                        const cleanedFileName = media.file_name
                                            .replace(new RegExp(`^${trimmedCaseName}_`), "") // 사건명 제거
                                            .replace(/\.(jpg|jpeg|png|mp4)$/i, ""); // 확장자 제거


                                        return (
                                            <li key={idx} style={{ marginBottom: "5px" }}>
                                                <Link href={fileURL} target="_blank" underline="hover" sx={{ color: "#1976d2" }}>
                                                    {cleanedFileName}    </Link>
                                            </li>
                                        );
                                    })}
                            </ul>
                        </CardContent>
                    </Card>
                </Box>
            )} */}
            {/* 사건별 미디어 목록 (사건 선택 시 표시) */}
            {showCasePhotos && (
                <Box sx={{ width: "300px", height: "100%", padding: 0.5 }}>
                    <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    사건: {selectedCase}
                                </Typography>
                                <IconButton onClick={handleToggleCasePhotos} sx={{ color: "#1976d2" }}>
                                    {showCasePhotos ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                                </IconButton>
                            </Box>

                            {/* 파일 목록 */}
                            <ul style={{ paddingLeft: "10px", marginTop: "10px" }}>
                                {photoList?.filter(Boolean).map((media, idx) => {
                                    if (!media.file_name) return null;

                                    const baseURL = "https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/";
                                    const fileURL = `${baseURL}${media.region}/${media.incident_id}/media/${media.file_name}`;

                                    const trimmedCaseName = selectedCase.replace(/\s/g, "");

                                    // 🔥 사건명과 확장자 제거
                                    const cleanedFileName = media.file_name
                                        .replace(new RegExp(`^${trimmedCaseName}_`), "")
                                        .replace(/\.(jpg|jpeg|png|mp4)$/i, "");

                                    return (
                                        <li key={idx} style={{ marginBottom: "5px" }}>
                                            <Link href="#" onClick={() => updateSelectedImage(idx)} underline="hover" sx={{ color: "#1976d2" }}>
                                                {idx + 1}. {cleanedFileName} {/* ✅ 사진 번호 추가 및 클릭 시 미리보기 변경 */}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </CardContent>

                        {/* 🔥 전체 다운로드 버튼 추가 */}
                        <Box sx={{ display: "flex", justifyContent: "center", paddingBottom: "10px" }}>
                            <Button variant="contained" color="primary" onClick={handleDownloadAll}>
                                전체 다운로드
                            </Button>
                        </Box>
                    </Card>
                </Box>
            )}



            <Box sx={{ flex: 1, height: "100%", padding: 0.5 }}>
                <Card
                    sx={{
                        height: "100%",
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "0px",
                        justifyContent: "space-between",
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                미리보기 [ {selectedCase} ]
                            </Typography>
                            <IconButton onClick={handleToggleCasePhotos} sx={{ color: "#1976d2" }}>
                                {showCasePhotos ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                            </IconButton>
                        </Box>
                        <Box
                            sx={{
                                width: "100%",
                                //height: "900px",
                                height: "calc(60vh - 150px)",  // ✅ 브라우저 높이의 80%로 설정 (반응형)
                                maxHeight: "900px",  // ✅ 최대 높이 제한
                                minHeight: "400px",  // ✅ 최소 높이 설정 (너무 작아지는 것 방지)
                                border: "2px solid #d1d1d1",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                backgroundColor: "#f9f9f9",
                            }}
                        >
                            {currentImage ? (
                                <>
                                    <IconButton onClick={handlePrev} sx={{ position: "absolute", left: 10, top: "50%" }}>
                                        <ChevronLeftIcon fontSize="large" />
                                    </IconButton>

                                    <img
                                        src={currentImage}
                                        alt="현재 미리보기"
                                        style={{
                                            // width: "100%",
                                            // maxHeight: "900px",
                                            // objectFit: "contain",
                                            width: "100%",    // ✅ 가로 길이를 100%로 설정
                                            height: "100%",   // ✅ 부모 Box 높이에 맞춰 자동 조정
                                            objectFit: "contain",  // ✅ 이미지 비율 유지하면서 맞추기
                                            borderRadius: "8px",
                                        }}
                                    />

                                    <IconButton onClick={handleNext} sx={{ position: "absolute", right: 10, top: "50%" }}>
                                        <ChevronRightIcon fontSize="large" />
                                    </IconButton>
                                </>
                            ) : (
                                <Typography variant="body2" sx={{ color: "gray" }}>
                                    미리보기할 사진이 없습니다.
                                </Typography>
                            )}
                        </Box>
                    </CardContent>

                    {/* 🔥 썸네일 영역을 더 하단으로 이동 */}
                    {/* <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1,
                            padding: "20px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            borderTop: "2px solid #d1d1d1",
                            marginTop: "auto",
                        }}
                        ref={rulerRef}
                        onMouseDown={handleRulerDrag}
                    >
                        {photoList?.map((media, idx) => { 
                         
                            if (!media.file_name) return null;
                            const baseURL = "https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/";
                            const fileURL = `${baseURL}${media.region}/${media.incident_id}/media/${media.file_name}`;
                            const isCurrent = idx === currentIndex;
                            const isSelected = selectedImages.includes(fileURL);

                            return (
                                <Box key={idx} sx={{ position: "relative" }}>
                                    {isCurrent && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: -22,
                                                left: 0,
                                                width: "100%",
                                                height: "20px", // 🔥 두께 증가
                                                backgroundColor: "red",
                                                borderRadius: "3px",
                                                transition: "all 0.3s ease-in-out",
                                            }}
                                        />
                                    )}
                                    <img
                                        src={fileURL}
                                        alt={`썸네일-${idx}`}
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "cover",
                                            cursor: "pointer",
                                            border: isSelected ? "6px solid #1976d2" : "1px solid gray",
                                            borderRadius: "8px",
                                        }}
                                        onClick={() => handleImageSelect(fileURL)}
                                    />
                                    <Typography variant="caption">{bufferToString(media.file_name)}</Typography>
                                </Box>
                            );
                        })}
                    </Box> */}

                    {/* 🔥 사진 정보 전시 영역 (2열 배치) */}
                    <CardContent>
                        <Box sx={{ paddingTop: "0px", borderBottom: "2px solid #d1d1d1" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                                📌 사진 정보
                            </Typography>
                            {photoList.length > 0 ? (
                                <Grid container spacing={2}>
                                    {/* 왼쪽 정보 (사건명, 사진명, 촬영일자, 업로드일자) */}
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>📁 사건명:</strong> {selectedCase || "미지정"}</Typography>
                                        <Typography variant="body1"><strong>📷 사진명:</strong> {photoList[currentIndex]?.file_name || "이름 없음"}</Typography>
                                        <Typography variant="body1"><strong>📅 촬영일자:</strong> {photoList[currentIndex]?.captured_at || "정보 없음"}</Typography>
                                        <Typography variant="body1"><strong>📤 업로드일자:</strong> {photoList[currentIndex]?.uploaded_at || "정보 없음"}</Typography>
                                    </Grid>

                                    {/* 오른쪽 정보 (원본/편집, 해상도, 위치) */}
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>🔄 원본/편집:</strong> {photoList[currentIndex]?.version === "edited" ? "편집됨" : "원본"}</Typography>
                                        <Typography variant="body1"><strong>🔍 해상도:</strong> {photoList[currentIndex]?.resolution || "정보 없음"}</Typography>
                                        <Typography variant="body1"><strong>📍 위치:</strong> {photoList[currentIndex]?.location_address || "미등록"}</Typography>
                                    </Grid>

                                    {/* 📝 메모 (하단 전체 차지) */}
                                    <Grid item xs={12}>
                                        <Typography variant="body1" sx={{ color: "blue", paddingTop: 1, borderTop: "1px solid #d1d1d1" }}>
                                            <strong>📝 메모:</strong> {photoList[currentIndex]?.memo || "메모 없음"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography variant="body2" sx={{ color: "gray" }}>
                                    📌 미리보기할 사진을 선택하세요.
                                </Typography>
                            )}
                        </Box>
                    </CardContent>



                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px" }}>
                        {/* 🔥 좌측 이동 버튼 */}
                        <IconButton onClick={handlePrevThumbnails} disabled={thumbnailStartIndex === 0}>
                            <ChevronLeftIcon fontSize="large" />
                        </IconButton>

                        {/* 🔥 섬네일 리스트 */}
                        <Box sx={{ display: "flex", gap: 1, overflow: "hidden", width: "100%", justifyContent: "center" }}>
                            {photoList
                                .slice(thumbnailStartIndex, thumbnailStartIndex + thumbnailsPerPage)
                                .map((media, idx) => {
                                    if (!media.file_name) return null;
                                    const baseURL = "https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/";
                                    const fileURL = `${baseURL}${media.region}/${media.incident_id}/media/${media.file_name}`;
                                    const isCurrent = currentIndex === idx + thumbnailStartIndex;
                                    const isSelected = selectedImages.includes(fileURL);

                                    return (
                                        <Box key={idx} sx={{ textAlign: "center", position: "relative" }}>
                                            {/* 🔥 현재 미리보기 중인 이미지 표시 */}
                                            {isCurrent && (
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: -10,
                                                        left: 0,
                                                        width: "100%",
                                                        height: "8px",
                                                        backgroundColor: "red",
                                                        borderRadius: "3px",
                                                    }}
                                                />
                                            )}

                                            {/* 🔥 섬네일 이미지 */}
                                            <img
                                                src={fileURL}
                                                alt={`썸네일-${idx}`}
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                    cursor: "pointer",
                                                    // border: isSelected ? "4px solid #1976d2" : "1px solid gray",
                                                    //border: isCurrent ? "4px solid red" : isSelected ? "4px solid #1976d2" : "1px solid gray", // ✅ 현재 미리보기 이미지에는 빨간 테두리                                                   
                                                    //border: isCurrent ? "4px solid red" : isSelected ? "4px solid #1976d2" : "1px solid gray",
                                                    border: isSelected ? "4px solid #1976d2" : "1px solid gray", // ✅ 선택된 경우 파란색
                                                    borderRadius: "8px",
                                                }}
                                                onClick={() => handleImageSelect(fileURL, idx)}
                                            // onClick={() => setCurrentIndex(idx + thumbnailStartIndex)}
                                            />

                                            {/* 🔥 파일명 표시 */}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "block",
                                                    maxWidth: "120px",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {media.file_name}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                        </Box>

                        {/* 🔥 우측 이동 버튼 */}
                        <IconButton onClick={handleNextThumbnails} disabled={thumbnailStartIndex + thumbnailsPerPage >= photoList.length}>
                            <ChevronRightIcon fontSize="large" />
                        </IconButton>
                    </Box>


                    <Box sx={{ display: "flex", justifyContent: "center", paddingBottom: "10px" }}>
                        <Button variant="contained" color="primary" onClick={handleDownloadSelectedImages}>
                            선택 다운로드
                        </Button>
                    </Box>

                    {/* <Button variant="contained" color="secondary" onClick={handleDownloadReport}>
                        📄 보고서 다운로드
                    </Button> */}
                </Card>
            </Box>
        </Box>
    );
};

export default DataManagement;


