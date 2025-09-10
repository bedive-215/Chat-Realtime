import multer from "multer";

const storage = multer.memoryStorage(); // không ghi file tạm
const upload = multer({ storage });

export default upload;
