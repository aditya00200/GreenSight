# 🌿 GreenSight

**GreenSight** is a web application that analyzes the sustainability of products from uploaded images using the Google Gemini API. It provides insights such as environmental impact, carbon footprint, materials used, and sustainable alternatives to help users make eco-friendly choices.  

---

## 🔹 Features

- Upload product images for sustainability analysis  
- Drag-and-drop image upload with preview  
- Loading animation while analysis is running  
- Detailed sustainability report including:  
  - Product name and category  
  - Sustainability score (0–100) with progress bar  
  - Environmental impact explanation  
  - Estimated materials used  
  - Carbon footprint estimation  
  - Suggested sustainable alternatives  
  - Tips for more sustainable usage  
- Modern, responsive, and clean UI  
- Error handling for invalid file types and large images  

---

## 🛠️ Tech Stack  
- HTML5  
- CSS3  
- Vanilla JavaScript  
- Python Flask  
- Google Gemini API 
---

## 🔹 Project Structure
```
GreenSight/
│
├── app.py                   # Flask backend
├── requirements.txt         # Python dependencies
├── README.md                # Project documentation
├── static/
│   ├── style.css            # CSS styles
│   └── script.js            # Frontend JS for image upload & API calls
├── templates/
│   └── index.html           # Frontend HTML
└── uploads/                 # Temporary storage for uploaded images
```
---

## 🔹 How It Works

1. User opens the homepage and uploads a product image.  
2. The frontend sends the image via POST request to `/analyze`.  
3. Flask saves the image temporarily and sends it to the Gemini API.  
4. Gemini API returns a JSON with:  
   - Product name & category  
   - Sustainability score  
   - Environmental impact  
   - Materials likely used  
   - Carbon footprint  
   - Sustainable alternatives  
   - Sustainability tips  
5. Frontend displays results in visually appealing cards with animations.  

---

## 🔹 Usage

1. Drag and drop or select an image of a product.  
2. Wait for the analysis to complete.  
3. View the sustainability report including score, impact, alternatives, and tips.  

---

## 🔹 Error Handling

- Only image files are allowed (`.jpg`, `.jpeg`, `.png`,`.webp`).  
- Maximum image size is limited to 16MB.  
- API errors are displayed to the user.  

---

## 🔹 Author

**-Aditya Sharma**  
