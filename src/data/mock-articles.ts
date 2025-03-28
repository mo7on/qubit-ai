import { Article } from "@/types/article"
import { getArticlesFromDatabase } from "@/lib/database"

// Initial mock articles as fallback
export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Blue Screen of Death (BSOD) - Common Causes and Solutions",
    timestamp: new Date("2024-01-15T10:30:00"),
    description: "Understanding the infamous Windows BSOD error and how to resolve it",
    content: `The Blue Screen of Death (BSOD) is a critical system error that occurs when Windows encounters a problem it cannot recover from safely. This error typically appears as a blue screen with error messages and is often caused by:

• Faulty or incompatible device drivers
• Hardware malfunctions or conflicts
• Corrupted system files
• Memory (RAM) issues
• Overheating components

To resolve BSOD errors, follow these comprehensive solutions:

1. Update System Drivers:
   - Use Windows Device Manager to check for driver issues
   - Download latest drivers from manufacturer websites
   - Consider using driver update software

2. Check Hardware Components:
   - Run Windows Memory Diagnostic tool
   - Monitor system temperatures
   - Test hard drive health
   - Verify all components are properly connected

3. System File Maintenance:
   - Run 'sfc /scannow' in Command Prompt
   - Use DISM tool to repair Windows image
   - Check for and install Windows updates

4. Advanced Troubleshooting:
   - Review system event logs
   - Perform clean boot
   - Consider system restore if issues began recently
   - Scan for malware using updated security software`,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%230066cc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='3' width='20' height='14' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='8' y1='21' x2='16' y2='21'%3E%3C/line%3E%3Cline x1='12' y1='17' x2='12' y2='21'%3E%3C/line%3E%3C/svg%3E"
  },
  {
    id: "2",
    title: "Slow Computer Performance - Diagnosis and Optimization",
    timestamp: new Date("2024-01-14T15:45:00"),
    description: "Tips and tricks to speed up your sluggish computer",
    content: `Understanding Slow Computer Performance:

Slow computer performance can manifest in various ways and is often caused by multiple factors working together:

• High CPU and memory usage
• Fragmented or full hard drives
• Too many background processes
• Malware or viruses
• Outdated hardware or software

Comprehensive Solutions to Improve Performance:

1. System Resource Management:
   - Use Task Manager to identify resource-heavy processes
   - Disable unnecessary startup programs
   - Uninstall unused applications
   - Clear temporary files and browser cache

2. Storage Optimization:
   - Defragment HDD or optimize SSD
   - Use Disk Cleanup to remove unnecessary files
   - Move large files to external storage
   - Maintain at least 10% free space on system drive

3. Hardware Upgrades:
   - Upgrade RAM for better multitasking
   - Consider SSD for faster storage
   - Update graphics drivers
   - Check for failing hardware components

4. System Maintenance:
   - Regular malware scans
   - Keep Windows and drivers updated
   - Monitor system temperatures
   - Consider fresh Windows installation if issues persist`,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ff6b6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpolyline points='12 6 12 12 16 14'%3E%3C/polyline%3E%3C/svg%3E"
  },
  {
    id: "3",
    title: "Wi-Fi Connectivity Issues - Troubleshooting Guide",
    timestamp: new Date("2024-01-13T09:15:00"),
    description: "Resolving common Wi-Fi connection problems",
    content: `Common Wi-Fi Connectivity Issues:

Wi-Fi problems can be frustrating and may occur due to various factors:

• Weak or inconsistent signal strength
• Router configuration issues
• Network interference
• Hardware limitations
• ISP-related problems

Comprehensive Solutions:

1. Basic Troubleshooting:
   - Restart router and connected devices
   - Verify correct network selection
   - Check for physical obstructions
   - Test multiple devices to isolate the issue

2. Router Optimization:
   - Update router firmware
   - Choose optimal router placement
   - Configure proper channel settings
   - Set appropriate security protocols

3. Network Environment:
   - Identify and remove sources of interference
   - Use 5GHz band when possible
   - Consider mesh network system
   - Install Wi-Fi range extenders

4. Advanced Solutions:
   - Reset network adapter settings
   - Update network driver software
   - Contact ISP for line quality check
   - Consider hardware upgrades if needed`,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2300cc99' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.55a11 11 0 0 1 14.08 0'%3E%3C/path%3E%3Cpath d='M1.42 9a16 16 0 0 1 21.16 0'%3E%3C/path%3E%3Cpath d='M8.53 16.11a6 6 0 0 1 6.95 0'%3E%3C/path%3E%3Cline x1='12' y1='20' x2='12' y2='20'%3E%3C/line%3E%3C/svg%3E"
  },
  {
    id: "4",
    title: "Software Installation Errors - Common Solutions",
    timestamp: new Date("2024-01-12T14:20:00"),
    description: "Fixing typical software installation and compatibility issues",
    content: `Understanding Software Installation Errors:

Software installation failures can occur for various reasons:

• Insufficient system permissions
• Corrupted installation files
• System compatibility issues
• Conflicting applications
• Resource constraints

Systematic Solutions:

1. Pre-Installation Checks:
   - Verify system requirements
   - Check available disk space
   - Close conflicting applications
   - Disable antivirus temporarily

2. Installation Environment:
   - Run as administrator
   - Use compatibility mode if needed
   - Clear temporary files
   - Create system restore point

3. File and Permission Issues:
   - Verify file integrity (checksum)
   - Reset Windows Installer service
   - Check user account permissions
   - Repair corrupted system files

4. Advanced Troubleshooting:
   - Review installation logs
   - Clean boot installation
   - Use alternative installation methods
   - Contact software support if needed`,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ffd700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3C/svg%3E"
  },
  {
    id: "5",
    title: "Printer Not Working - Troubleshooting Steps",
    timestamp: new Date("2024-01-11T11:30:00"),
    description: "Solutions for common printer problems and errors",
    content: `Common Printer Problems:

Printer issues can arise from multiple sources:

• Connection problems (USB/Network)
• Driver conflicts or outdated drivers
• Hardware malfunctions
• Print queue issues
• Paper or ink problems

Comprehensive Solutions:

1. Basic Troubleshooting:
   - Check physical connections
   - Verify printer power and online status
   - Confirm paper and ink levels
   - Test printer self-diagnostic

2. Software Solutions:
   - Clear print queue
   - Update or reinstall printer drivers
   - Reset printer spooler service
   - Check default printer settings

3. Network Printer Issues:
   - Verify network connectivity
   - Check IP address configuration
   - Reset printer network settings
   - Update firmware if available

4. Hardware Maintenance:
   - Clean printer components
   - Check for paper jams
   - Align print heads
   - Service or replace worn parts`,
    imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23800080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 6 2 18 2 18 9'%3E%3C/polyline%3E%3Cpath d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'%3E%3C/path%3E%3Crect x='6' y='14' width='12' height='8'%3E%3C/rect%3E%3C/svg%3E"
  }
]

// Function to sync articles with backend
export async function syncArticlesWithBackend(): Promise<Article[]> {
  try {
    const backendArticles = await getArticlesFromDatabase();
    
    if (backendArticles && backendArticles.length > 0) {
      // Create a map of existing articles by ID for quick lookup
      const existingArticlesMap = new Map(
        mockArticles.map(article => [article.id, article])
      );
      
      // Add new articles from backend that don't exist in mockArticles
      backendArticles.forEach(article => {
        if (!existingArticlesMap.has(article.id)) {
          // Add default imageUrl for articles from database that don't have one
          mockArticles.push({
            ...article,
            imageUrl: (article as Article & { imageUrl?: string }).imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E"
          });
        }
      });
      
      console.log(`Synced ${backendArticles.length} articles from backend`);
    }
    
    return mockArticles;
  } catch (error) {
    console.error('Error syncing articles with backend:', error);
    return mockArticles; // Return existing mock articles on error
  }
}

// Initialize sync on module load
if (typeof window !== 'undefined') {
  syncArticlesWithBackend().catch(err => 
    console.error('Failed to initialize article sync:', err)
  );
}