# Category Management System

## Overview

This update adds a dynamic category management system that allows admins to create, manage, and display categories with images throughout the application.

## Features Added

### 1. Category Model Enhancement

- Added `image` field to the Category model
- Categories now require both name and image

### 2. Admin Category Management

- **Location**: `/admin/categories`
- **Features**:
  - Add new categories with name and image upload
  - Image preview before upload
  - Delete existing categories
  - Grid view of all categories with images
  - Form validation (both name and image required)

### 3. Dynamic Navigation

- Navbar now displays categories dynamically from the database
- Categories are automatically converted to URL-friendly slugs
- Loading states handled gracefully

### 4. Dynamic Collections Grid

- Homepage collections grid now shows categories from the database
- Loading skeletons while data is being fetched
- Error handling for failed API calls
- Responsive grid layout maintained

### 5. Image Upload System

- Uses Cloudinary for image storage
- Multer middleware for handling file uploads
- Images stored in "categories" folder on Cloudinary
- Automatic image optimization and CDN delivery

## API Endpoints

### GET `/api/categories`

- Returns all categories with their images
- Used by both navbar and collections grid

### POST `/api/categories`

- Creates a new category
- Requires multipart form data with `name` and `image` fields
- Uploads image to Cloudinary
- Returns the created category

### DELETE `/api/categories/:id`

- Deletes a category by ID
- Requires confirmation

## File Structure Changes

```
server/
├── models/Category.js (updated)
├── routes/categories.js (updated)
├── utils/cloudinary.js (existing)
└── seed-categories.js (new)

src/
├── hooks/useCategories.ts (new)
├── components/
│   ├── CollectionGrid.tsx (updated)
│   └── Navbar.tsx (updated)
└── app/admin/categories/page.tsx (updated)
```

## Setup Instructions

1. **Install Dependencies**:

   ```bash
   cd server
   npm install multer @types/multer
   ```

2. **Environment Variables**:
   Ensure your `.env` file has Cloudinary credentials:

   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Seed Default Categories** (Optional):
   ```bash
   cd server
   node seed-categories.js
   ```

## Usage

### Adding a New Category

1. Navigate to `/admin/categories`
2. Fill in the category name
3. Select an image file
4. Preview the image
5. Click "Add Category"

### How Categories Appear

- **Navbar**: Categories appear as navigation links
- **Collections Grid**: Categories appear as collection cards on the homepage
- **URLs**: Category names are converted to URL-friendly slugs (e.g., "Cover Ups" → "cover-ups")

## Technical Notes

- Categories are fetched using a custom `useCategories` hook
- Loading states are handled with skeleton components
- Error boundaries provide graceful fallbacks
- Images are optimized and served via Cloudinary CDN
- URL slugs are generated automatically from category names

## Future Enhancements

- Category editing functionality
- Category ordering/positioning
- Category-specific product filtering
- Category descriptions and metadata
- Bulk category operations

