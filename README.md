# 🐉 Yashika OS

<div align="center">

### *A Hyperrealistic Cybersecurity Operating System Simulator*

**Experience the power of Kali Linux in your browser**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff.svg)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

**Yashika OS** is a cutting-edge, browser-based cybersecurity operating system simulator inspired by Kali Linux. Built with React, TypeScript, and modern web technologies, it delivers a fully immersive, interactive desktop environment complete with authentic boot sequences, terminal emulation, hacking tools, AI assistance, and a comprehensive suite of productivity applications.

Perfect for:
- 🎓 **Cybersecurity Education** - Learn penetration testing in a safe, simulated environment
- 🧪 **Security Research** - Experiment with security tools without risk
- 💻 **Portfolio Showcase** - Demonstrate advanced web development skills
- 🎨 **UI/UX Inspiration** - Experience modern, animated desktop interfaces
- 🚀 **Web Technology Innovation** - See what's possible with modern browsers

---

## ✨ Features

### 🖥️ **Complete Desktop Environment**

- **Authentic Boot Sequence** - Matrix rain animation, BIOS simulation, and progressive system initialization
- **Dynamic Wallpapers** - Multiple stunning backgrounds with smooth transitions
- **Window Management** - Full drag, resize, minimize, maximize, and close functionality
- **App Drawer** - Modern, animated application launcher with search and categorization
- **Context Menus** - Right-click functionality throughout the OS
- **System Tray** - Real-time system information, notifications, and quick settings
- **Taskbar** - Active window management with live previews and pinned apps

### 🔐 **Cybersecurity Arsenal**

#### **Kali Tools Suite**
Access 20+ professional penetration testing tools across multiple categories:

- **Information Gathering** - Nmap, Dmitry, TheHarvester, and more
- **Vulnerability Analysis** - Nikto, OpenVAS, automated scanners
- **Web Application Analysis** - SQLmap, WPScan, Burp Suite simulation
- **Password Attacks** - John the Ripper, Hydra, Hashcat
- **Wireless Attacks** - Aircrack-ng, Kismet
- **Exploitation Tools** - Metasploit Framework, Armitage
- **Sniffing & Spoofing** - Wireshark, Bettercap

#### **Advanced Terminal Emulator**
Full-featured bash-like terminal with:
- 60+ simulated Linux commands (ls, cd, cat, grep, find, ps, etc.)
- Realistic command output and error handling
- Command history and tab completion
- Piping and redirection support
- Color-coded syntax highlighting
- Multiple terminal instances
- Persistent command history

#### **Network Monitor & Analyzer**
Real-time network security monitoring:
- Live packet capture and analysis
- Intrusion Detection System (IDS) alerts
- Port scanning simulation
- Traffic visualization with charts
- Protocol analysis
- Threat intelligence integration
- DNS query monitoring

### 🤖 **AI-Powered Features**

#### **Ayush GPT Assistant**
Your personal AI companion powered by Google Gemini:
- Natural language conversation
- Code assistance and debugging
- Security tool recommendations
- Learning resources and tutorials
- Context-aware responses
- Markdown rendering
- Command suggestions

### 📁 **Virtual File System**

- **Hierarchical Structure** - Complete Unix-like directory tree (/home, /etc, /var, etc.)
- **File Operations** - Create, read, edit, delete, move, and copy files
- **Permissions System** - Realistic Unix permissions (rwx)
- **File Explorer** - Modern GUI with list and grid views
- **Quick Navigation** - Breadcrumbs, favorites, and recent files
- **Search Functionality** - Find files across the entire system
- **Trash Management** - Recover accidentally deleted files

### 🛠️ **Productivity Applications**

#### **Office Suite**
- **Text Editor** - Syntax highlighting, line numbers, multi-file support
- **VS Code Clone** - Professional code editor with Monaco integration
- **Excel Simulator** - Spreadsheet with formulas and charts
- **PowerPoint** - Presentation creator with slide management
- **Notes** - Markdown-enabled note-taking with live preview

#### **Creative Tools**
- **Paint** - Digital canvas with brushes, shapes, and color picker
- **Camera** - Webcam integration with photo capture and filters

#### **Entertainment & Media**
- **Games Arcade** - Multiple games including Tic-Tac-Toe, Pong, Ping Pong, Tetris, and more
- **YouTube Clone** - Video streaming interface
- **Spotify Clone** - Music player with playlists and controls
- **Browser** - Fully functional web browser with tabs and bookmarks

#### **System Utilities**
- **Task Manager** - Monitor CPU, memory, and running processes
- **Settings** - Comprehensive system configuration
  - Display settings (resolution, wallpaper, themes)
  - Network configuration
  - User account management
  - Privacy & security settings
  - Appearance customization (dark/light mode)
  - Keyboard & mouse settings
  - Date & time configuration
