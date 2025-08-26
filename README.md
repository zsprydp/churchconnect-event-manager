# ChurchConnect Event Manager

A modern, Progressive Web App (PWA) for managing church events, announcements, and member engagement. Built with React.js and designed to work seamlessly on all devices with offline capabilities.

## ✨ Features

### 🚀 Progressive Web App (PWA)
- **Offline Support**: View events and announcements even without internet connection
- **Installable**: Add to home screen on mobile and desktop devices
- **Service Worker**: Intelligent caching for fast loading and offline functionality
- **Push Notifications**: Stay updated with event reminders and announcements
- **Responsive Design**: Optimized for all screen sizes and devices

### 📅 Calendar Integration
- **ICS Export**: Download individual events or bulk export all events
- **Quick Add**: One-click addition to Google Calendar, Outlook, and Apple Calendar
- **Standard Format**: Compatible with all major calendar applications
- **Bulk Operations**: Export multiple events at once

### 🎯 Core Functionality
- **Event Management**: Create, edit, and manage church events
- **Announcements**: Share important updates with the congregation
- **Member Engagement**: Track attendance and participation
- **Real-time Updates**: Live synchronization across devices

## 🛠️ Technology Stack

- **Frontend**: React.js 19.1.1 with modern hooks
- **PWA**: Service Worker, Web App Manifest, Offline caching
- **Styling**: CSS3 with responsive design and dark mode support
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Create React App with PWA optimizations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zsprydp/churchconnect-event-manager.git
   cd churchconnect-event-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

The build folder will contain your optimized PWA ready for deployment.

## 📱 PWA Features

### Offline Functionality
- Events and announcements are cached for offline viewing
- Automatic background sync when connection is restored
- Offline indicator shows connection status

### Installation
- **Mobile**: Tap "Add to Home Screen" in browser menu
- **Desktop**: Click the install button in the address bar
- **Automatic**: Browser will prompt when criteria are met

### Notifications
- Request permission for push notifications
- Receive event reminders and updates
- Customizable notification preferences

## 📅 Calendar Export

### Supported Formats
- **ICS Files**: Standard calendar format (.ics)
- **Google Calendar**: Direct integration
- **Outlook Calendar**: Microsoft 365 compatibility
- **Apple Calendar**: macOS and iOS support

### Usage
1. Navigate to any event
2. Click "Add to Calendar"
3. Choose your preferred calendar service
4. Event is automatically added with all details

### Bulk Export
- Export all events within a date range
- Perfect for sharing complete church calendars
- Maintains all event details and formatting

## 🎨 UI Components

### OfflineIndicator
- Shows connection status
- PWA installation prompts
- Cache management options
- Notification permission requests

### CalendarExport
- Expandable calendar options
- Multiple export formats
- Service-specific quick-add buttons
- Helpful information and tips

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
REACT_APP_VAPID_PRIVATE_KEY=your_vapid_private_key
```

### PWA Settings
- Service worker registration is automatic
- Cache strategies are configurable in `sw.js`
- Manifest settings in `public/manifest.json`

## 📱 Mobile Optimization

- **Touch-friendly**: Optimized for mobile devices
- **Responsive**: Adapts to all screen sizes
- **Fast Loading**: Optimized assets and caching
- **Native Feel**: PWA provides app-like experience

## 🌙 Dark Mode Support

- Automatic detection of system preferences
- Manual toggle option
- Consistent theming across all components
- High contrast mode support

## ♿ Accessibility

- **Screen Reader**: Full ARIA support
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Enhanced visibility options
- **Reduced Motion**: Respects user preferences

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build Scripts

```bash
# Development
npm start

# Production build
npm run build

# Test build
npm test

# Eject (one-way operation)
npm run eject

# Clean and reinstall
npm run reinstall

# Fix common issues
npm run fix:install
```

## 🚀 Deployment

### Heroku
```bash
# Add Heroku remote
heroku git:remote -a your-app-name

# Deploy
git push heroku main
```

### Netlify
- Connect your GitHub repository
- Build command: `npm run build`
- Publish directory: `build`

### Vercel
- Import your GitHub repository
- Framework preset: Create React App
- Build command: `npm run build`

## 🔄 Upcoming Features

- **QR Code Check-in System**: Track event attendance
- **Recurring Events**: Manage repeating church activities
- **Email Notifications**: Automated event reminders
- **Analytics Dashboard**: Insights into member engagement
- **Role-Based Access Control**: Secure permission system
- **Enhanced Search**: Full-text search and filtering
- **Batch Operations**: Bulk member and event management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Icons from [Lucide React](https://lucide.dev/)
- PWA guidance from [Web.dev](https://web.dev/progressive-web-apps/)

## 📞 Support

For support and questions:
- Create an [issue](https://github.com/zsprydp/churchconnect-event-manager/issues)
- Check the [troubleshooting guide](TROUBLESHOOTING.MD)
- Review [setup documentation](SETUP_SUMMARY.md)

---

**ChurchConnect Event Manager** - Making church event management simple, modern, and accessible. ✨
