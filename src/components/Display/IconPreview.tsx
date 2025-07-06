import React, { useState, useMemo } from 'react';
import { useDesignSystem } from '@/contexts/DesignSystemContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink } from 'lucide-react';

// Import icons from each library
import * as LucideIcons from 'lucide-react';
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as TablerIcons from '@tabler/icons-react';

// Define curated icon sets for each library
const iconSets = {
  lucide: {
    Home: LucideIcons.Home,
    Search: LucideIcons.Search,
    Settings: LucideIcons.Settings,
    User: LucideIcons.User,
    Mail: LucideIcons.Mail,
    Calendar: LucideIcons.Calendar,
    Clock: LucideIcons.Clock,
    Phone: LucideIcons.Phone,
    Camera: LucideIcons.Camera,
    Image: LucideIcons.Image,
    Video: LucideIcons.Video,
    Music: LucideIcons.Music,
    Heart: LucideIcons.Heart,
    Star: LucideIcons.Star,
    Flag: LucideIcons.Flag,
    Bookmark: LucideIcons.Bookmark,
    Eye: LucideIcons.Eye,
    EyeOff: LucideIcons.EyeOff,
    Lock: LucideIcons.Lock,
    Unlock: LucideIcons.Unlock,
    Key: LucideIcons.Key,
    Download: LucideIcons.Download,
    Upload: LucideIcons.Upload,
    Cloud: LucideIcons.Cloud,
    Sun: LucideIcons.Sun,
    Moon: LucideIcons.Moon,
    Zap: LucideIcons.Zap,
    Wifi: LucideIcons.Wifi,
    Battery: LucideIcons.Battery,
    Bluetooth: LucideIcons.Bluetooth,
    Printer: LucideIcons.Printer,
    Save: LucideIcons.Save,
    Trash: LucideIcons.Trash2,
    Edit: LucideIcons.Edit,
    Copy: LucideIcons.Copy,
    Paste: LucideIcons.Clipboard,
    Cut: LucideIcons.Scissors,
    Plus: LucideIcons.Plus,
    Minus: LucideIcons.Minus,
    X: LucideIcons.X,
    Check: LucideIcons.Check,
    ChevronLeft: LucideIcons.ChevronLeft,
    ChevronRight: LucideIcons.ChevronRight,
    ChevronUp: LucideIcons.ChevronUp,
    ChevronDown: LucideIcons.ChevronDown,
    ArrowLeft: LucideIcons.ArrowLeft,
    ArrowRight: LucideIcons.ArrowRight,
    ArrowUp: LucideIcons.ArrowUp,
    ArrowDown: LucideIcons.ArrowDown,
    RefreshCw: LucideIcons.RefreshCw,
    RotateCw: LucideIcons.RotateCw,
    Loader: LucideIcons.Loader,
    Globe: LucideIcons.Globe,
    Map: LucideIcons.Map,
    MapPin: LucideIcons.MapPin,
    Navigation: LucideIcons.Navigation,
    Compass: LucideIcons.Compass,
    Mic: LucideIcons.Mic,
    MicOff: LucideIcons.MicOff,
    Volume: LucideIcons.Volume2,
    VolumeX: LucideIcons.VolumeX,
    Play: LucideIcons.Play,
    Pause: LucideIcons.Pause,
    SkipForward: LucideIcons.SkipForward,
    SkipBack: LucideIcons.SkipBack,
    FastForward: LucideIcons.FastForward,
    Rewind: LucideIcons.Rewind,
    Shuffle: LucideIcons.Shuffle,
    Repeat: LucideIcons.Repeat,
    Share: LucideIcons.Share2,
    Send: LucideIcons.Send,
    Link: LucideIcons.Link,
    Paperclip: LucideIcons.Paperclip,
    Bell: LucideIcons.Bell,
    BellOff: LucideIcons.BellOff,
    MessageSquare: LucideIcons.MessageSquare,
    MessageCircle: LucideIcons.MessageCircle,
    ShoppingCart: LucideIcons.ShoppingCart,
    ShoppingBag: LucideIcons.ShoppingBag,
    Package: LucideIcons.Package,
    Gift: LucideIcons.Gift,
    CreditCard: LucideIcons.CreditCard,
    DollarSign: LucideIcons.DollarSign,
    Percent: LucideIcons.Percent,
    Calculator: LucideIcons.Calculator,
    BarChart: LucideIcons.BarChart,
    TrendingUp: LucideIcons.TrendingUp,
    TrendingDown: LucideIcons.TrendingDown,
    PieChart: LucideIcons.PieChart,
    Activity: LucideIcons.Activity,
    Award: LucideIcons.Award,
    Trophy: LucideIcons.Trophy,
    Target: LucideIcons.Target,
    Cpu: LucideIcons.Cpu,
    HardDrive: LucideIcons.HardDrive,
    Server: LucideIcons.Server,
    Database: LucideIcons.Database,
    Code: LucideIcons.Code,
    Terminal: LucideIcons.Terminal,
    Command: LucideIcons.Command,
    GitBranch: LucideIcons.GitBranch,
    GitCommit: LucideIcons.GitCommit,
    GitMerge: LucideIcons.GitMerge,
    GitPullRequest: LucideIcons.GitPullRequest,
    Github: LucideIcons.Github,
    Gitlab: LucideIcons.Gitlab,
    Twitter: LucideIcons.Twitter,
    Facebook: LucideIcons.Facebook,
    Instagram: LucideIcons.Instagram,
    Linkedin: LucideIcons.Linkedin,
    Youtube: LucideIcons.Youtube,
    Twitch: LucideIcons.Twitch,
    Chrome: LucideIcons.Chrome,
    Figma: LucideIcons.Figma,
    Framer: LucideIcons.Framer,
    Layers: LucideIcons.Layers,
    Layout: LucideIcons.Layout,
    Grid: LucideIcons.Grid,
    Columns: LucideIcons.Columns,
    FileText: LucideIcons.FileText,
    File: LucideIcons.File,
    Folder: LucideIcons.Folder,
    FolderOpen: LucideIcons.FolderOpen,
    Archive: LucideIcons.Archive,
    Inbox: LucideIcons.Inbox,
    Filter: LucideIcons.Filter,
    ZoomIn: LucideIcons.ZoomIn,
    ZoomOut: LucideIcons.ZoomOut,
    Menu: LucideIcons.Menu,
    AlignLeft: LucideIcons.AlignLeft,
    AlignCenter: LucideIcons.AlignCenter,
    AlignRight: LucideIcons.AlignRight,
    Bold: LucideIcons.Bold,
    Italic: LucideIcons.Italic,
    Type: LucideIcons.Type,
    Palette: LucideIcons.Palette,
    Shield: LucideIcons.Shield,
    AlertCircle: LucideIcons.AlertCircle,
    Info: LucideIcons.Info,
    HelpCircle: LucideIcons.HelpCircle,
    CheckCircle: LucideIcons.CheckCircle,
    LogIn: LucideIcons.LogIn,
    LogOut: LucideIcons.LogOut,
    Users: LucideIcons.Users,
    Building: LucideIcons.Building,
    Briefcase: LucideIcons.Briefcase,
    Coffee: LucideIcons.Coffee,
    Smile: LucideIcons.Smile,
    ThumbsUp: LucideIcons.ThumbsUp
  },
  heroicons: {
    HomeIcon: HeroiconsOutline.HomeIcon,
    MagnifyingGlassIcon: HeroiconsOutline.MagnifyingGlassIcon,
    Cog6ToothIcon: HeroiconsOutline.Cog6ToothIcon,
    UserIcon: HeroiconsOutline.UserIcon,
    EnvelopeIcon: HeroiconsOutline.EnvelopeIcon,
    CalendarIcon: HeroiconsOutline.CalendarIcon,
    ClockIcon: HeroiconsOutline.ClockIcon,
    PhoneIcon: HeroiconsOutline.PhoneIcon,
    CameraIcon: HeroiconsOutline.CameraIcon,
    PhotoIcon: HeroiconsOutline.PhotoIcon,
    VideoCameraIcon: HeroiconsOutline.VideoCameraIcon,
    MusicalNoteIcon: HeroiconsOutline.MusicalNoteIcon,
    HeartIcon: HeroiconsOutline.HeartIcon,
    StarIcon: HeroiconsOutline.StarIcon,
    FlagIcon: HeroiconsOutline.FlagIcon,
    BookmarkIcon: HeroiconsOutline.BookmarkIcon,
    EyeIcon: HeroiconsOutline.EyeIcon,
    EyeSlashIcon: HeroiconsOutline.EyeSlashIcon,
    LockClosedIcon: HeroiconsOutline.LockClosedIcon,
    LockOpenIcon: HeroiconsOutline.LockOpenIcon,
    KeyIcon: HeroiconsOutline.KeyIcon,
    ArrowDownTrayIcon: HeroiconsOutline.ArrowDownTrayIcon,
    ArrowUpTrayIcon: HeroiconsOutline.ArrowUpTrayIcon,
    CloudIcon: HeroiconsOutline.CloudIcon,
    SunIcon: HeroiconsOutline.SunIcon,
    MoonIcon: HeroiconsOutline.MoonIcon,
    BoltIcon: HeroiconsOutline.BoltIcon,
    WifiIcon: HeroiconsOutline.WifiIcon,
    Battery100Icon: HeroiconsOutline.Battery100Icon,
    PrinterIcon: HeroiconsOutline.PrinterIcon,
    DocumentDuplicateIcon: HeroiconsOutline.DocumentDuplicateIcon,
    ClipboardIcon: HeroiconsOutline.ClipboardIcon,
    ScissorsIcon: HeroiconsOutline.ScissorsIcon,
    PlusIcon: HeroiconsOutline.PlusIcon,
    MinusIcon: HeroiconsOutline.MinusIcon,
    XMarkIcon: HeroiconsOutline.XMarkIcon,
    CheckIcon: HeroiconsOutline.CheckIcon,
    ChevronLeftIcon: HeroiconsOutline.ChevronLeftIcon,
    ChevronRightIcon: HeroiconsOutline.ChevronRightIcon,
    ChevronUpIcon: HeroiconsOutline.ChevronUpIcon,
    ChevronDownIcon: HeroiconsOutline.ChevronDownIcon,
    ArrowLeftIcon: HeroiconsOutline.ArrowLeftIcon,
    ArrowRightIcon: HeroiconsOutline.ArrowRightIcon,
    ArrowUpIcon: HeroiconsOutline.ArrowUpIcon,
    ArrowDownIcon: HeroiconsOutline.ArrowDownIcon,
    ArrowPathIcon: HeroiconsOutline.ArrowPathIcon,
    GlobeAltIcon: HeroiconsOutline.GlobeAltIcon,
    MapIcon: HeroiconsOutline.MapIcon,
    MapPinIcon: HeroiconsOutline.MapPinIcon,
    MicrophoneIcon: HeroiconsOutline.MicrophoneIcon,
    SpeakerXMarkIcon: HeroiconsOutline.SpeakerXMarkIcon,
    SpeakerWaveIcon: HeroiconsOutline.SpeakerWaveIcon,
    PlayIcon: HeroiconsOutline.PlayIcon,
    PauseIcon: HeroiconsOutline.PauseIcon,
    ForwardIcon: HeroiconsOutline.ForwardIcon,
    BackwardIcon: HeroiconsOutline.BackwardIcon,
    ShareIcon: HeroiconsOutline.ShareIcon,
    PaperAirplaneIcon: HeroiconsOutline.PaperAirplaneIcon,
    LinkIcon: HeroiconsOutline.LinkIcon,
    PaperClipIcon: HeroiconsOutline.PaperClipIcon,
    BellIcon: HeroiconsOutline.BellIcon,
    BellSlashIcon: HeroiconsOutline.BellSlashIcon,
    ChatBubbleBottomCenterTextIcon: HeroiconsOutline.ChatBubbleBottomCenterTextIcon,
    ChatBubbleLeftIcon: HeroiconsOutline.ChatBubbleLeftIcon,
    ShoppingCartIcon: HeroiconsOutline.ShoppingCartIcon,
    ShoppingBagIcon: HeroiconsOutline.ShoppingBagIcon,
    GiftIcon: HeroiconsOutline.GiftIcon,
    CreditCardIcon: HeroiconsOutline.CreditCardIcon,
    CurrencyDollarIcon: HeroiconsOutline.CurrencyDollarIcon,
    CalculatorIcon: HeroiconsOutline.CalculatorIcon,
    ChartBarIcon: HeroiconsOutline.ChartBarIcon,
    ArrowTrendingUpIcon: HeroiconsOutline.ArrowTrendingUpIcon,
    ArrowTrendingDownIcon: HeroiconsOutline.ArrowTrendingDownIcon,
    ChartPieIcon: HeroiconsOutline.ChartPieIcon,
    TrophyIcon: HeroiconsOutline.TrophyIcon,
    CpuChipIcon: HeroiconsOutline.CpuChipIcon,
    ServerIcon: HeroiconsOutline.ServerIcon,
    CircleStackIcon: HeroiconsOutline.CircleStackIcon,
    CodeBracketIcon: HeroiconsOutline.CodeBracketIcon,
    CommandLineIcon: HeroiconsOutline.CommandLineIcon,
    DocumentTextIcon: HeroiconsOutline.DocumentTextIcon,
    DocumentIcon: HeroiconsOutline.DocumentIcon,
    FolderIcon: HeroiconsOutline.FolderIcon,
    FolderOpenIcon: HeroiconsOutline.FolderOpenIcon,
    ArchiveBoxIcon: HeroiconsOutline.ArchiveBoxIcon,
    InboxIcon: HeroiconsOutline.InboxIcon,
    FunnelIcon: HeroiconsOutline.FunnelIcon,
    MagnifyingGlassPlusIcon: HeroiconsOutline.MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon: HeroiconsOutline.MagnifyingGlassMinusIcon,
    Bars3Icon: HeroiconsOutline.Bars3Icon,
    PaintBrushIcon: HeroiconsOutline.PaintBrushIcon,
    SparklesIcon: HeroiconsOutline.SparklesIcon,
    ShieldCheckIcon: HeroiconsOutline.ShieldCheckIcon,
    ShieldExclamationIcon: HeroiconsOutline.ShieldExclamationIcon,
    ExclamationCircleIcon: HeroiconsOutline.ExclamationCircleIcon,
    InformationCircleIcon: HeroiconsOutline.InformationCircleIcon,
    QuestionMarkCircleIcon: HeroiconsOutline.QuestionMarkCircleIcon,
    CheckCircleIcon: HeroiconsOutline.CheckCircleIcon,
    ArrowLeftOnRectangleIcon: HeroiconsOutline.ArrowLeftOnRectangleIcon,
    ArrowRightOnRectangleIcon: HeroiconsOutline.ArrowRightOnRectangleIcon,
    UserGroupIcon: HeroiconsOutline.UserGroupIcon,
    BuildingOfficeIcon: HeroiconsOutline.BuildingOfficeIcon,
    BriefcaseIcon: HeroiconsOutline.BriefcaseIcon,
    FaceSmileIcon: HeroiconsOutline.FaceSmileIcon,
    HandThumbUpIcon: HeroiconsOutline.HandThumbUpIcon
  },
  tabler: {
    IconHome: TablerIcons.IconHome,
    IconSearch: TablerIcons.IconSearch,
    IconSettings: TablerIcons.IconSettings,
    IconUser: TablerIcons.IconUser,
    IconMail: TablerIcons.IconMail,
    IconCalendar: TablerIcons.IconCalendar,
    IconClock: TablerIcons.IconClock,
    IconPhone: TablerIcons.IconPhone,
    IconCamera: TablerIcons.IconCamera,
    IconPhoto: TablerIcons.IconPhoto,
    IconVideo: TablerIcons.IconVideo,
    IconMusic: TablerIcons.IconMusic,
    IconHeart: TablerIcons.IconHeart,
    IconStar: TablerIcons.IconStar,
    IconFlag: TablerIcons.IconFlag,
    IconBookmark: TablerIcons.IconBookmark,
    IconEye: TablerIcons.IconEye,
    IconEyeOff: TablerIcons.IconEyeOff,
    IconLock: TablerIcons.IconLock,
    IconLockOpen: TablerIcons.IconLockOpen,
    IconKey: TablerIcons.IconKey,
    IconDownload: TablerIcons.IconDownload,
    IconUpload: TablerIcons.IconUpload,
    IconCloud: TablerIcons.IconCloud,
    IconSun: TablerIcons.IconSun,
    IconMoon: TablerIcons.IconMoon,
    IconBolt: TablerIcons.IconBolt,
    IconWifi: TablerIcons.IconWifi,
    IconBattery: TablerIcons.IconBattery,
    IconBluetooth: TablerIcons.IconBluetooth,
    IconPrinter: TablerIcons.IconPrinter,
    IconDeviceFloppy: TablerIcons.IconDeviceFloppy,
    IconTrash: TablerIcons.IconTrash,
    IconEdit: TablerIcons.IconEdit,
    IconCopy: TablerIcons.IconCopy,
    IconClipboard: TablerIcons.IconClipboard,
    IconCut: TablerIcons.IconCut,
    IconPlus: TablerIcons.IconPlus,
    IconMinus: TablerIcons.IconMinus,
    IconX: TablerIcons.IconX,
    IconCheck: TablerIcons.IconCheck,
    IconChevronLeft: TablerIcons.IconChevronLeft,
    IconChevronRight: TablerIcons.IconChevronRight,
    IconChevronUp: TablerIcons.IconChevronUp,
    IconChevronDown: TablerIcons.IconChevronDown,
    IconArrowLeft: TablerIcons.IconArrowLeft,
    IconArrowRight: TablerIcons.IconArrowRight,
    IconArrowUp: TablerIcons.IconArrowUp,
    IconArrowDown: TablerIcons.IconArrowDown,
    IconRefresh: TablerIcons.IconRefresh,
    IconRotate: TablerIcons.IconRotate,
    IconLoader: TablerIcons.IconLoader,
    IconWorld: TablerIcons.IconWorld,
    IconMap: TablerIcons.IconMap,
    IconMapPin: TablerIcons.IconMapPin,
    IconCompass: TablerIcons.IconCompass,
    IconMicrophone: TablerIcons.IconMicrophone,
    IconMicrophoneOff: TablerIcons.IconMicrophoneOff,
    IconVolume: TablerIcons.IconVolume,
    IconVolumeOff: TablerIcons.IconVolumeOff,
    IconPlayerPlay: TablerIcons.IconPlayerPlay,
    IconPlayerPause: TablerIcons.IconPlayerPause,
    IconPlayerSkipForward: TablerIcons.IconPlayerSkipForward,
    IconPlayerSkipBack: TablerIcons.IconPlayerSkipBack,
    IconShare: TablerIcons.IconShare,
    IconSend: TablerIcons.IconSend,
    IconLink: TablerIcons.IconLink,
    IconPaperclip: TablerIcons.IconPaperclip,
    IconBell: TablerIcons.IconBell,
    IconBellOff: TablerIcons.IconBellOff,
    IconMessage: TablerIcons.IconMessage,
    IconMessageCircle: TablerIcons.IconMessageCircle,
    IconShoppingCart: TablerIcons.IconShoppingCart,
    IconShoppingBag: TablerIcons.IconShoppingBag,
    IconPackage: TablerIcons.IconPackage,
    IconGift: TablerIcons.IconGift,
    IconCreditCard: TablerIcons.IconCreditCard,
    IconCurrencyDollar: TablerIcons.IconCurrencyDollar,
    IconPercentage: TablerIcons.IconPercentage,
    IconCalculator: TablerIcons.IconCalculator,
    IconChartBar: TablerIcons.IconChartBar,
    IconTrendingUp: TablerIcons.IconTrendingUp,
    IconTrendingDown: TablerIcons.IconTrendingDown,
    IconChartPie: TablerIcons.IconChartPie,
    IconActivity: TablerIcons.IconActivity,
    IconAward: TablerIcons.IconAward,
    IconTrophy: TablerIcons.IconTrophy,
    IconTarget: TablerIcons.IconTarget,
    IconCpu: TablerIcons.IconCpu,
    IconDeviceDesktop: TablerIcons.IconDeviceDesktop,
    IconServer: TablerIcons.IconServer,
    IconDatabase: TablerIcons.IconDatabase,
    IconCode: TablerIcons.IconCode,
    IconTerminal: TablerIcons.IconTerminal,
    IconCommand: TablerIcons.IconCommand,
    IconGitBranch: TablerIcons.IconGitBranch,
    IconGitCommit: TablerIcons.IconGitCommit,
    IconGitMerge: TablerIcons.IconGitMerge,
    IconGitPullRequest: TablerIcons.IconGitPullRequest,
    IconBrandGithub: TablerIcons.IconBrandGithub,
    IconBrandGitlab: TablerIcons.IconBrandGitlab,
    IconBrandTwitter: TablerIcons.IconBrandTwitter,
    IconBrandFacebook: TablerIcons.IconBrandFacebook,
    IconBrandInstagram: TablerIcons.IconBrandInstagram,
    IconBrandLinkedin: TablerIcons.IconBrandLinkedin,
    IconBrandYoutube: TablerIcons.IconBrandYoutube,
    IconBrandChrome: TablerIcons.IconBrandChrome,
    IconBrandFigma: TablerIcons.IconBrandFigma,
    IconLayers: TablerIcons.IconStack,
    IconLayout: TablerIcons.IconLayout,
    IconGridDots: TablerIcons.IconGridDots,
    IconColumns: TablerIcons.IconColumns,
    IconLayoutSidebar: TablerIcons.IconLayoutSidebar,
    IconSquare: TablerIcons.IconSquare,
    IconCircle: TablerIcons.IconCircle,
    IconTriangle: TablerIcons.IconTriangle,
    IconHexagon: TablerIcons.IconHexagon,
    IconFileText: TablerIcons.IconFileText,
    IconFile: TablerIcons.IconFile,
    IconFolder: TablerIcons.IconFolder,
    IconFolderOpen: TablerIcons.IconFolderOpen,
    IconArchive: TablerIcons.IconArchive,
    IconInbox: TablerIcons.IconInbox,
    IconFilter: TablerIcons.IconFilter,
    IconZoomIn: TablerIcons.IconZoomIn,
    IconZoomOut: TablerIcons.IconZoomOut,
    IconMenu: TablerIcons.IconMenu,
    IconAlignLeft: TablerIcons.IconAlignLeft,
    IconAlignCenter: TablerIcons.IconAlignCenter,
    IconAlignRight: TablerIcons.IconAlignRight,
    IconBold: TablerIcons.IconBold,
    IconItalic: TablerIcons.IconItalic,
    IconTypography: TablerIcons.IconTypography,
    IconPalette: TablerIcons.IconPalette,
    IconShield: TablerIcons.IconShield,
    IconAlertCircle: TablerIcons.IconAlertCircle,
    IconInfoCircle: TablerIcons.IconInfoCircle,
    IconHelp: TablerIcons.IconHelp,
    IconCircleCheck: TablerIcons.IconCircleCheck,
    IconLogin: TablerIcons.IconLogin,
    IconLogout: TablerIcons.IconLogout,
    IconUsers: TablerIcons.IconUsers,
    IconBuilding: TablerIcons.IconBuilding,
    IconBriefcase: TablerIcons.IconBriefcase,
    IconCoffee: TablerIcons.IconCoffee,
    IconMoodSmile: TablerIcons.IconMoodSmile,
    IconThumbUp: TablerIcons.IconThumbUp
  }
};

