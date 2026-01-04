
# 📝 NoteVault

A modern, feature-rich web-based notes application built with vanilla JavaScript, Bootstrap, and LocalStorage. Create, edit, search, and manage your notes with a beautiful, responsive interface that supports both light and dark themes.

## ✨ Features

### Core Functionality
- **Create Notes** - Add new notes with titles and descriptions
- **Edit Notes** - Update existing notes with ease
- **Delete Notes** - Remove notes with confirmation dialog (requires typing the note title)
- **View Notes** - Full-screen view of note content
- **Search Notes** - Real-time search through all notes by title or content
- **Duplicate Prevention** - Prevents creating notes with duplicate titles

### Additional Features
- **Multiple Export Formats** - Download notes as:
  - PDF (using jsPDF)
  - TXT (Plain Text)
  - Markdown (.md)
  - JSON (Structured data)
- **Copy to Clipboard** - Quick copy functionality for note content
- **Share Notes** - Native share API support with clipboard fallback
- **Dark/Light Theme** - Toggle between themes with persistent preference
- **Audio Notifications** - Sound feedback for user actions
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + K` - Focus search bar
  - `Ctrl/Cmd + N` - Open new note modal
  - `Ctrl/Cmd + Enter` - Submit note from modal

### User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Toast Notifications** - Visual feedback for all actions
- **Loading Spinners** - Smooth loading indicators for async operations
- **Empty States** - Helpful messages when no notes exist
- **Note Previews** - Truncated previews with full content on hover
- **Date Stamps** - Automatic timestamp for each note

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables for theming
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Bootstrap 5.3.2** - UI components and responsive grid
- **Bootstrap Icons** - Icon library
- **Google Fonts (Nunito)** - Typography
- **jsPDF 2.5.1** - PDF generation
- **LocalStorage API** - Client-side data persistence

## 📁 Project Structure

```
NoteVault/
├── index.html              # Main HTML file
├── README.md               # Project documentation
├── License.md              # MIT License
├── .gitignore             # Git ignore rules
└── assets/
    ├── css/
    │   └── style.css      # Custom styles and theme variables
    ├── js/
    │   └── script.js      # Main application logic
    └── audio/
        └── notify.mp3     # Notification sound
```

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NoteVault
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - No build process or dependencies required!

### Usage

1. **Create a Note**
   - Click the `+` button in the navbar
   - Or press `Ctrl/Cmd + N`
   - Enter a title and description
   - Click "Add Note"

2. **Search Notes**
   - Type in the search box in the navbar
   - Or press `Ctrl/Cmd + K` to focus search
   - Results filter in real-time

3. **Manage Notes**
   - Click the three-dot menu (⋮) on any note card
   - Options available:
     - **View** - See full note content
     - **Edit** - Modify the note
     - **Delete** - Remove the note (requires confirmation)
     - **Copy** - Copy to clipboard
     - **Download** - Export in various formats
     - **Share** - Share via native share API

4. **Toggle Theme**
   - Click the moon/sun icon in the navbar
   - Theme preference is saved automatically

## 💾 Data Storage

All notes are stored locally in your browser's LocalStorage. This means:
- ✅ No server required
- ✅ Works offline
- ✅ Data persists between sessions
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete notes

## 🎨 Customization

### Theme Colors

The app uses CSS variables for easy theming. Edit `assets/css/style.css` to customize:

```css
:root {
  --bg: #f5f7fb;           /* Background color */
  --card: #ffffff;          /* Card background */
  --text: #1f2937;          /* Text color */
  --accent: #2563eb;        /* Primary accent */
  --border: #e5e7eb;        /* Border color */
}

.dark-mode {
  --bg: #0f172a;
  --card: #1e293b;
  --text: #e5e7eb;
  --accent: #38bdf8;
  --border: #334155;
}
```

## 🔒 Privacy & Security

- All data is stored locally in your browser
- No data is sent to external servers
- No tracking or analytics
- Works completely offline

## 📝 License

This project is licensed under the MIT License - see the [License.md](License.md) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to:
1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

If you encounter any issues or have questions, please open an issue on the repository.

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the UI framework
- [Bootstrap Icons](https://icons.getbootstrap.com/) for icons
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [Google Fonts](https://fonts.google.com/) for typography

---

**Made with ❤️ for note-taking enthusiasts**
