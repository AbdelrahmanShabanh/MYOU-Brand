# Hero Slider & Dynamic Categories Management

## Overview

This update adds comprehensive management for both categories and hero slider content, making the entire system dynamic and admin-controllable.

## New Features

### 1. Dynamic Categories Management

- **Location**: `/admin/categories` (Categories tab)
- **Features**:
  - Add new categories with name and image upload
  - Edit existing categories (name and image)
  - Delete existing categories
  - Categories automatically appear in the collections grid
  - Image preview before upload
  - Form validation
  - Modal-based edit interface

### 2. Hero Slider Management

- **Location**: `/admin/categories` (Hero Slider tab)
- **Features**:
  - Add new hero slides with title, subtitle, and image
  - Edit existing slides (title, subtitle, image)
  - Toggle slide active/inactive status
  - Delete slides
  - Automatic ordering system
  - Image preview before upload
  - Modal-based edit interface

### 3. Dynamic Frontend Components

- **CollectionGrid**: Now displays categories from database instead of hardcoded data
- **Hero**: Now displays hero slides from database instead of hardcoded data
- **Loading States**: Proper loading skeletons for both components
- **Error Handling**: Graceful error handling with fallback content

## Database Models

### Category Model

```javascript
{
  name: String (required, unique),
  image: String (required),
  timestamps: true
}
```

### HeroSlider Model

```javascript
{
  image: String (required),
  title: String (required),
  subtitle: String (required),
  order: Number (default: 0),
  isActive: Boolean (default: true),
  timestamps: true
}
```

## API Endpoints

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (with image upload)
- `PUT /api/categories/:id` - Update category (with optional image upload)
- `DELETE /api/categories/:id` - Delete category

### Hero Slider

- `GET /api/hero-slider` - Get active hero slides (public)
- `GET /api/hero-slider/admin` - Get all hero slides (admin)
- `POST /api/hero-slider` - Create new hero slide (with image upload)
- `PUT /api/hero-slider/:id` - Update hero slide (with optional image upload)
- `DELETE /api/hero-slider/:id` - Delete hero slide
- `POST /api/hero-slider/reorder` - Reorder slides

## File Structure Changes

```
server/
├── models/
│   ├── Category.js (existing)
│   └── HeroSlider.js (new)
├── routes/
│   ├── categories.js (updated - added PUT route)
│   └── heroSlider.js (new)
├── seed-hero-slider.js (new)
└── index.js (updated)

src/
├── hooks/
│   ├── useCategories.ts (existing)
│   └── useHeroSlider.ts (new)
├── components/
│   ├── CollectionGrid.tsx (updated)
│   └── Hero.tsx (updated)
└── app/admin/categories/page.tsx (updated - added edit functionality)
```

## Setup Instructions

1. **Install Dependencies** (if not already installed):

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

3. **Seed Initial Data** (Optional):

   ```bash
   cd server
   node seed-hero-slider.js
   ```

4. **Start the Server**:
   ```bash
   cd server
   npm start
   ```

## Usage

### Managing Categories

1. Navigate to `/admin/categories`
2. Click on "Categories" tab
3. **Add Category**:
   - Fill in category name and select image
   - Preview image and click "Add Category"
4. **Edit Category**:
   - Click the edit icon (pencil) on any category
   - Modify name and/or upload new image
   - Click "Update Category"
5. **Delete Category**:
   - Click the delete icon (trash) on any category
   - Confirm deletion
6. Categories automatically appear in the collections grid

### Managing Hero Slider

1. Navigate to `/admin/categories`
2. Click on "Hero Slider" tab
3. **Add Hero Slide**:
   - Fill in title, subtitle, and select image
   - Preview image and click "Add Hero Slide"
4. **Edit Hero Slide**:
   - Click the edit icon (pencil) on any slide
   - Modify title, subtitle, and/or upload new image
   - Click "Update Slide"
5. **Toggle Slide Status**:
   - Use the Active/Inactive button to show/hide slides
6. **Delete Slide**:
   - Click the delete icon (trash) on any slide
   - Confirm deletion
7. Slides automatically appear on the homepage

### How It Works

- **Categories**: When you add a category, it automatically appears in the collections grid on the homepage
- **Hero Slider**: When you add a hero slide, it automatically appears in the hero section on the homepage
- **URL Generation**: Category names are automatically converted to URL-friendly slugs
- **Image Storage**: All images are uploaded to Cloudinary for optimization and CDN delivery
- **Edit Modals**: Both categories and hero slides use modal dialogs for editing
- **Image Updates**: When editing, you can optionally upload new images or keep the existing ones

## Technical Notes

- Both components use custom hooks for data fetching
- Loading states are handled with skeleton components
- Error boundaries provide graceful fallbacks
- Images are optimized and served via Cloudinary CDN
- URL slugs are generated automatically from category names
- Hero slides can be activated/deactivated without deletion
- Edit functionality includes image preview and optional image updates
- Modal-based editing provides a clean user experience

## Troubleshooting

### Common Issues

1. **404 Error on Hero Slider API**:

   - Ensure the server is running (`npm start` in server directory)
   - Check that the hero slider routes are properly registered in `server/index.js`
   - Verify the `heroSlider.js` file exists in `server/routes/`

2. **Image Upload Issues**:

   - Verify Cloudinary credentials in `.env` file
   - Check that multer is properly installed
   - Ensure the upload folder exists on Cloudinary

3. **Edit Modal Not Working**:
   - Check browser console for JavaScript errors
   - Verify that all required state variables are properly initialized

## Future Enhancements

- Drag-and-drop reordering for hero slides
- Category-specific product filtering
- Hero slide scheduling (show/hide by date)
- Bulk operations for both categories and slides
- Image cropping and editing tools
- Category descriptions and metadata
- Advanced image optimization options