export const IconPreview: React.FC = () => {
  const { system } = useDesignSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const currentLibrary = system.iconLibrary || 'lucide';

  // Get the appropriate icon set, fallback to lucide if not available
  const iconSet = iconSets[currentLibrary] || iconSets.lucide;

  // Check if this is Nucleo (which doesn't have preview icons yet)
  const isNucleoSelected = currentLibrary === 'nucleo';

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return Object.entries(iconSet);
    
    return Object.entries(iconSet).filter(([name]) => 
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [iconSet, searchQuery]);

  return (
    <div>
      {isNucleoSelected ? (
        // Special message for Nucleo since we don't have preview icons yet
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 40 40">
                <g fill="currentColor">
                  <path fill="var(--color-contrast-low)"
                      d="M22.5 20a3.002 3.002 0 0 1-6 0 3.002 3.002 0 0 1 6 0z"></path>
                  <path id="logo-path-right"
                      d="M32.504 4.333a2.997 2.997 0 0 1 1.499 2.598v19.706a3.002 3.002 0 0 1-1.5 2.599l-4.005 2.312-8.998-5.195 5.5-3.176V0l7.504 4.333z"
                      fill="currentColor"></path>
                  <path id="logo-path-left"
                      d="M14.003 40V16.824l5.5-3.176-8.998-5.195L6.5 10.765A2.998 2.998 0 0 0 5 13.364V33.07a3 3 0 0 0 1.499 2.598L14.003 40z"
                      fill="currentColor"></path>
                </g>
              </svg>
            </div>
            <p className="text-muted-foreground mb-4">
              Nucleo is a premium icon library with over 31,000 icons. Preview icons are not available in this demo.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Visit Nucleo to browse their full collection and download icons for your projects.
            </p>
            <Button 
              onClick={() => window.open('https://nucleoapp.com/?ref=20331', '_blank')}
              className="inline-flex items-center gap-2"
            >
              Get Nucleo
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredIcons.map(([name, Icon]) => {
              const IconComponent = Icon as React.ComponentType<{ className?: string }>;
              return (
                <div
                  key={name}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border hover:bg-accent/5 hover:border-accent transition-colors cursor-pointer group"
                >
                  <IconComponent className="h-6 w-6 mb-2 text-foreground" />
                  <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">
                    {name.replace(/Icon|Icon$/g, '')}
                  </span>
                </div>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No icons found matching "{searchQuery}"</p>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredIcons.length} of {Object.keys(iconSet).length} icons
          </div>
        </>
      )}
    </div>
  );
}; 