- **Clock** - World clock with alarms and stopwatch

### 🎨 **Visual Excellence**

- **Modern Glassmorphism UI** - Translucent, blurred backgrounds with vibrant accents
- **Smooth Animations** - Framer Motion powered transitions throughout
- **Responsive Design** - Adapts beautifully to all screen sizes
- **Custom Icons** - Lucide React icon library integration
- **Dynamic Themes** - Dark mode with customizable accent colors
- **Micro-interactions** - Hover effects, ripples, and state feedback

### 🔧 **Technical Highlights**

- **React 19** - Latest features including concurrent rendering
- **TypeScript** - Full type safety and IntelliSense support
- **Vite** - Lightning-fast development and optimized builds
- **Context API** - Centralized state management for file system and OS state
- **React Lazy Loading** - Code-splitting for optimal performance
- **LocalStorage Persistence** - Save your work between sessions
- **Recharts Integration** - Beautiful data visualization
- **Sound Effects** - Authentic system sounds for all actions

---

## 🚀 Demo

### Boot Sequence
Experience the authentic OS boot process with Matrix rain, BIOS simulation, and system initialization.

### Desktop Environment
A fully functional desktop with taskbar, app drawer, window management, and context menus.

### Terminal in Action
Execute real penetration testing commands with realistic output and colorized syntax.

### Applications Gallery
Browse through 20+ applications including productivity tools, entertainment apps, and security utilities.

