# Cloudinary Setup Instructions

Your Cloudinary credentials are now configured in `.env`:
- **Cloud Name**: `ddlakf6mp`
- **API Key**: `645285537343542`
- **API Secret**: `vFPekjlZrf2ENm3y7119hfvyQ3M`

## 🚀 Next Steps: Create Upload Preset

You need to create an upload preset in your Cloudinary dashboard:

### 1. Go to Cloudinary Dashboard
Visit: https://cloudinary.com/console

### 2. Navigate to Upload Settings
- Click on **Settings** (gear icon)
- Click on **Upload** tab

### 3. Create Upload Preset
- Click **Add upload preset**
- **Preset name**: `storyweave_uploads`
- **Signing mode**: Select **Unsigned**
- **Folder**: `storyweave`

### 4. Configure Upload Settings
- **Allowed formats**: `jpg,png,gif,webp`
- **Max file size**: `10MB`
- **Auto backup**: Enable (recommended)
- **Overwrite**: Enable
- **Use filename**: Enable

### 5. Save the Preset
Click **Save** to create the preset.

## 🧪 Test Upload

You can test the upload with this JavaScript code:

```javascript
const formData = new FormData();
formData.append('file', yourFile);
formData.append('upload_preset', 'storyweave_uploads');
formData.append('folder', 'storyweave');

fetch('https://api.cloudinary.com/v1_1/ddlakf6mp/image/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload successful:', data))
.catch(error => console.error('Upload failed:', error));
```

## ✅ Verification

After creating the preset, your uploads should work with these URLs:
- **Upload URL**: `https://api.cloudinary.com/v1_1/ddlakf6mp/image/upload`
- **Image URL**: `https://res.cloudinary.com/ddlakf6mp/image/upload/v1234567890/storyweave/filename.jpg`

## 🔧 What's Already Configured

Your `.env` file now has:
```env
VITE_CLOUDINARY_CLOUD_NAME=ddlakf6mp
VITE_CLOUDINARY_API_KEY=645285537343542
CLOUDINARY_API_SECRET=vFPekjlZrf2ENm3y7119hfvyQ3M
VITE_CLOUDINARY_UPLOAD_PRESET=storyweave_uploads
VITE_CLOUDINARY_FOLDER=storyweave
```

Once you create the upload preset, your art gallery upload feature will be ready to use!
