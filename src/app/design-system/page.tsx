"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Loader2,
  Bold,
  Italic,
  Underline,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Layout,
  MousePointer2,
  FileText,
  List,
  CheckSquare,
  Circle,
  Radio,
  ChevronDown,
  Star,
  Heart,
  Home,
  Settings,
  User,
  Search,
  Bell,
  Mail,
  Calendar,
  Folder,
  File,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Save,
  X,
  Menu,
  MoreVertical,
  Copy,
  Link,
  ExternalLink,
  Moon,
  Sun,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

const SectionTitle = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="mb-8 border-b border-border pb-4">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-brand-primary/10">
        <Icon className="w-5 h-5 text-brand-primary" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
    </div>
    <p className="text-text-muted ml-11">{description}</p>
  </div>
);

const ColorSwatch = ({
  name,
  value,
  textColor = "text-text-primary",
}: {
  name: string;
  value: string;
  textColor?: string;
}) => (
  <div className="flex flex-col gap-2">
    <div
      className="w-full h-16 rounded-lg border border-border shadow-sm"
      style={{ backgroundColor: value }}
    />
    <div>
      <p className={`text-sm font-medium ${textColor}`}>{name}</p>
      <p className="text-xs text-text-muted font-mono">{value}</p>
    </div>
  </div>
);

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-bg-surface">
      {/* Header */}
      <div className="bg-brand-primary text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Design System</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">
            Dokumentasi lengkap pakem desain yang diterapkan dalam proyek ini.
            Gunakan sebagai referensi saat membangun komponen baru.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge className="bg-brand-accent text-brand-dark border-0">
              shadcn/ui
            </Badge>
            <Badge className="bg-white/20 border-0">Tailwind CSS</Badge>
            <Badge className="bg-white/20 border-0">Lucide Icons</Badge>
            <Badge className="bg-white/20 border-0">Radix UI</Badge>
            <Badge className="bg-white/20 border-0">CVA</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* ============================================ */}
        {/* BRAND COLORS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Palette}
            title="Brand Colors"
            description="Warna utama brand yang TIDAK BOLEH diubah. Digunakan untuk elemen branding utama."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ColorSwatch
              name="Brand Primary"
              value="#095540"
              textColor="text-white"
            />
            <ColorSwatch
              name="Brand Accent"
              value="#cdde00"
              textColor="text-text-primary"
            />
            <ColorSwatch
              name="Brand Dark"
              value="#053a2c"
              textColor="text-white"
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* SURFACE COLORS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Layout}
            title="Surface Colors"
            description="Warna latar belakang yang soft dan light, cocok untuk dashboard."
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <ColorSwatch name="Surface" value="#ffffff" />
            <ColorSwatch name="Surface Secondary" value="#fafafa" />
            <ColorSwatch name="Surface Muted" value="#f4f5f7" />
            <ColorSwatch name="Surface Hover" value="#f0f2f4" />
          </div>
        </section>

        {/* ============================================ */}
        {/* TEXT COLORS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={FileText}
            title="Text Colors"
            description="Warna teks dengan kontras yang nyaman. TIDAK menggunakan pure black (#000000)."
          />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            <ColorSwatch name="Text Primary" value="#1f2933" />
            <ColorSwatch name="Text Secondary" value="#3f4b56" />
            <ColorSwatch name="Text Muted" value="#6b7280" />
            <ColorSwatch name="Text Subtle" value="#9aa3ad" />
            <ColorSwatch
              name="Text Inverse"
              value="#ffffff"
              textColor="text-text-primary"
            />
          </div>
        </section>

        {/* ============================================ */}
        {/* BORDER COLORS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Layout}
            title="Border Colors"
            description="Warna border dengan soft contrast untuk elemen UI."
          />
          <div className="grid grid-cols-3 gap-6">
            <ColorSwatch name="Border Default" value="#e5e7eb" />
            <ColorSwatch name="Border Secondary" value="#d1d5db" />
            <ColorSwatch name="Border Focus" value="#3b82f6" />
          </div>
        </section>

        {/* ============================================ */}
        {/* STATUS COLORS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={AlertTriangle}
            title="Status Colors"
            description="Warna status yang soft dan tidak terlalu mencolok untuk feedback UI."
          />

          {/* Error */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-error mb-4">
              Error
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              <ColorSwatch name="Error Text" value="#e55353" />
              <ColorSwatch name="Error Text Dark" value="#cc3f3f" />
              <ColorSwatch name="Error Surface" value="#fdf3f3" />
              <ColorSwatch name="Error Border" value="#f6bcbc" />
              <ColorSwatch name="Error Darker" value="#a83434" />
            </div>
          </div>

          {/* Success */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-success mb-4">
              Success
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              <ColorSwatch name="Success Text" value="#1f8f4a" />
              <ColorSwatch name="Success Text Dark" value="#177a3f" />
              <ColorSwatch name="Success Surface" value="#f2fbf6" />
              <ColorSwatch name="Success Border" value="#c9f0d8" />
              <ColorSwatch name="Success Bg" value="#16a34a" />
            </div>
          </div>

          {/* Warning */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-warning mb-4">
              Warning
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ColorSwatch name="Warning Text" value="#c97a1c" />
              <ColorSwatch name="Warning Text Dark" value="#a96514" />
              <ColorSwatch name="Warning Surface" value="#fff8ec" />
              <ColorSwatch name="Warning Border" value="#f5dda3" />
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-lg font-semibold text-text-info mb-4">Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ColorSwatch name="Info Text" value="#2f6fe4" />
              <ColorSwatch name="Info Text Dark" value="#255cc2" />
              <ColorSwatch name="Info Surface" value="#f1f6fe" />
              <ColorSwatch name="Info Border" value="#c7dcfb" />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* TYPOGRAPHY */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Type}
            title="Typography"
            description="Skala tipografi untuk heading dan body text."
          />

          <div className="space-y-6 mb-8">
            <div className="p-4 rounded-lg border border-border bg-bg-surface-secondary">
              <div className="flex items-center gap-4 mb-2">
                <Heading1 className="w-5 h-5 text-text-muted" />
                <span className="text-xs text-text-muted font-mono">
                  text-4xl font-bold
                </span>
              </div>
              <h1 className="text-4xl font-bold text-text-primary">
                Heading 1 - 36px Bold
              </h1>
            </div>

            <div className="p-4 rounded-lg border border-border bg-bg-surface-secondary">
              <div className="flex items-center gap-4 mb-2">
                <Heading2 className="w-5 h-5 text-text-muted" />
                <span className="text-xs text-text-muted font-mono">
                  text-3xl font-semibold
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-text-primary">
                Heading 2 - 30px Semibold
              </h2>
            </div>

            <div className="p-4 rounded-lg border border-border bg-bg-surface-secondary">
              <div className="flex items-center gap-4 mb-2">
                <Heading3 className="w-5 h-5 text-text-muted" />
                <span className="text-xs text-text-muted font-mono">
                  text-2xl font-semibold
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary">
                Heading 3 - 24px Semibold
              </h3>
            </div>

            <div className="p-4 rounded-lg border border-border bg-bg-surface-secondary">
              <div className="flex items-center gap-4 mb-2">
                <Type className="w-5 h-5 text-text-muted" />
                <span className="text-xs text-text-muted font-mono">
                  text-base
                </span>
              </div>
              <p className="text-base text-text-secondary">
                Body text default - 16px. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-bg-surface-secondary">
              <div className="flex items-center gap-4 mb-2">
                <Type className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted font-mono">
                  text-sm
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Small text - 14px. Digunakan untuk deskripsi, caption, dan teks
                pendukung.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-bg-surface-secondary">
              <div className="flex items-center gap-4 mb-2">
                <Type className="w-3 h-3 text-text-muted" />
                <span className="text-xs text-text-muted font-mono">
                  text-xs
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Extra small text - 12px. Untuk label, hint text, dan metadata.
              </p>
            </div>
          </div>

          {/* Text Utilities */}
          <div className="p-6 rounded-lg border border-border bg-bg-surface-secondary">
            <h4 className="font-semibold mb-4 text-text-primary">
              Text Utilities
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Bold className="w-4 h-4 text-text-muted" />
                <span className="font-bold text-text-primary">Bold text</span>
              </div>
              <div className="flex items-center gap-3">
                <Italic className="w-4 h-4 text-text-muted" />
                <span className="italic text-text-primary">Italic text</span>
              </div>
              <div className="flex items-center gap-3">
                <Underline className="w-4 h-4 text-text-muted" />
                <span className="underline text-text-primary">
                  Underlined text
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-text-muted line-through">
                  Strikethrough text
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* BUTTONS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={MousePointer2}
            title="Buttons"
            description="Komponen tombol dengan berbagai varian dan ukuran menggunakan class-variance-authority (CVA)."
          />

          {/* Variants */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Variants
            </h3>
            <div className="flex flex-wrap gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Sizes
            </h3>
            <div className="flex flex-wrap items-center gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* States */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              States
            </h3>
            <div className="flex flex-wrap gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
              <Button>Normal</Button>
              <Button isLoading>Loading</Button>
              <Button isLoading loadingText="Saving...">
                Submit
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              With Icons
            </h3>
            <div className="flex flex-wrap gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
              <Button>
                <Plus className="w-4 h-4" />
                Add New
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
              <Button variant="secondary">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* BADGES */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={List}
            title="Badges"
            description="Badge untuk menampilkan status, tag, atau label kecil."
          />

          <div className="p-6 rounded-lg border border-border bg-bg-surface-secondary">
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CARDS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Layout}
            title="Cards"
            description="Container untuk mengelompokkan konten terkait."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>
                  Ini adalah deskripsi card yang menjelaskan isi konten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary">
                  Konten utama card ada di sini. Bisa berisi teks, gambar, tabel,
                  atau komponen lainnya.
                </p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button size="sm">Action</Button>
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card dengan Stats</CardTitle>
                <CardDescription>Contoh card untuk menampilkan statistik</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-bg-surface-secondary">
                    <p className="text-sm text-text-muted">Total Users</p>
                    <p className="text-2xl font-bold text-text-primary">1,234</p>
                  </div>
                  <div className="p-4 rounded-lg bg-bg-surface-secondary">
                    <p className="text-sm text-text-muted">Revenue</p>
                    <p className="text-2xl font-bold text-text-success">
                      Rp 12.5M
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ============================================ */}
        {/* ALERTS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={AlertCircle}
            title="Alerts"
            description="Komponen alert untuk menampilkan pesan penting kepada pengguna."
          />

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Ini adalah alert informasi default. Gunakan untuk pesan umum.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Terjadi kesalahan. Silakan periksa kembali input Anda.
              </AlertDescription>
            </Alert>

            {/* Custom styled alerts menggunakan CSS variables */}
            <div className="p-4 rounded-lg border border-border-success bg-bg-success-surface">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-success-dark">Success</h4>
                  <p className="text-sm text-text-success">
                    Operasi berhasil dilakukan dengan baik.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border-warning bg-bg-warning-surface">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-warning-dark">Warning</h4>
                  <p className="text-sm text-text-warning">
                    Hati-hati, ada yang perlu diperhatikan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FORM ELEMENTS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={FileText}
            title="Form Elements"
            description="Komponen form untuk input data pengguna."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary">Inputs</h3>

              <div className="space-y-2">
                <Label>Default Input</Label>
                <Input placeholder="Masukkan teks..." />
              </div>

              <div className="space-y-2">
                <Label>Input dengan Error</Label>
                <Input variant="error" placeholder="Error state..." />
                <p className="text-xs text-text-error">Field ini wajib diisi</p>
              </div>

              <div className="space-y-2">
                <Label>Input dengan Success</Label>
                <Input variant="success" placeholder="Success state..." />
                <p className="text-xs text-text-success">Validasi berhasil</p>
              </div>

              <div className="space-y-2">
                <Label>Sizes</Label>
                <div className="space-y-3">
                  <Input size="sm" placeholder="Small input" />
                  <Input size="md" placeholder="Medium input (default)" />
                  <Input size="lg" placeholder="Large input" />
                </div>
              </div>
            </div>

            {/* Textarea, Select, Checkbox, Radio */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Textarea</Label>
                <Textarea placeholder="Masukkan teks panjang..." rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Select</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih opsi..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Opsi 1</SelectItem>
                    <SelectItem value="option2">Opsi 2</SelectItem>
                    <SelectItem value="option3">Opsi 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Checkbox</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="check1" defaultChecked />
                    <Label htmlFor="check1">Checkbox checked</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="check2" />
                    <Label htmlFor="check2">Checkbox unchecked</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="radio1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="radio1" id="radio1" />
                    <Label htmlFor="radio1">Radio option 1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="radio2" id="radio2" />
                    <Label htmlFor="radio2">Radio option 2</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* ICONS */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Star}
            title="Icons"
            description="Menggunakan Lucide React sebagai library icon. Berikut adalah beberapa icon yang sering digunakan."
          />

          <div className="space-y-8">
            {/* Navigation Icons */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Navigation & Actions
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
                {[
                  { icon: Home, name: "Home" },
                  { icon: Settings, name: "Settings" },
                  { icon: User, name: "User" },
                  { icon: Search, name: "Search" },
                  { icon: Bell, name: "Bell" },
                  { icon: Mail, name: "Mail" },
                  { icon: Calendar, name: "Calendar" },
                  { icon: Folder, name: "Folder" },
                  { icon: File, name: "File" },
                  { icon: Plus, name: "Plus" },
                  { icon: Trash2, name: "Trash" },
                  { icon: Edit, name: "Edit" },
                  { icon: Eye, name: "Eye" },
                  { icon: Download, name: "Download" },
                  { icon: Upload, name: "Upload" },
                  { icon: Filter, name: "Filter" },
                ].map(({ icon: Icon, name }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-bg-surface-hover transition-colors"
                  >
                    <Icon className="w-6 h-6 text-text-primary" />
                    <span className="text-xs text-text-muted text-center">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* UI Icons */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                UI Controls
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
                {[
                  { icon: RefreshCw, name: "Refresh" },
                  { icon: Save, name: "Save" },
                  { icon: X, name: "Close" },
                  { icon: Menu, name: "Menu" },
                  { icon: MoreVertical, name: "More" },
                  { icon: Copy, name: "Copy" },
                  { icon: Link, name: "Link" },
                  { icon: ExternalLink, name: "External" },
                  { icon: Moon, name: "Moon" },
                  { icon: Sun, name: "Sun" },
                  { icon: ChevronDown, name: "Chevron" },
                  { icon: CheckSquare, name: "Check" },
                  { icon: Circle, name: "Circle" },
                  { icon: Radio, name: "Radio" },
                  { icon: Loader2, name: "Loader" },
                  { icon: Zap, name: "Zap" },
                ].map(({ icon: Icon, name }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-bg-surface-hover transition-colors"
                  >
                    <Icon className="w-6 h-6 text-text-primary" />
                    <span className="text-xs text-text-muted text-center">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Icons */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Dashboard & Business
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 p-6 rounded-lg border border-border bg-bg-surface-secondary">
                {[
                  { icon: Shield, name: "Shield" },
                  { icon: Clock, name: "Clock" },
                  { icon: TrendingUp, name: "Trending" },
                  { icon: Users, name: "Users" },
                  { icon: DollarSign, name: "Dollar" },
                  { icon: BarChart3, name: "Chart" },
                  { icon: Star, name: "Star" },
                  { icon: Heart, name: "Heart" },
                ].map(({ icon: Icon, name }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-bg-surface-hover transition-colors"
                  >
                    <Icon className="w-6 h-6 text-text-primary" />
                    <span className="text-xs text-text-muted text-center">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* DEPENDENCIES */}
        {/* ============================================ */}
        <section>
          <SectionTitle
            icon={Settings}
            title="Dependencies & Libraries"
            description="Daftar library dan dependensi yang digunakan dalam design system ini."
          />

          <div className="space-y-6">
            {/* UI Core */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">UI Core</CardTitle>
                <CardDescription>
                  Library utama untuk membangun komponen UI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      name: "shadcn/ui",
                      desc: "UI component library berbasis Radix UI",
                      version: "latest",
                    },
                    {
                      name: "Tailwind CSS",
                      desc: "Utility-first CSS framework",
                      version: "^3.4.0",
                    },
                    {
                      name: "Lucide React",
                      desc: "Icon library yang konsisten dan modern",
                      version: "^0.562.0",
                    },
                    {
                      name: "class-variance-authority",
                      desc: "Sistem variant untuk komponen",
                      version: "^0.7.1",
                    },
                    {
                      name: "clsx + tailwind-merge",
                      desc: "Utility untuk merge className",
                      version: "^3.4.0",
                    },
                    {
                      name: "tailwindcss-animate",
                      desc: "Plugin animasi untuk Tailwind",
                      version: "^1.0.7",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Radix UI Primitives */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Radix UI Primitives</CardTitle>
                <CardDescription>
                  Komponen aksesibel yang tidak styled (digunakan oleh shadcn/ui)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "@radix-ui/react-dialog",
                    "@radix-ui/react-popover",
                    "@radix-ui/react-dropdown-menu",
                    "@radix-ui/react-checkbox",
                    "@radix-ui/react-radio-group",
                    "@radix-ui/react-select",
                    "@radix-ui/react-toast",
                    "@radix-ui/react-tooltip",
                    "@radix-ui/react-collapsible",
                    "@radix-ui/react-separator",
                    "@radix-ui/react-slot",
                    "@radix-ui/react-avatar",
                    "@radix-ui/react-icons",
                  ].map((pkg) => (
                    <Badge key={pkg} variant="secondary">
                      {pkg.replace("@radix-ui/", "")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forms & Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Forms & Validation</CardTitle>
                <CardDescription>
                  Library untuk manajemen form dan validasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      name: "react-hook-form",
                      desc: "Form management performa tinggi",
                      version: "^7.70.0",
                    },
                    {
                      name: "@hookform/resolvers",
                      desc: "Resolver untuk validasi",
                      version: "^5.2.2",
                    },
                    {
                      name: "zod",
                      desc: "TypeScript-first schema validation",
                      version: "^4.3.5",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data & State */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Data & State Management</CardTitle>
                <CardDescription>
                  Library untuk data fetching, state, dan tabel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      name: "@tanstack/react-query",
                      desc: "Data fetching & caching",
                      version: "^5.90.19",
                    },
                    {
                      name: "zustand",
                      desc: "State management minimalis",
                      version: "^5.0.9",
                    },
                    {
                      name: "@tanstack/react-table",
                      desc: "Headless table library",
                      version: "^8.21.3",
                    },
                    {
                      name: "@supabase/supabase-js",
                      desc: "Backend & database client",
                      version: "^2.89.0",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts & Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Charts & Visualization</CardTitle>
                <CardDescription>
                  Library untuk menampilkan grafik dan visualisasi data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      name: "recharts",
                      desc: "Chart library berbasis React",
                      version: "^2.15.4",
                    },
                    {
                      name: "echarts-for-react",
                      desc: "Wrapper Apache ECharts untuk React",
                      version: "^3.0.6",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rich Text & Date */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Rich Text & Date</CardTitle>
                <CardDescription>
                  Editor teks dan manipulasi tanggal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      name: "@tiptap/react",
                      desc: "Rich text editor framework",
                      version: "^3.15.3",
                    },
                    {
                      name: "date-fns",
                      desc: "Utility tanggal modern",
                      version: "^4.1.0",
                    },
                    {
                      name: "react-day-picker",
                      desc: "Komponen kalender",
                      version: "^9.13.2",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* PDF & Export */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">PDF & Export</CardTitle>
                <CardDescription>
                  Library untuk generate PDF dan export data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      name: "@react-pdf/renderer",
                      desc: "Generate PDF dengan React",
                      version: "^4.3.2",
                    },
                    {
                      name: "jspdf + html2canvas",
                      desc: "Konversi HTML ke PDF",
                      version: "^4.2.1",
                    },
                    {
                      name: "xlsx",
                      desc: "Baca/tulis file Excel",
                      version: "^0.18.5",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Framework</CardTitle>
                <CardDescription>
                  Framework dan runtime utama
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Next.js",
                      desc: "React framework untuk production",
                      version: "16.1.1",
                    },
                    {
                      name: "React",
                      desc: "UI library",
                      version: "19.2.3",
                    },
                    {
                      name: "TypeScript",
                      desc: "Type-safe JavaScript",
                      version: "^5",
                    },
                  ].map((lib) => (
                    <div
                      key={lib.name}
                      className="p-4 rounded-lg border border-border bg-bg-surface-secondary"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text-primary">
                          {lib.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lib.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted">{lib.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-border text-center text-text-muted text-sm">
          <p>Design System • Sistem RAB Next.js • {new Date().getFullYear()}</p>
          <p className="mt-1">
            Gunakan halaman ini sebagai referensi saat membangun komponen baru.
          </p>
        </div>
      </div>
    </div>
  );
}
