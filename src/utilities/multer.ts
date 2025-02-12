import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const split = file.mimetype.split("/")[0];

    if (split !== "image") {
      cb(new Error("invalid image format"), "");
    }

    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
