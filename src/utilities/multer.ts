import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const allowedTypes = ["image", "application"];
    const split = file.mimetype.split("/")[0];

    if (
      !allowedTypes.includes(split) ||
      (split === "application" && file.mimetype !== "application/pdf")
    ) {
      cb(new Error("invalid image format"), "");
    }

    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
