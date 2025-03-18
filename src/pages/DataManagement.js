import React, { useState, useEffect, useRef } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import ApiService, { apiService } from '../services/apiService';
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

import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

// 메모 형식 정리 (줄바꿈 처리)
const formatMemo = (memo) => {
    if (!memo) return "";
    return memo.replace(/\n/g, "\n");
};


const DataManagement = () => {
    const [incidentList, setIncidentList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 계층형 사건 목록 관리를 위한 상태
    const [hierarchicalIncidents, setHierarchicalIncidents] = useState({});
    const [expandedCities, setExpandedCities] = useState({});
    const [expandedYears, setExpandedYears] = useState({});
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedIncidentId, setSelectedIncidentId] = useState(null);
    const [showCasePhotos, setShowCasePhotos] = useState(false);
    const [photoList, setPhotoList] = useState([]); // ✅ 사건별 사진 목록
    const [selectedImages, setSelectedImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [currentIndexForDown, setCurrentIndexForDown] = useState(0);
    const rulerRef = useRef(null);
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const thumbnailsPerPage = 10; // ✅ 최대 10개만 표시

    useEffect(() => {
        if(photoList.length > 0){
            updateSelectedImage(0);
        }
    }, [photoList])

    useEffect(() => {
        if(incidentList.length > 0){
            handleCaseSelect(incidentList[incidentList.length-1].incidentId, incidentList[incidentList.length-1].incidentName)
        }
    }, [incidentList]);


    /**
     * Format memo string to make it more readable
     * Transforms format like '{1=ㄱㄱㄱㄱㄱㄱ, 2=ㄷㄷㄷㄷㄷㄷ, 3=ㄹㄹㄹㄹㄹㄹ}'
     * to '1. ㄱㄱㄱㄱㄱㄱ\n2. ㄷㄷㄷㄷㄷㄷ\n3. ㄹㄹㄹㄹㄹㄹ'
     * @param {string} memo - The memo string to format
     * @returns {string} - The formatted memo string
     */
    const formatMemo = (memo) => {
        if (!memo) return "";

        // Check if the memo is in the expected format (starts with { and ends with })
        if (memo.startsWith('{') && memo.endsWith('}')) {
            // Remove the curly braces
            const content = memo.substring(1, memo.length - 1);

            // Split by comma and format each entry
            return content.split(', ')
                .map(entry => {
                    const [key, value] = entry.split('=');
                    return `${key}. ${value}`;
                })
                .join('\n');
        }

        // If not in the expected format, return as is
        return memo;
    };

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



// HTML 보고서용 메모 형식 처리 함수
const formatMemoForHtml = (memo) => {
    if (!memo) return "";

    // 기존 formatMemo 함수에서 처리하는 형식인지 확인
    if (memo.startsWith('{') && memo.endsWith('}')) {
        // 기존 형식 처리 로직 사용
        const formattedMemo = formatMemo(memo);
        // 줄바꿈을 HTML 줄바꿈으로 변환
        return formattedMemo.replace(/\n/g, "<br>");
    }

    // 일반 텍스트인 경우 줄바꿈만 처리
    return memo.replace(/\n/g, "<br>");
};

// 보고서 다운로드 함수
const handleDownloadReport = () => {
    console.log("보고서 다운로드 버튼 클릭됨");

    if (photoList.length === 0) {
        alert("보고서에 포함할 사진이 없습니다.");
        return;
    }

    // 상태 표시
    alert(`현재 ${photoList.length}개의 사진이 있습니다. 보고서 생성을 시작합니다.`);

    // 보고서 생성 및 다운로드 함수 호출
    generateSimpleReport();
};

// 새로운 심플 보고서 생성 함수 - HTML 기반
const generateSimpleReport = async () => {
    try {
        const statusElement = document.createElement("div");
        statusElement.style.position = "fixed";
        statusElement.style.top = "50%";
        statusElement.style.left = "50%";
        statusElement.style.transform = "translate(-50%, -50%)";
        statusElement.style.padding = "20px";
        statusElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        statusElement.style.color = "white";
        statusElement.style.borderRadius = "8px";
        statusElement.style.zIndex = "9999";
        statusElement.style.textAlign = "center";
        statusElement.innerHTML = `<div>보고서 생성 중...</div><div>0 / ${photoList.length}</div>`;
        document.body.appendChild(statusElement);

        // HTML 보고서 생성 시작
        let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${selectedCase || "미지정"} 사진 보고서</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; color: #333; }
                .date { text-align: right; color: #666; margin-bottom: 30px; }
                .photo-container { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                h2 { color: #444; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                table, th, td { border: 1px solid #ddd; }
                th, td { padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                img { max-width: 100%; height: auto; display: block; margin: 15px auto; }
                .memo { background-color: #f9f9f9; padding: 10px; border-left: 3px solid #ccc; }
                .divider { border-top: 1px dashed #ccc; margin: 30px 0; }
                .print-button { position: fixed; top: 20px; right: 20px; background-color: #4CAF50; color: white; border: none; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }
                .print-button:hover { background-color: #45a049; }
                .instructions { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; border: 1px solid #ddd; }
                @media print { 
                    .print-button, .instructions { display: none; } 
                    body { margin: 0; }
                }
            </style>
            <script>
                function printReport() {
                    window.print();
                }
            </script>
        </head>
        <body>
            <button class="print-button" onclick="printReport()">프린트 / PDF 저장</button>
            <h1>${selectedCase || "미지정"} 사진 보고서</h1>
            <div class="date">생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div class="instructions">
                <strong>HWP 파일로 변환하는 방법:</strong><br>
                1. 위 '프린트 / PDF 저장' 버튼을 클릭하여 PDF로 저장합니다.<br>
                2. 저장된 PDF 파일을 한컴오피스에서 열어 HWP 형식으로 저장합니다.<br>
            </div>
        `;

        // 각 사진 정보 추가
        let processedCount = 0;

        for (const [index, photo] of photoList.entries()) {
            try {
                // 진행상황 업데이트
                processedCount++;
                statusElement.innerHTML = `<div>보고서 생성 중...</div><div>${processedCount} / ${photoList.length}</div>`;

                // 사진 섹션 시작
                htmlContent += `
                <div class="photo-container">
                    <h2>사진 ${index + 1}: ${photo.fileName || "이름 없음"}</h2>
                `;

                // 사진 정보 테이블 추가
                htmlContent += `
                <table>
                    <tr>
                        <th width="20%">📁 사건명</th>
                        <td>${selectedCase || "미지정"}</td>
                        <th width="20%">🔄 원본/편집</th>
                        <td>${photo.version === "edited" ? "편집됨" : "원본"}</td>
                    </tr>
                    <tr>
                        <th>📷 사진명</th>
                        <td>${photo.fileName || "이름 없음"}</td>
                        <th>🔍 해상도</th>
                        <td>${photo.resolution || "정보 없음"}</td>
                    </tr>
                    <tr>
                        <th>📅 촬영일자</th>
                        <td>${photo.capturedAt || "정보 없음"}</td>
                        <th>📍 위치</th>
                        <td>${photo.locationAddress || "미등록"}</td>
                    </tr>
                    <tr>
                        <th>📤 업로드일자</th>
                        <td colspan="3">${photo.uploadedAt || "정보 없음"}</td>
                    </tr>
                </table>
                `;

                // 메모 추가
                htmlContent += `
                <h3>📝 메모:</h3>
                <div class="memo">${formatMemoForHtml(photo.memo) || "메모 없음"}</div>
                `;

                // 이미지 URL 추가
                const fileURL = `${process.env.REACT_APP_API_BASE_URL}/admin/api/media/displayImage?filePath=${encodeURIComponent(photo.storageUrl)}`;

                // 이미지 추가
                htmlContent += `
                <img src="${fileURL}" alt="${photo.fileName || '사진'}"/>
                </div>
                <div class="divider"></div>
                `;
            } catch (error) {
                console.error(`이미지 처리 오류 (${photo.fileName}):`, error);
                // 오류 발생 시에도 계속 진행
                htmlContent += `
                <div style="color: red; text-align: center; margin: 15px 0;">이미지 처리 중 오류 발생: ${photo.fileName || "이름 없음"}</div>
                </div>
                <div class="divider"></div>
                `;
            }
        }

        // HTML 마무리 추가
        htmlContent += `
        </body>
        </html>
        `;

        // 상태 메시지 업데이트
        statusElement.innerHTML = `<div>보고서 생성 중...</div>`;

        // HTML 보고서를 Blob으로 변환
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });

        // 현재 날짜와 시간을 포함한 파일명 생성
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const fileName = `${selectedCase || "사진보고서"}_${dateStr}_${timeStr}.html`;

        // 다운로드
        saveAs(blob, fileName);

        // 상태 표시 제거
        document.body.removeChild(statusElement);

        console.log("보고서 다운로드 완료:", fileName);
        alert(`보고서가 생성되었습니다. (${fileName})\n\n1. HTML 파일을 브라우저에서 열어주세요.\n2. '프린트 / PDF 저장' 버튼을 클릭하여 PDF로 저장하세요.\n3. PDF 파일을 한컴오피스에서 열어 HWP 형식으로 저장할 수 있습니다.`);
    } catch (error) {
        console.error("보고서 생성 오류:", error);
        alert(`보고서 생성 중 오류가 발생했습니다: ${error.message}`);

        // 오류 발생 시 상태 표시 요소 제거 시도
        try {
            const statusElement = document.querySelector("div[style*='position: fixed'][style*='z-index: 9999']");
            if (statusElement && statusElement.parentNode) {
                statusElement.parentNode.removeChild(statusElement);
            }
        } catch (e) {
            console.error("상태 표시 요소 제거 오류:", e);
        }
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
            setSelectedImages(photoList.map((media) => `${process.env.REACT_APP_API_BASE_URL}/admin/api/media/displayImage?filePath=${encodeURIComponent(media.storageUrl)}`));
        }
        setIsAllSelected(!isAllSelected);
    };







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
        const fileURL = `${process.env.REACT_APP_API_BASE_URL}/admin/api/media/displayImage?filePath=${encodeURIComponent(photoList[index].storageUrl)}`;

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
            ? `${process.env.REACT_APP_API_BASE_URL}/admin/api/media/displayImage?filePath=${encodeURIComponent(photoList[currentIndex].storageUrl)}`
            : null;
    //https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/충남/32/media/홍성구룡리_250209082040_ORI.jpg


    const handleDownloadSelectedImages = async () => {
        console.log("🚀 [LOG] 다운로드 준비:", selectedImages.length);
        if (selectedImages.length === 0) return;

        console.log("🚀 [LOG] 다운로드 시작:", selectedImages);

        for (const fileURL of selectedImages) {
            try {
                const response = await fetch(fileURL);
                const blob = await response.blob();
                const blobURL = window.URL.createObjectURL(blob);

                // 파일명 추출 및 정리
                let fileName;
                try {
                    // URL에서 filePath 파라미터 추출
                    const url = new URL(fileURL);
                    const filePath = url.searchParams.get('filePath');

                    if (filePath) {
                        // uploads/250312_1_250314151613_EDIT 형태에서 실제 파일명만 추출
                        const pathParts = filePath.split('/');
                        fileName = pathParts[pathParts.length - 1];
                    } else {
                        // filePath가 없으면 URL의 마지막 부분 사용
                        fileName = fileURL.split("/").pop();
                    }
                } catch (e) {
                    // URL 파싱 오류 시 기본 방식으로 파일명 추출
                    fileName = fileURL.split("/").pop();
                }

                // 유효하지 않은 문자 제거
                fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');

                const link = document.createElement("a");
                link.href = blobURL;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(blobURL);
            } catch (error) {
                console.error("❌ 다운로드 오류:", error);
            }
        }
    };


    /* 전체 다운로드 함수 - ZIP 압축 파일로 다운로드 */
    const handleDownloadAll = async () => {
        console.log("🚀 [LOG] 전체 다운로드 준비:", photoList.length);
        if (photoList.length === 0) {
            alert("다운로드할 사진이 없습니다.");
            return;
        }

        try {
            console.log("🚀 [LOG] ZIP 파일 생성 시작");

            // 사용자에게 진행 상황 표시
            const statusElement = document.createElement("div");
            statusElement.style.position = "fixed";
            statusElement.style.top = "50%";
            statusElement.style.left = "50%";
            statusElement.style.transform = "translate(-50%, -50%)";
            statusElement.style.padding = "20px";
            statusElement.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            statusElement.style.color = "white";
            statusElement.style.borderRadius = "8px";
            statusElement.style.zIndex = "9999";
            statusElement.style.textAlign = "center";
            statusElement.innerHTML = `<div>파일 압축 중...</div><div>0 / ${photoList.length}</div>`;
            document.body.appendChild(statusElement);

            // ZIP 파일 생성
            const zip = new JSZip();
            let processedCount = 0;

            // 사건명 가져오기 (폴더명으로 사용)
            const folderName = selectedCase ? selectedCase.replace(/[/\\?%*:|"<>]/g, '-') : "photos";
            const folder = zip.folder(folderName);

            // 모든 이미지 처리
            for (const media of photoList) {
                try {
                    const fileURL = `${process.env.REACT_APP_API_BASE_URL}/admin/api/media/displayImage?filePath=${encodeURIComponent(media.storageUrl)}`;
                    const response = await fetch(fileURL);
                    const blob = await response.blob();

                    // 파일명 정리 (유효하지 않은 문자 제거)
                    const fileName = (media.fileName || fileURL.split("/").pop()).replace(/[/\\?%*:|"<>]/g, '-');

                    // ZIP에 파일 추가
                    folder.file(fileName, blob);

                    // 진행상황 업데이트
                    processedCount++;
                    statusElement.innerHTML = `<div>파일 압축 중...</div><div>${processedCount} / ${photoList.length}</div>`;

                } catch (error) {
                    console.error(`❌ 이미지 처리 오류 (${media.fileName}):`, error);
                }
            }

            // ZIP 생성 및 다운로드
            statusElement.innerHTML = `<div>ZIP 파일 생성 중...</div>`;
            const zipContent = await zip.generateAsync({ type: "blob" });

            // 현재 날짜와 시간을 포함한 파일명 생성
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
            const zipFileName = `${folderName}.zip`;

            // 다운로드
            saveAs(zipContent, zipFileName);

            // 상태 표시 제거
            document.body.removeChild(statusElement);

            console.log("🚀 [LOG] ZIP 다운로드 완료:", zipFileName);
        } catch (error) {
            console.error("❌ ZIP 생성 오류:", error);
            alert(`다운로드 중 오류가 발생했습니다: ${error.message}`);

            // 오류 발생 시 상태 표시 요소 제거 시도
            try {
                const statusElement = document.querySelector('div[style*="position: fixed"][style*="top: 50%"]');
                if (statusElement) document.body.removeChild(statusElement);
            } catch (e) {
                console.error("상태 표시 요소 제거 오류:", e);
            }
        }
    };


    // 사건 목록 가져오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Using the new API service to get all incidents
                const incidents = await apiService.getAllIncidents();

                console.log("✅ [LOG] 변환 후 데이터:", incidents);
                setIncidentList(incidents);

                // 사건 데이터 구조 확인
                console.log("✅ [LOG] 사건 데이터 예시:", incidents.length > 0 ? incidents[0] : "No incidents");

                // 계층적 구조로 데이터 변환
                const hierarchical = {};

                incidents.forEach(incident => {
                    // createdAt에서 연도 추출 (YYYY-MM-DD 형식 가정)
                    let year = '미지정 연도';
                    if (incident.createdAt && typeof incident.createdAt === 'string') {
                        const dateMatch = incident.createdAt.match(/^(\d{4})/);
                        if (dateMatch) {
                            year = dateMatch[1];
                        }
                    }

                    // 사건명에서 도시 추출 (예: "서울시 강남구 화재")
                    let city = '';

                    // 각 사건에 도시와 연도 정보 추가
                    if(incident.city ){
                        city = incident.city;
                    }else{
                        city = '미지정 지역';
                    }
                    incident.year = year;

                    if (!hierarchical[city]) {
                        hierarchical[city] = {};
                    }

                    if (!hierarchical[city][year]) {
                        hierarchical[city][year] = [];
                    }

                    hierarchical[city][year].push(incident);
                });

                setHierarchicalIncidents(hierarchical);

                // 기본적으로 모든 도시 펼치기
                const initialExpandedCities = {};
                Object.keys(hierarchical).forEach(city => {
                    initialExpandedCities[city] = true;
                });
                setExpandedCities(initialExpandedCities);

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
        setSelectedIncidentId(incident_id); // 선택된 사건 ID 저장
        setShowCasePhotos(true); // 사건별 사진 영역 표시

        try {
            const rsltData = await apiService.getMediaList({incidentId:incident_id});
            console.log("✅ [LOG] 변환된 사건별 미디어 데이터:", rsltData);
            setPhotoList(rsltData); // ✅ 변환된 사건별 미디어 리스트 저장

            // 선택된 사건의 도시와 연도 찾기
            const selectedIncident = incidentList.find(incident => incident.incidentId === incident_id);
            if (selectedIncident) {
                // 이미 city와 year 필드가 있는지 확인
                let city = selectedIncident.city;
                let year = selectedIncident.year;

                // city가 없으면 사건명에서 추출 시도
                if (!city && selectedIncident.incidentName) {
                    const cityMatch = selectedIncident.incidentName.match(/^([\uac00-\ud7a3]+(?:\s?[\uac00-\ud7a3]*\s?(?:\uc2dc|\uad70|\uad6c))?)/);
                    if (cityMatch && cityMatch[1]) {
                        city = cityMatch[1].trim();
                    } else {
                        city = '미지정 지역';
                    }
                }

                // year가 없으면 생성일에서 추출 시도
                if (!year && selectedIncident.createdAt) {
                    const dateMatch = selectedIncident.createdAt.match(/^(\d{4})/);
                    if (dateMatch) {
                        year = dateMatch[1];
                    } else {
                        year = '미지정 연도';
                    }
                }

                // 해당 도시와 연도 펼치기
                setExpandedCities(prev => ({
                    ...prev,
                    [city]: true
                }));

                setExpandedYears(prev => ({
                    ...prev,
                    [`${city}-${year}`]: true
                }));
            }
        } catch (error) {
            console.error("API 요청 오류:", error);
        } finally {
            setLoading(false);
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
                            <div style={{ paddingLeft: "5px" }}>
                                {Object.keys(hierarchicalIncidents).sort().map(city => (
                                    <div key={city} style={{ marginBottom: "15px" }}>
                                        {/* 도시 레벨 */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: '#f5f5f5',
                                                padding: '8px',
                                                borderRadius: '4px',
                                                marginBottom: '5px'
                                            }}
                                            onClick={() => setExpandedCities(prev => ({
                                                ...prev,
                                                [city]: !prev[city]
                                            }))}
                                        >
                                            <span style={{ marginRight: '5px' }}>
                                                {expandedCities[city] ? '▼' : '►'}
                                            </span>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                {city} ({Object.values(hierarchicalIncidents[city]).flat().length})
                                            </Typography>
                                        </div>

                                        {/* 연도 레벨 */}
                                        {expandedCities[city] && (
                                            <div style={{ paddingLeft: "15px" }}>
                                                {Object.keys(hierarchicalIncidents[city]).sort().reverse().map(year => (
                                                    <div key={`${city}-${year}`} style={{ marginBottom: "10px" }}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                cursor: 'pointer',
                                                                padding: '5px 0'
                                                            }}
                                                            onClick={() => setExpandedYears(prev => ({
                                                                ...prev,
                                                                [`${city}-${year}`]: !prev[`${city}-${year}`]
                                                            }))}
                                                        >
                                                            <span style={{ marginRight: '5px' }}>
                                                                {expandedYears[`${city}-${year}`] ? '▼' : '►'}
                                                            </span>
                                                            <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#555' }}>
                                                                {year}년 ({hierarchicalIncidents[city][year].length})
                                                            </Typography>
                                                        </div>

                                                        {/* 개별 사건 레벨 */}
                                                        {expandedYears[`${city}-${year}`] && (
                                                            <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                                                                {hierarchicalIncidents[city][year].map((incident) => (
                                                                    <li key={incident.incidentId} style={{
                                                                        marginBottom: "8px",
                                                                        backgroundColor: selectedIncidentId === incident.incidentId ? '#e3f2fd' : 'transparent',
                                                                        padding: "5px",
                                                                        borderRadius: "4px",
                                                                        border: selectedIncidentId === incident.incidentId ? '1px solid #90caf9' : 'none'
                                                                    }}>
                                                                        <Link
                                                                            href="#"
                                                                            underline="hover"
                                                                            sx={{
                                                                                color: selectedIncidentId === incident.incidentId ? '#0d47a1' : '#1976d2',
                                                                                cursor: "pointer",
                                                                                fontWeight: selectedIncidentId === incident.incidentId ? 'bold' : 'normal'
                                                                            }}
                                                                            onClick={() => handleCaseSelect(incident.incidentId, incident.incidentName)}
                                                                        >
                                                                            {incident.incidentName}
                                                                            <br />
                                                                            <Typography variant="body2" color={selectedIncidentId === incident.incidentId ? 'text.primary' : 'gray'}>
                                                                                {formatDate(incident.createdAt)}
                                                                            </Typography>
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                    </CardContent>
                </Card>
            </Box>

            {/* 사건별 미디어 목록 (사건 선택 시 표시) */}
            {/*{showCasePhotos && (*/}
            {/*    <Box sx={{ width: "300px", height: "100%", padding: 0.5 }}>*/}
            {/*        <Card sx={{ height: "100%", backgroundColor: "#fff", borderRadius: "12px" }}>*/}
            {/*            <CardContent>*/}
            {/*                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>*/}
            {/*                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>*/}
            {/*                        사건: {selectedCase}*/}
            {/*                    </Typography>*/}
            {/*                    <IconButton onClick={handleToggleCasePhotos} sx={{ color: "#1976d2" }}>*/}
            {/*                        {showCasePhotos ? <ChevronLeftIcon /> : <ChevronRightIcon />}*/}
            {/*                    </IconButton>*/}
            {/*                </Box>*/}

            {/*                /!* 파일 목록 *!/*/}
            {/*                <ul style={{ paddingLeft: "10px", marginTop: "10px" }}>*/}
            {/*                    {photoList?.filter(Boolean).map((media, idx) => {*/}
            {/*                        if (!media.fileName) return null;*/}

            {/*                        // const baseURL = "https://jpwesurfogxi27592534.gcdn.ntruss.com/fc/files/";*/}
            {/*                        // const fileURL = `${baseURL}${media.region}/${media.incidentId}/media/${media.fileName}`;*/}

            {/*                        const trimmedCaseName = selectedCase.replace(/\s/g, "");*/}

            {/*                        // 🔥 사건명과 확장자 제거*/}
            {/*                        const cleanedFileName = media.fileName*/}
            {/*                            .replace(new RegExp(`^${trimmedCaseName}_`), "")*/}
            {/*                            .replace(/\.(jpg|jpeg|png|mp4)$/i, "");*/}

            {/*                        return (*/}
            {/*                            <li key={idx} style={{ marginBottom: "5px" }}>*/}
            {/*                                <Link href="#" onClick={() => updateSelectedImage(idx)} underline="hover" sx={{ color: "#1976d2" }}>*/}
            {/*                                    {idx + 1}. {cleanedFileName} /!* ✅ 사진 번호 추가 및 클릭 시 미리보기 변경 *!/*/}
            {/*                                </Link>*/}
            {/*                            </li>*/}
            {/*                        );*/}
            {/*                    })}*/}
            {/*                </ul>*/}
            {/*            </CardContent>*/}

            {/*            /!* 🔥 전체 다운로드 버튼 추가 *!/*/}
            {/*            <Box sx={{ display: "flex", justifyContent: "center", paddingBottom: "10px" }}>*/}
            {/*                <Button variant="contained" color="primary" onClick={handleDownloadAll}>*/}
            {/*                    전체 다운로드*/}
            {/*                </Button>*/}
            {/*            </Box>*/}
            {/*        </Card>*/}
            {/*    </Box>*/}
            {/*)}*/}



            <Box sx={{
                    flex: 1,
                    padding: 0.5,
                    height: "calc(100vh - 100px)",
                    display: "flex",
                    flexDirection: "column"
                }}>
                <Card
                    sx={{
                        flex: 1,
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "0px",
                        overflow: "hidden",
                        maxHeight: "100%"
                    }}
                >
                    {/* Header - Fixed at top */}
                    <CardContent sx={{ padding: 2, flexShrink: 0 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                사건: {selectedCase}
                            </Typography>
                            <IconButton onClick={handleToggleCasePhotos} sx={{ color: "#1976d2" }}>
                                {showCasePhotos ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                            </IconButton>
                        </Box>
                    </CardContent>

                    {/* Make the entire content area scrollable */}
                    <Box sx={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
                        {/* Image preview area */}
                        <Box
                            sx={{
                                width: "100%",
                                //height: "900px",
                                height: "calc(60vh - 150px)",  // ✅ 브라우저 높이의 60%로 설정 (반응형)
                                maxHeight: "900px",  // ✅ 최대 높이 제한
                                minHeight: "400px",  // ✅ 최소 높이 설정 (너무 작아지는 것 방지)
                                border: "2px solid #d1d1d1",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                backgroundColor: "#f9f9f9",
                                marginBottom: "16px",
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

                    {/* 🔥 사진 정보 전시 영역 (2열 배치) */}
                    <Box sx={{ marginTop: "16px" }}>
                        <Box sx={{ paddingTop: "0px", borderBottom: "2px solid #d1d1d1" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
                                📌 사진 정보
                            </Typography>
                            {photoList.length > 0 ? (
                                <Grid container spacing={2}>
                                    {/* 왼쪽 정보 (사건명, 사진명, 촬영일자, 업로드일자) */}
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>📁 사건명:</strong> {selectedCase || "미지정"}</Typography>
                                        <Typography variant="body1"><strong>📷 사진명:</strong> {photoList[currentIndex]?.fileName || "이름 없음"}</Typography>
                                        <Typography variant="body1"><strong>📅 촬영일자:</strong> {photoList[currentIndex]?.capturedAt || "정보 없음"}</Typography>
                                        <Typography variant="body1"><strong>📤 업로드일자:</strong> {photoList[currentIndex]?.uploadedAt || "정보 없음"}</Typography>
                                    </Grid>

                                    {/* 오른쪽 정보 (원본/편집, 해상도, 위치) */}
                                    <Grid item xs={6}>
                                        <Typography variant="body1"><strong>🔄 원본/편집:</strong> {photoList[currentIndex]?.version === "edited" ? "편집됨" : "원본"}</Typography>
                                        <Typography variant="body1"><strong>🔍 해상도:</strong> {photoList[currentIndex]?.resolution || "정보 없음"}</Typography>
                                        <Typography variant="body1"><strong>📍 위치:</strong> {photoList[currentIndex]?.locationAddress || "미등록"}</Typography>
                                    </Grid>

                                    {/* 📝 메모 (하단 전체 차지) */}
                                    <Grid item xs={12}>
                                        <Typography variant="body1" sx={{ color: "blue", paddingTop: 1, borderTop: "1px solid #d1d1d1" }}>
                                            <strong>📝 메모:</strong>
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: 'pre-line',
                                                backgroundColor: '#f5f5f5',
                                                padding: 1.5,
                                                borderRadius: 1,
                                                marginTop: 0.5
                                            }}
                                        >
                                            {formatMemo(photoList[currentIndex]?.memo) || "메모 없음"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography variant="body2" sx={{ color: "gray" }}>
                                    📌 미리보기할 사진을 선택하세요.
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* 섬네일 네비게이션 영역 */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", marginTop: "16px" }}>
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
                                                {media.fileName}
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

                    {/* 다운로드 버튼 영역 */}
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", paddingBottom: "10px", marginTop: "16px" }}>
                        <Button variant="contained" color="secondary" onClick={handleDownloadReport}>
                            보고서 다운로드
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleDownloadAll}>
                            전체 다운로드
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleDownloadSelectedImages}>
                            선택 다운로드
                        </Button>
                    </Box>

                    </Box>
                </Card>
            </Box>
        </Box>
    );
};

export default DataManagement;


