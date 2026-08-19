# Google Cloud Vision Setup

1. Create/select a Google Cloud project and enable billing.
2. Enable the Cloud Vision API.
3. Create a server-side API key and restrict it to the Vision API and your intended server usage where possible.
4. Put the key in `GOOGLE_VISION_API_KEY`.

The app posts base64 image content to `https://vision.googleapis.com/v1/images:annotate` and requests:

- `WEB_DETECTION`
- `TEXT_DETECTION`
- `LOGO_DETECTION`
- `LANDMARK_DETECTION`
- `LABEL_DETECTION`

`FACE_DETECTION` is deliberately not requested.