*(Screenshots and demo videos coming soon!)*

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Gemini API Key** (for AI features) - [Get yours here](https://ai.google.dev/)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayushdevx/yashika-Os.git
   cd yashika-Os
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Production Build

```bash
npm run build
npm run preview
```

The optimized build will be in the `dist/` directory.

---

## 🎮 Usage

### First Login

1. **Boot Screen** - Watch the Matrix rain and system initialization
2. **Login** - Enter any username (default: `yashika`) and password
3. **Desktop** - Welcome to Yashika OS!

### Opening Applications

- **App Drawer** - Click the grid icon in the taskbar
- **Search** - Type to filter applications
- **Categories** - Browse by System, Office, Internet, or Entertainment

### Using the Terminal

```bash
# List files
ls -la

# Navigate directories
cd /home/yashika/Documents

# View file contents
cat mission_brief.txt

# Run security scans
nmap -v -A 10.10.11.1

# Password cracking simulation
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt

# View processes
ps aux

# Check network connections
netstat -tulpn
```

### File Management

- **Create Files** - Right-click → New File
- **Edit Files** - Double-click to open in Text Editor
- **Organize** - Drag and drop to move files
- **Delete** - Send to trash (recoverable)

### AI Assistant

1. Open "Ayush GPT" from the app drawer
2. Ask questions about:
   - Cybersecurity concepts
   - How to use tools
   - Programming help
   - General knowledge
3. Get intelligent, context-aware responses

### Customization

**Settings → Appearance**
- Change wallpaper
- Toggle dark/light mode
- Adjust accent colors
- Customize taskbar

**Settings → System**
- Monitor resource usage
- Configure network
- Manage user accounts

---

## 🏗️ Architecture

### Project Structure

```
yashika-Os/
├── components/           # React components
│   ├── apps/            # Application components
│   │   ├── Terminal.tsx
│   │   ├── KaliTools.tsx
│   │   ├── Browser.tsx
│   │   ├── Settings.tsx
│   │   ├── Games.tsx
│   │   └── ... (15+ more apps)
│   └── os/              # OS UI components
│       ├── Taskbar.tsx
│       ├── AppDrawer.tsx
│       ├── Window.tsx
│       └── ContextMenu.tsx
├── contexts/            # React Context providers
│   └── OSContext.tsx    # Global OS state
├── services/            # External services
│   └── gemini.ts        # AI integration
├── utils/               # Utility functions
│   ├── fileSystem.ts
│   └── soundEffects.ts
├── types.ts             # TypeScript definitions
├── constants.tsx        # App registry & configs
├── App.tsx              # Main application
└── index.tsx            # Entry point
```

### Key Technologies

- **React 19.2.0** - UI framework with latest features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Build tool and dev server
- **Lucide React** - Icon library (500+ icons)
- **Recharts** - Data visualization
- **Google Generative AI** - AI capabilities
- **Framer Motion** (implied) - Animations

### State Management

- **OSContext** - Centralized file system, window management, and system state
- **useState** - Local component state
- **useEffect** - Side effects and lifecycle
- **localStorage** - Persistence across sessions

---

## 🎓 Educational Value

Yashika OS serves as an excellent learning resource for:

### Web Development
- Advanced React patterns (Context, Hooks, Lazy Loading)
- TypeScript best practices
- Component architecture and composition
- State management strategies
- Performance optimization

### UI/UX Design
- Desktop application paradigms
- Glassmorphism and modern design trends
- Accessibility considerations
- Animation and micro-interactions
- Responsive design principles

### Cybersecurity
- Penetration testing methodology
- Security tool categories and usage
- Network analysis and monitoring
- Linux command-line proficiency
- Ethical hacking fundamentals

---

## 🔒 Security & Ethics

### Educational Purpose Only

⚠️ **IMPORTANT**: Yashika OS is a **simulation** for educational purposes. All security tools and commands are **simulated** - they do not perform actual attacks or penetration testing.

### Ethical Guidelines

- Use knowledge gained responsibly
- Only test systems you own or have permission to test
- Never use real hacking tools maliciously
- Respect privacy and data protection laws
- Report vulnerabilities responsibly

### Simulated Features

All security features in Yashika OS are **simulations**:
- Network scans show pre-programmed results
- "Attack" tools demonstrate concepts, not real exploits
- No actual network traffic is generated
- No real systems are accessed or compromised

---

## 🛣️ Roadmap

### Upcoming Features

- [ ] **Multiplayer Mode** - Collaborate with others in shared sessions
- [ ] **Achievement System** - Gamify the learning experience
- [ ] **Tutorial Mode** - Guided walkthroughs for beginners
- [ ] **More Applications** - Email client, calendar, calculator
- [ ] **Plugin System** - Extend functionality with custom apps
- [ ] **Cloud Sync** - Save files across devices
- [ ] **Mobile Support** - Touch-optimized interface
- [ ] **AI Code Editor** - Enhanced coding assistance
- [ ] **Virtual Machines** - Multi-OS simulation
- [ ] **Community Challenges** - CTF-style security puzzles

### Performance Improvements

- [ ] Service Workers for offline support
- [ ] IndexedDB for larger file storage
- [ ] WebAssembly for compute-intensive tasks
- [ ] Progressive Web App (PWA) support

---

## 🤝 Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write TypeScript with proper types
- Test your changes thoroughly
- Update documentation as needed
- Keep commits atomic and well-described

### Ideas for Contributions

- 🐛 **Bug Fixes** - Report or fix issues
- ✨ **New Applications** - Add creative apps
- 🎨 **UI Improvements** - Enhance visual design
- 📝 **Documentation** - Improve guides and comments
- 🌍 **Localization** - Add language support
- ♿ **Accessibility** - Make it usable for everyone

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ayush Upadhyay**

- GitHub: [@Ayushdevx](https://github.com/Ayushdevx)
- Portfolio: [Your Portfolio URL]
- LinkedIn: [Your LinkedIn]
- Twitter: [Your Twitter]

---

## 🙏 Acknowledgments

### Inspiration
- **Kali Linux** - The world's leading penetration testing platform
- **Ubuntu** - Desktop environment design patterns
- **Windows 11** - Modern UI/UX inspiration

### Technologies
- **React Team** - For the amazing framework
- **Vite Team** - For the blazing-fast build tool
- **Lucide** - For beautiful, consistent icons
- **Google** - For Gemini AI integration

### Community
- All contributors who help improve this project
- The open-source community for tools and libraries
- Cybersecurity educators sharing knowledge

---

## 📞 Support

### Getting Help

- 📖 **Documentation** - Check this README and code comments
- 🐛 **Issues** - [Open an issue](https://github.com/Ayushdevx/yashika-Os/issues) for bugs
- 💬 **Discussions** - [Join discussions](https://github.com/Ayushdevx/yashika-Os/discussions) for questions
- 📧 **Email** - Reach out directly for urgent matters

### FAQ

**Q: Is this a real operating system?**  
A: No, it's a web-based simulator that runs in your browser. It mimics OS functionality using web technologies.

**Q: Can I run actual penetration tests with this?**  
A: No, all security tools are simulated for educational purposes only. Use real tools in authorized environments.

**Q: Does it work offline?**  
A: The core features work offline, but AI features require an internet connection.

**Q: Can I customize or extend it?**  
A: Absolutely! Fork the project and add your own applications and features.

**Q: What browsers are supported?**  
A: Modern browsers (Chrome, Firefox, Edge, Safari) with JavaScript enabled.

---

## 🌟 Star History

If you find Yashika OS useful, please consider giving it a star! ⭐

It helps others discover the project and motivates continued development.

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/Ayushdevx/yashika-Os?style=social)
![GitHub forks](https://img.shields.io/github/forks/Ayushdevx/yashika-Os?style=social)
![GitHub issues](https://img.shields.io/github/issues/Ayushdevx/yashika-Os)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Ayushdevx/yashika-Os)

---

<div align="center">

### 🚀 Built with passion and ❤️ for the cybersecurity and web development communities

**[⬆ Back to Top](#-yashika-os)**

</div>
